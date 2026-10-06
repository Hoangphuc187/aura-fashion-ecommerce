/**
 * VNPay Payment Service (v2.1.0)
 * Handles VNPay Sandbox URL generation and HMAC-SHA512 checksum validation
 */

import crypto from 'crypto';

function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
}

/**
 * Generate VNPay Payment URL
 */
export const createVNPayPaymentUrl = ({ orderCode, amount, orderInfo, ipAddr }) => {
  const tmnCode = process.env.VNPAY_TMN_CODE || '';
  const secretKey = process.env.VNPAY_HASH_SECRET || '';
  let vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:5000/api/payment/vnpay-return';

  const date = new Date();
  const createDate = formatDate(date);

  const cleanIp = (ipAddr || '127.0.0.1').replace('::ffff:', '');
  const cleanOrderInfo = orderInfo || `Thanh toan don hang ${orderCode}`;

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderCode,
    vnp_OrderInfo: cleanOrderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(Number(amount) * 100),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: cleanIp,
    vnp_CreateDate: createDate,
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = Object.keys(vnp_Params)
    .map((key) => `${key}=${vnp_Params[key]}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  vnp_Params['vnp_SecureHash'] = signed;
  const queryString = Object.keys(vnp_Params)
    .map((key) => `${key}=${vnp_Params[key]}`)
    .join('&');

  return `${vnpUrl}?${queryString}`;
};

/**
 * Verify VNPay Return URL Parameters
 */
export const verifyVNPayReturn = (vnp_Params) => {
  const secretKey = process.env.VNPAY_HASH_SECRET || '';
  const secureHash = vnp_Params['vnp_SecureHash'];

  const cleanParams = { ...vnp_Params };
  delete cleanParams['vnp_SecureHash'];
  delete cleanParams['vnp_SecureHashType'];

  const sorted = sortObject(cleanParams);
  const signData = Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const checkHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const isSignatureValid = secureHash && secureHash.toLowerCase() === checkHash.toLowerCase();
  const isSuccess = isSignatureValid && vnp_Params['vnp_ResponseCode'] === '00';

  return {
    isSignatureValid,
    isSuccess,
    orderCode: vnp_Params['vnp_TxnRef'],
    amount: Number(vnp_Params['vnp_Amount']) / 100,
    responseCode: vnp_Params['vnp_ResponseCode'],
    transactionNo: vnp_Params['vnp_TransactionNo'],
    bankCode: vnp_Params['vnp_BankCode'],
  };
};
