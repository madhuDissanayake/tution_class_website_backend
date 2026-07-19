import crypto from 'crypto';

const md5 = (input) => crypto.createHash('md5').update(input).digest('hex').toUpperCase();

// Format amount to 2 decimal places as string, required by PayHere
export const formatAmount = (amount) => Number(amount).toFixed(2);

// Hash sent to the client for the checkout form
export const generateCheckoutHash = ({ merchantId, orderId, amount, currency, merchantSecret }) => {
  const amountFormatted = formatAmount(amount);
  const secretHash = md5(merchantSecret);
  return md5(`${merchantId}${orderId}${amountFormatted}${currency}${secretHash}`);
};

// Verify the signature PayHere sends to your notify_url (server-to-server)
export const verifyNotifyHash = ({
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  merchantSecret,
  md5sig
}) => {
  const secretHash = md5(merchantSecret);
  const localSig = md5(
    `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`
  );
  return localSig === md5sig;
};

export const generateOrderId = (prefix = 'TCH') =>
  `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;