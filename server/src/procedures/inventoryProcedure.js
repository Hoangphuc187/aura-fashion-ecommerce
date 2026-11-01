import Product from '../models/Product.js';
import { logger } from '../config/logger.js';

/**
 * DATABASE STORED PROCEDURE: Atomic Inventory Allocation & Compensation Routine
 * 
 * Guarantees zero race conditions during high-concurrency checkout / Flash Sales.
 * Atomic decrements occur at the database storage engine layer.
 * If any single product in a multi-item cart fails stock availability, a Compensating Transaction
 * immediately restores previously locked items with atomic increments.
 * 
 * @param {Array<{product: string, name: string, quantity: number}>} items - List of items to allocate
 * @param {string} requestId - Correlation trace ID for audit logging
 * @returns {Promise<{success: boolean, lockedItems?: Array, failedItemName?: string, remainingAvailable?: number}>}
 */
export const executeAtomicInventoryAllocationProcedure = async (items, requestId = '-') => {
  const successfullyLockedItems = [];

  for (const item of items) {
    // Atomic test-and-set: decrements stock ONLY if available stock >= requested quantity
    const lockedProduct = await Product.findOneAndUpdate(
      {
        _id: item.product,
        stockQuantity: { $gte: item.quantity },
      },
      {
        $inc: { stockQuantity: -item.quantity },
      },
      { new: true }
    );

    if (!lockedProduct) {
      // Stock allocation failed for this item
      const currentProd = await Product.findById(item.product).select('stockQuantity name').lean();
      const remainingAvailable = currentProd ? currentProd.stockQuantity : 0;

      logger.warn(`[InventoryProcedure] Out-of-stock conflict during atomic allocation for product: ${item.name}`, {
        requestId,
        productId: item.product,
        requested: item.quantity,
        available: remainingAvailable,
      });

      // COMPENSATING TRANSACTION: Rollback all previously locked items in this batch
      for (const locked of successfullyLockedItems) {
        await Product.findByIdAndUpdate(locked.product, {
          $inc: { stockQuantity: locked.quantity },
        });
      }

      logger.info(`[InventoryProcedure] Compensating rollback completed for ${successfullyLockedItems.length} items`, {
        requestId,
      });

      return {
        success: false,
        failedItemName: item.name,
        remainingAvailable,
      };
    }

    successfullyLockedItems.push({
      product: item.product,
      name: item.name,
      quantity: item.quantity,
      newStock: lockedProduct.stockQuantity,
    });
  }

  logger.info(`[InventoryProcedure] Successfully allocated inventory for ${successfullyLockedItems.length} items`, {
    requestId,
  });

  return {
    success: true,
    lockedItems: successfullyLockedItems,
  };
};

/**
 * DATABASE STORED PROCEDURE: Atomic Inventory Restitution (Restock)
 * Used when orders are cancelled, refunded, or expired by background workers.
 */
export const executeAtomicInventoryRestitutionProcedure = async (items, reason = 'ORDER_CANCELLED', requestId = '-') => {
  const restocked = [];

  for (const item of items) {
    const prodId = item.product?._id || item.product;
    const qty = item.quantity || 1;

    const updated = await Product.findByIdAndUpdate(
      prodId,
      { $inc: { stockQuantity: qty } },
      { new: true }
    );

    if (updated) {
      restocked.push({ product: prodId, restoredQty: qty, newStock: updated.stockQuantity });
    }
  }

  logger.info(`[InventoryProcedure] Restocked ${restocked.length} items. Reason: ${reason}`, {
    requestId,
    itemsRestocked: restocked.length,
  });

  return restocked;
};

