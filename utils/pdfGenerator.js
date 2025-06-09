import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
  doc.pipe(res);

  const PAGE_WIDTH = doc.page.width;

  // === Header Section: Logo Left, Company Info Right ===
  const logoPath = path.resolve('assets', 'logo.jpg');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 10, { width: 100 });
  }

  // Company Info (right side)
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(invoice.firm, 150, 35, { align: 'right', width: PAGE_WIDTH - 170 });

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('199-A, Industrial Area, Nagjhiri, Dewas Naka, Ujjain', {
      align: 'right',
      width: PAGE_WIDTH - 170,
    })
    .text('Phone: 9229968725, 9131961431', {
      align: 'right',
      width: PAGE_WIDTH - 170,
    })
    .text('GSTIN: 23BMZPR0210H1Z1 | State Code: 23', {
      align: 'right',
      width: PAGE_WIDTH - 170,
    });

  doc.moveDown(3);

  // === Invoice Info ===
  doc.fontSize(12).font('Helvetica');
  doc.text(`Invoice No: ${invoice.invoiceNo}`, 50);
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, { align: 'right' });

  doc.moveDown(1.2);

  // === Helper Function for Styled Tables ===
  const drawDetailTable = (title, headers, rows, topY) => {
    const boxWidth = PAGE_WIDTH - 100;
    const startX = 50;
    let y = topY;

    doc
      .fontSize(12)
      .fillColor('#004d99')
      .font('Helvetica-Bold')
      .text(title, startX, y);

    y += 10;

    // Header Row
    doc
      .rect(startX, y, boxWidth, 20)
      .fillAndStroke('#e6f0ff', '#ccc');
    doc
      .fillColor('#000')
      .fontSize(10)
      .font('Helvetica-Bold');

    let colX = startX;
    const colWidth = boxWidth / headers.length;

    headers.forEach((header) => {
      doc.text(header, colX + 5, y + 5, { width: colWidth - 10 });
      colX += colWidth;
    });

    y += 20;

    // Data Row(s)
    doc.font('Helvetica');
    rows.forEach((row) => {
      colX = startX;
      row.forEach((cell) => {
        doc
          .rect(colX, y, colWidth, 18)
          .stroke('#ccc');
        doc.text(cell || '-', colX + 5, y + 5, { width: colWidth - 10 });
        colX += colWidth;
      });
      y += 18;
    });

    return y + 15;
  };

  // === Customer Details ===
  let currentY = doc.y;
  currentY = drawDetailTable(
    'Customer Details',
    ['Name', 'Address', 'GSTIN', 'State', 'State Code'],
    [[
      invoice.customer.name,
      invoice.customer.address,
      invoice.customer.gstin,
      invoice.customer.state,
      invoice.customer.stateCode
    ]],
    currentY
  );

  // === Transport Details ===
  currentY = drawDetailTable(
    'Transport Details',
    ['Transporter', 'Bilty No', 'Vehicle No', 'Driver Name', 'License No', 'Mobile No'],
    [[
      invoice.transport.name,
      invoice.transport.biltyNo,
      invoice.transport.vehicleNo,
      invoice.transport.driver,
      invoice.transport.license,
      invoice.transport.mobile
    ]],
    currentY
  );

// === Item Table Header ===
doc.moveDown();
doc.fontSize(13).fillColor('#004d99').text('Item Details', 50, doc.y, { underline: true });
doc.moveDown(0.5);

const tableTop = doc.y;
// Adjusted column X positions — widened Description field
const colX = [50, 230, 280, 340, 400, 470]; // Description gets ~180px width

doc.font('Helvetica-Bold');
doc.text('Description', colX[0], tableTop, { width: colX[1] - colX[0] - 5 });
doc.text('HSN', colX[1], tableTop);
doc.text('Qty', colX[2], tableTop);
doc.text('Weight', colX[3], tableTop);
doc.text('Rate', colX[4], tableTop);
doc.text('Total', colX[5], tableTop);

doc.moveTo(40, tableTop + 15).lineTo(550, tableTop + 15).stroke();
doc.font('Helvetica');
let itemY = tableTop + 20;

invoice.items.forEach((item) => {
  if (itemY > 720) {
    doc.addPage();
    itemY = 50;
  }

  doc.text(item.description, colX[0], itemY, { width: colX[1] - colX[0] - 5 });
  doc.text(item.hsn, colX[1], itemY);
  doc.text(item.quantity.toString(), colX[2], itemY);
  doc.text(`${item.weight} kg`, colX[3], itemY);
  doc.text(`₹${item.rate}`, colX[4], itemY);
  doc.text(`₹${item.total}`, colX[5], itemY);
  itemY += 20;
});


  doc.moveTo(40, itemY).lineTo(550, itemY).stroke();
  itemY += 15;

  // === Tax Details ===
  doc.moveDown(1.2);
  doc.fontSize(13).fillColor('#004d99').text('Tax Details', 50, doc.y, { underline: true });
  doc.fontSize(12).fillColor('#000');
  doc.text(`CGST: ${invoice.tax.cgst}%`, 50);
  doc.text(`SGST: ${invoice.tax.sgst}%`, 50);
  doc.text(`IGST: ${invoice.tax.igst}%`, 50);

  // === Total and Payment Details ===
  doc.moveDown(1);

  doc.fontSize(14).font('Helvetica-Bold').text(`Total Amount: ₹${invoice.totalAmount}`, {
    align: 'right',
  });

  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text(`Amount Paid: ₹${invoice.amountPaid}`, { align: 'right' });
  doc.text(`Payment Status: ${invoice.paymentStatus.toUpperCase()}`, { align: 'right' });

  const amountDue = (invoice.totalAmount - invoice.amountPaid).toFixed(2);
  if (amountDue > 0) {
    doc.text(`Amount Due: ₹${amountDue}`, { align: 'right' });
  } else {
    doc.text(`Amount Due: ₹0.00`, { align: 'right' });
  }

  // === Bank Details ===
  doc.moveDown(2);
  doc.fontSize(11).font('Helvetica');
  doc.text('Bank: ICICI Bank', 50);
  doc.text('A/c No: 254105500166');
  doc.text('IFSC: ICIC0002541');

  // === Footer ===
  doc.moveDown(1.5);
  doc.fontSize(10);
  doc.text(
    'We are Manufacturer only Cattle Feed Cake. Goods once sold will not be taken back or exchanged.',
    { align: 'center' }
  );
  doc.text(
    'Please make payment within 10 days of invoice date. RTGS/NEFT preferred.',
    { align: 'center' }
  );

  // === Signatures ===
  doc.moveDown(2);
  
  doc.text('Authorized Signatory: ____________________', 350);

  doc.end();
};
