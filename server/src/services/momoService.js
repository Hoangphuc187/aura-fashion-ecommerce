/**
 * MoMo Payment Service
 * Handles MoMo Sandbox payment requests with HMAC-SHA256 signature
 */

import crypto from 'crypto';

/**
 * Generate MoMo Payment URL (v2 and classic gateway)
 */
export const createMoMoPaymentUrl = async ({ orderCode, amount, orderInfo }) => {
  const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
  const accessKey = process.env.MOMO_ACCESS_KEY || '';
  const secretKey = process.env.MOMO_SECRET_KEY || '';
  const redirectUrl = process.env.MOMO_RETURN_URL || 'http://localhost:5000/api/payment/momo-return';
  const ipnUrl = process.env.MOMO_NOTIFY_URL || 'http://localhost:5000/api/payment/momo-ipn';
  const endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';

  const requestId = `AURA_${Date.now()}`;
  const strAmount = String(Math.round(amount));
  const cleanOrderInfo = orderInfo || `Thanh toan don hang AURA ${orderCode}`;
  const requestType = 'captureWallet';
  const extraData = '';

  // Standard MoMo v2 raw signature format
  const rawSignature = `accessKey=${accessKey}&amount=${strAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderCode}&orderInfo=${cleanOrderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount: strAmount,
    orderId: orderCode,
    orderInfo: cleanOrderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: 'vi',
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (data && (data.payUrl || data.shortLink)) {
      return {
        success: true,
        payUrl: data.payUrl || data.shortLink,
        qrCodeUrl: data.qrCodeUrl,
        deeplink: data.deeplink,
      };
    }

    console.warn('⚠️ MoMo Sandbox Gateway response:', data);
    return {
      success: false,
      message: data.message || 'Không thể tạo phiên thanh toán MoMo',
      payUrl: null,
    };
  } catch (error) {
    console.error('❌ MoMo Gateway connection error:', error.message);
    return {
      success: false,
      message: error.message,
      payUrl: null,
    };
  }
};

/**
 * Verify MoMo Return / IPN Signature
 */
export const verifyMoMoReturn = (params) => {
  const accessKey = process.env.MOMO_ACCESS_KEY || '';
  const secretKey = process.env.MOMO_SECRET_KEY || '';

  const {
    partnerCode = 'MOMO',
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData = '',
    signature,
  } = params;

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

  const checkSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const isSignatureValid = signature && signature.toLowerCase() === checkSignature.toLowerCase();
  const isSuccess = isSignatureValid && String(resultCode) === '0';

  return {
    isSignatureValid,
    isSuccess,
    orderCode: orderId,
    amount: Number(amount),
    transId,
    resultCode,
    message,
  };
};
