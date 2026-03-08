const PDFDocument = require('pdfkit');

function generateEstimatePdf(res, estimation) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: { Title: `Estimasi VoltCost #${estimation.id}`, Author: 'VoltCost System' }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=VoltCost-Estimate-${estimation.id}.pdf`);
  doc.pipe(res);

  // Background Header
  doc.rect(0, 0, 595.28, 120).fill('#1E293B');

  // Logo Placeholder (Text for now as we don't have icon file)
  doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('VoltCost', 50, 45);
  doc.fontSize(10).font('Helvetica').text('Smart Electrical Solutions', 50, 75);

  // Document Info (Right aligned)
  doc.fillColor('white').fontSize(14).font('Helvetica-Bold').text('ESTIMASI BIAYA', 400, 45, { align: 'right' });
  doc.fontSize(10).font('Helvetica').text(`ID: #${estimation.id}`, 400, 65, { align: 'right' });
  doc.text(`Tanggal: ${new Date(estimation.createdAt).toLocaleDateString('id-ID')}`, 400, 80, { align: 'right' });

  doc.moveDown(5);
  doc.fillColor('#334155');

  // Input Summary Section
  doc.fontSize(14).font('Helvetica-Bold').text('Ringkasan Data Bangunan', 50, 140);
  doc.rect(50, 158, 495, 1).fill('#E2E8F0');

  doc.moveDown(1.5);
  const startY = 175;
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748B');

  const drawInfo = (label, value, x, y) => {
    doc.text(label, x, y);
    doc.fillColor('#0F172A').text(value, x, y + 15);
    doc.fillColor('#64748B');
  };

  drawInfo('LUAS RUMAH', `${estimation.houseArea} m2`, 50, startY);
  drawInfo('TITIK LAMPU', `${estimation.lampPoints}`, 180, startY);
  drawInfo('STOPKONTAK', `${estimation.socketPoints}`, 310, startY);
  drawInfo('DAYA LISTRIK', `${estimation.powerCapacity} VA`, 440, startY);

  drawInfo('JUMLAH AC', `${estimation.acCount}`, 50, startY + 45);
  drawInfo('POMPA AIR', `${estimation.pumpCount}`, 180, startY + 45);
  drawInfo('TIPE INSTALASI', estimation.installationType.toUpperCase(), 310, startY + 45);

  doc.moveDown(5);

  // Table Section
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#334155').text('Rincian Kebutuhan Material', 50, 280);

  const tableTop = 300;
  doc.rect(50, tableTop, 495, 25).fill('#F8FAFC');

  doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold');
  doc.text('ITEM MATERIAL', 60, tableTop + 8);
  doc.text('QTY', 260, tableTop + 8, { width: 40, align: 'center' });
  doc.text('SATUAN', 310, tableTop + 8, { width: 50 });
  doc.text('HARGA SATUAN', 370, tableTop + 8, { width: 80, align: 'right' });
  doc.text('TOTAL', 460, tableTop + 8, { width: 80, align: 'right' });

  let rowY = tableTop + 30;
  doc.font('Helvetica').fontSize(9).fillColor('#1E293B');

  estimation.breakdown.cost.lines.forEach((l, idx) => {
    if (idx % 2 === 0) {
      doc.rect(50, rowY - 5, 495, 20).fill('#FFFFFF');
    } else {
      doc.rect(50, rowY - 5, 495, 20).fill('#F1F5F9');
    }

    doc.fillColor('#1E293B');
    doc.text(l.name.toUpperCase(), 60, rowY);
    doc.text(String(l.quantity), 260, rowY, { width: 40, align: 'center' });
    doc.text(l.unit, 310, rowY, { width: 50 });
    doc.text(formatCurrency(l.unitPrice), 370, rowY, { width: 80, align: 'right' });
    doc.text(formatCurrency(l.quantity * l.unitPrice), 460, rowY, { width: 80, align: 'right' });
    rowY += 20;
  });

  // Totals Section
  const cost = estimation.breakdown.cost;
  const totalsY = rowY + 20;

  doc.fontSize(10).font('Helvetica').fillColor('#64748B');
  doc.text('Subtotal Material:', 350, totalsY);
  doc.fillColor('#1E293B').text(formatCurrency(cost.subtotal), 460, totalsY, { align: 'right' });

  doc.fillColor('#64748B').text('Jasa Instalasi (15%):', 350, totalsY + 18);
  doc.fillColor('#1E293B').text(formatCurrency(cost.labor), 460, totalsY + 18, { align: 'right' });

  if (cost.premium) {
    doc.fillColor('#2563EB').text('Premium Surcharge (20%):', 350, totalsY + 36);
    doc.text(formatCurrency(cost.premium), 460, totalsY + 36, { align: 'right' });
  }

  const finalTotalY = totalsY + (cost.premium ? 60 : 45);
  doc.rect(340, finalTotalY - 10, 205, 35).fill('#EFF6FF');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#1D4ED8').text('TOTAL AKHIR:', 350, finalTotalY);
  doc.fontSize(14).text(formatCurrency(cost.total), 400, finalTotalY, { align: 'right' });

  // Footer
  doc.fontSize(8).font('Helvetica-Oblique').fillColor('#94A3B8')
    .text('* Estimasi ini adalah simulasi berdasarkan standar instalasi VoltCost. Silakan hubungi teknisi kami untuk survei lokasi dan akurasi 100%.', 50, 750, { align: 'center' });

  doc.end();
}

function formatCurrency(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

module.exports = { generateEstimatePdf };
