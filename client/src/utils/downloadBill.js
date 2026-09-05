import { jsPDF } from "jspdf";

export function createBill(order) {
  const doc = new jsPDF();
  const money = (value) => `INR ${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  let y = 22;
  const line = (text, size = 11) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(String(text), 170);
    for (const part of lines) {
      if (y > 275) {
        doc.addPage();
        y = 22;
      }
      doc.text(part, 20, y);
      y += size === 20 ? 10 : 6;
    }
  };

  line("Order bill", 20);
  line(`Order: ${order._id}`);
  line(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`);
  line(`Order status: ${order.status}`);
  line(`Payment: ${order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}`);
  line(`Payment status: ${order.paymentStatus}`);
  y += 6;
  line("Customer / Shipping address", 14);
  const address = order.shippingAddress;
  line(address.fullName);
  line(address.line1);
  line(`${address.city}, ${address.state} - ${address.postalCode}`);
  line(`Phone: ${address.phone}`);
  y += 6;
  line("Items", 14);
  order.items.forEach((item, index) => {
    line(`${index + 1}. ${item.name}`);
    line(`${item.quantity} x ${money(item.price)} = ${money(item.price * item.quantity)}`);
    y += 3;
  });
  y += 4;
  line(`Subtotal: ${money(order.subtotal)}`);
  line(`Shipping: ${money(order.shipping)}`);
  line(`Tax: ${money(order.tax)}`);
  line(`Total: ${money(order.total)}`, 14);
  if (order.paymentMethod === "COD" && order.paymentStatus === "PENDING") {
    y += 4;
    line("Payment is due on delivery.");
  }
  return doc;
}

export function downloadBill(order) {
  createBill(order).save(`bill-${order._id}.pdf`);
}
