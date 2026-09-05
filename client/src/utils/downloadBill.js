import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const brand = "TechCommerce";
const navy = [15, 23, 42];
const muted = [100, 116, 139];
const accent = [13, 148, 136];
const money = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function billDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return { display: "Not available", stamp: "undated" };
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date).map(({ type, value: part }) => [type, part]));
  return {
    display: `${parts.day}/${parts.month}/${parts.year}  ${parts.hour}:${parts.minute}:${parts.second} IST`,
    stamp: `${parts.year}-${parts.month}-${parts.day}_${parts.hour}-${parts.minute}-${parts.second}-IST`,
  };
}

export function billFilename(order) {
  const id = String(order._id || "order").replace(/[^a-zA-Z0-9_-]/g, "-");
  return `${brand}_Bill_${id}_${billDate(order.createdAt).stamp}.pdf`;
}

export function createBill(order) {
  const doc = new jsPDF();
  const id = String(order._id || "Unavailable");
  const date = billDate(order.createdAt);
  doc.setProperties({ title: `${brand} | Bill ${id}`, author: brand, subject: "Order bill" });
  const text = (value, x, y, size = 10, color = navy, bold = false, options = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(String(value), x, y, options);
  };
  const header = () => {
    doc.setFillColor(...navy);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFillColor(...accent);
    doc.rect(0, 40, 210, 2, "F");
    text(brand, 16, 21, 25, [255, 255, 255], true);
    text("Thoughtful products. Everyday essentials.", 16, 30, 9, [203, 213, 225]);
    text("ORDER BILL", 194, 20, 14, [255, 255, 255], true, { align: "right" });
    text(`REF ${id.slice(-8).toUpperCase()}`, 194, 29, 10, [203, 213, 225], false, { align: "right" });
  };
  header();
  text("ORDER ID", 16, 53, 8, muted, true);
  text(id, 16, 60, 10, navy, true);
  text("ORDER DATE & TIME", 115, 53, 8, muted, true);
  text(date.display, 115, 60, 10);

  const address = order.shippingAddress || {};
  const addressText = [address.fullName, address.line1,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.phone ? `Phone: ${address.phone}` : ""].filter(Boolean).join("\n");
  autoTable(doc, {
    startY: 70, margin: { left: 16, right: 16, top: 50, bottom: 22 },
    theme: "plain", head: [["CUSTOMER / SHIPPING ADDRESS", "PAYMENT DETAILS"]],
    body: [[addressText, [
      `Method: ${order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod || "Unavailable"}`,
      `Payment status: ${order.paymentStatus || "PENDING"}`,
      `Order status: ${order.status || "PENDING"}`,
    ].join("\n")]],
    styles: { font: "helvetica", fontSize: 10, cellPadding: 5, textColor: navy, fillColor: [248, 250, 252], overflow: "linebreak" },
    headStyles: { fontSize: 8, textColor: muted, fontStyle: "bold", cellPadding: { top: 5, bottom: 1, left: 5, right: 5 } },
    columnStyles: { 0: { cellWidth: 99 }, 1: { cellWidth: 79 } },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    margin: { left: 16, right: 16, top: 50, bottom: 22 },
    head: [["ITEM / DESCRIPTION", "QTY", "UNIT (INR)", "AMOUNT (INR)"]],
    body: (order.items || []).map((item, index) => [
      `${String(index + 1).padStart(2, "0")}   ${item.name}`, String(item.quantity), money(item.price), money(item.price * item.quantity),
    ]),
    theme: "plain", rowPageBreak: "avoid",
    styles: { font: "helvetica", fontSize: 10, cellPadding: 4, textColor: navy, overflow: "linebreak" },
    headStyles: { fillColor: navy, textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 83 }, 1: { cellWidth: 15, halign: "center" }, 2: { cellWidth: 38, halign: "right" }, 3: { cellWidth: 42, halign: "right", fontStyle: "bold" } },
  });

  let y = doc.lastAutoTable.finalY + 10;
  const pending = order.status !== "CANCELLED" && order.paymentMethod === "COD" && order.paymentStatus === "PENDING";
  if (y + (pending ? 76 : 57) > 275) { doc.addPage(); y = 54; }
  text("BILL SUMMARY", 112, y + 2, 8, muted, true);
  for (const [label, amount] of [["Subtotal", order.subtotal], ["Shipping", order.shipping], ["Tax", order.tax]]) {
    y += 9;
    text(label, 112, y + 2, 10, muted);
    text(money(amount), 190, y + 2, 10, navy, false, { align: "right" });
  }
  y += 8;
  doc.setFillColor(...accent);
  doc.roundedRect(108, y, 86, 16, 2, 2, "F");
  text("TOTAL (INR)", 112, y + 10, 9, [255, 255, 255], true);
  text(money(order.total), 190, y + 10, 14, [255, 255, 255], true, { align: "right" });
  if (pending) {
    y += 24;
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(16, y, 178, 13, 2, 2, "F");
    text("Payment due on delivery. Please keep the payable amount ready.", 21, y + 8, 9, [146, 64, 14]);
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    if (page > 1) header();
    doc.setDrawColor(226, 232, 240);
    doc.line(16, 280, 194, 280);
    text(`Thank you for shopping with ${brand}.`, 16, 287, 9, muted);
    text(`Page ${page} of ${pages}`, 194, 287, 8, muted, false, { align: "right" });
  }
  return doc;
}

export function downloadBill(order) {
  createBill(order).save(billFilename(order));
}
