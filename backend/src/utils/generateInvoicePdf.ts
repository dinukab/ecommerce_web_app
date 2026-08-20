import PDFDocument from "pdfkit";

export function generateInvoicePdf(order: any, userEmail: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);    

    // Header
    doc.fontSize(20).text("INVOICE", { align: "right" });
    doc.moveDown();
    // oyage schema eke thiyena auto-generate wena orderId eka
    doc.fontSize(10).text(`Order ID: ${order.orderId}`); 
    doc.text(`Date: ${new Date(order.createdAt).toDateString()}`);
    doc.text(`Customer: ${order.customerName}`);
    doc.text(`Email: ${userEmail}`); // Email eka param ekakin pass karanna
    doc.moveDown();    

    // Table header
    doc.fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.5);

    const items = order.items && order.items.length > 0 ? order.items : order.orderItems || [];
    items.forEach((item: any) => {
      // Currency eka Rs. kiyala wenas kara
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      doc.fontSize(10).text(
        `${item.name}  x${quantity}   Rs. ${price.toFixed(2)}   = Rs. ${(price * quantity).toFixed(2)}`
      );
    });

    doc.moveDown();
    // schema eke thiyena totalPrice field eka use kara
    const finalTotal = order.totalPrice || order.total || 0;
    doc.fontSize(12).text(`Total: Rs. ${finalTotal.toFixed(2)}`, { align: "right" });

    doc.end();
  });
}