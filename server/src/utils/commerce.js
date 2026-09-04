const ORDER_TRANSITIONS = Object.freeze({
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
});
const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 1999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
};
const canTransition = (current, next) => ORDER_TRANSITIONS[current]?.includes(next) || false;
module.exports = { ORDER_TRANSITIONS, calculateTotals, canTransition };
