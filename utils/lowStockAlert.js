// Simple low stock alert utility
// You can expand this to send emails or other notifications later

const sendLowStockNotification = (product) => {
  console.log(`LOW STOCK ALERT: ${product.name} has only ${product.stock} units left (min: ${product.minStock})`);
  // Add email notification or other alert mechanisms here
};

module.exports = { sendLowStockNotification };