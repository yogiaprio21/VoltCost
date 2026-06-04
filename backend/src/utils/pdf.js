const PDFDocument = require('pdfkit');

const PAGE = {
  margin: 50,
  width: 595.28,
  bottom: 770
};

function generateEstimatePdf(res, estimation, options = {}) {
  const materialCatalog = options.materialCatalog || [];
  const doc = new PDFDocument({
    size: 'A4',
    margin: PAGE.margin,
    info: { Title: `Estimasi VoltCost #${estimation.id}`, Author: 'VoltCost System' }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=VoltCost-Estimate-${estimation.id}.pdf`);
  doc.pipe(res);

  drawHeader(doc, estimation);
  drawInputSummary(doc, estimation);
  drawCostTable(doc, estimation.breakdown.cost.lines);
  drawTotals(doc, estimation.breakdown.cost);
  drawTechnicalMetrics(doc, estimation.breakdown.metrics);
  drawFormulaAndAssumptions(doc);
  drawSourceCatalog(doc, estimation.breakdown.cost.lines, materialCatalog);
  drawClosingNote(doc);

  doc.end();
}

function drawHeader(doc, estimation) {
  doc.rect(0, 0, PAGE.width, 112).fill('#0f172a');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text('VoltCost', PAGE.margin, 34);
  doc.font('Helvetica').fontSize(10).fillColor('#cbd5e1').text('Estimator instalasi listrik rumah tinggal', PAGE.margin, 64);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#ffffff').text('DOKUMEN ESTIMASI BIAYA', 320, 34, { width: 225, align: 'right' });
  doc.font('Helvetica').fontSize(9).fillColor('#cbd5e1')
    .text(`Nomor: #${estimation.id}`, 320, 56, { width: 225, align: 'right' })
    .text(`Tanggal: ${formatDate(estimation.createdAt)}`, 320, 72, { width: 225, align: 'right' });
  doc.y = 140;
}

function drawSectionTitle(doc, title, subtitle) {
  ensureSpace(doc, subtitle ? 54 : 34);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#0f172a').text(title, PAGE.margin, doc.y);
  if (subtitle) {
    doc.moveDown(0.25);
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(subtitle, PAGE.margin, doc.y, { width: 495, lineGap: 2 });
  }
  doc.moveDown(0.6);
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(PAGE.margin, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.8);
}

function drawInputSummary(doc, estimation) {
  drawSectionTitle(doc, 'Ringkasan Data Bangunan');
  const items = [
    ['Luas rumah', `${estimation.houseArea} m2`],
    ['Titik lampu', String(estimation.lampPoints)],
    ['Stop kontak', String(estimation.socketPoints)],
    ['Daya listrik', `${estimation.powerCapacity} VA`],
    ['Jumlah AC', String(estimation.acCount)],
    ['Pompa air', String(estimation.pumpCount)],
    ['Tipe instalasi', String(estimation.installationType).toUpperCase()]
  ];
  drawInfoGrid(doc, items);
}

function drawInfoGrid(doc, items) {
  const colWidth = 118.75;
  let x = PAGE.margin;
  let y = doc.y;

  items.forEach(([label, value], index) => {
    if (index > 0 && index % 4 === 0) {
      x = PAGE.margin;
      y += 52;
    }
    doc.roundedRect(x, y, colWidth - 8, 40, 6).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.font('Helvetica-Bold').fontSize(7).fillColor('#64748b').text(label.toUpperCase(), x + 9, y + 8, { width: colWidth - 26 });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text(value, x + 9, y + 22, { width: colWidth - 26 });
    x += colWidth;
  });

  doc.y = y + 58;
}

function drawCostTable(doc, lines) {
  drawSectionTitle(doc, 'Rincian Material dan Jasa', 'Subtotal dihitung dari kuantitas dikalikan harga satuan pada katalog material.');
  drawTableHeader(doc);

  lines.forEach((line, index) => {
    const rowHeight = Math.max(30, doc.heightOfString(line.name, { width: 190 }) + 16);
    if (doc.y + rowHeight > PAGE.bottom) {
      doc.addPage();
      drawTableHeader(doc);
    }

    const y = doc.y;
    doc.rect(PAGE.margin, y, 495, rowHeight).fill(index % 2 === 0 ? '#ffffff' : '#f8fafc');
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text(line.name, 60, y + 9, { width: 190 });
    doc.font('Helvetica').fontSize(8).fillColor('#334155');
    doc.text(formatQuantity(line.quantity), 258, y + 9, { width: 40, align: 'right' });
    doc.text(line.unit, 310, y + 9, { width: 55 });
    doc.text(formatCurrency(line.unitPrice), 370, y + 9, { width: 75, align: 'right' });
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(formatCurrency(line.quantity * line.unitPrice), 455, y + 9, { width: 80, align: 'right' });
    doc.strokeColor('#e2e8f0').lineWidth(0.7).moveTo(PAGE.margin, y + rowHeight).lineTo(545, y + rowHeight).stroke();
    doc.y = y + rowHeight;
  });

  doc.moveDown(1.2);
}

function drawTableHeader(doc) {
  ensureSpace(doc, 38);
  const y = doc.y;
  doc.rect(PAGE.margin, y, 495, 26).fill('#eaf5ff');
  doc.font('Helvetica-Bold').fontSize(7).fillColor('#475569');
  doc.text('MATERIAL / JASA', 60, y + 9, { width: 190 });
  doc.text('QTY', 258, y + 9, { width: 40, align: 'right' });
  doc.text('SATUAN', 310, y + 9, { width: 55 });
  doc.text('HARGA', 370, y + 9, { width: 75, align: 'right' });
  doc.text('SUBTOTAL', 455, y + 9, { width: 80, align: 'right' });
  doc.y = y + 26;
}

function drawTotals(doc, cost) {
  ensureSpace(doc, 118);
  const x = 315;
  const y = doc.y;
  doc.roundedRect(x, y, 230, 104, 6).fillAndStroke('#f8fafc', '#dbeafe');
  drawTotalRow(doc, 'Subtotal material', cost.subtotal, x + 16, y + 14);
  drawTotalRow(doc, 'Jasa instalasi 15%', cost.labor, x + 16, y + 34);
  drawTotalRow(doc, 'Premium 20%', cost.premium || 0, x + 16, y + 54);
  doc.rect(x, y + 76, 230, 28).fill('#0f172a');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff').text('TOTAL ESTIMASI', x + 16, y + 86, { width: 95 });
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#ffffff').text(formatCurrency(cost.total), x + 112, y + 84, { width: 100, align: 'right' });
  doc.y = y + 122;
}

function drawTotalRow(doc, label, value, x, y) {
  doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(label, x, y, { width: 110 });
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a').text(formatCurrency(value), x + 112, y, { width: 85, align: 'right' });
}

function drawTechnicalMetrics(doc, metrics = {}) {
  drawSectionTitle(doc, 'Metrik Teknis Estimasi');
  drawInfoGrid(doc, [
    ['Kabel', `${metrics.cableLength ?? '-'} m`],
    ['Conduit', `${metrics.conduitLength ?? '-'} m`],
    ['Sirkuit', `${metrics.circuits ?? '-'} grup`],
    ['Panel', `${metrics.panelCount ?? '-'} unit`]
  ]);
}

function drawFormulaAndAssumptions(doc) {
  drawSectionTitle(doc, 'Rumus dan Asumsi Perhitungan');
  drawBullets(doc, [
    'Subtotal material = jumlah seluruh qty material x harga satuan pada katalog VoltCost.',
    'Jasa instalasi = 15% x subtotal material.',
    'Premium = 20% x (subtotal material + jasa instalasi), hanya untuk tipe instalasi premium.',
    'Rujukan teknis keselamatan mengacu pada prinsip PUIL 2011 dan ketentuan Sertifikat Laik Operasi (SLO) ESDM.',
    'PUIL dan SLO adalah rujukan teknis, bukan sumber harga material. Harga perlu diverifikasi melalui vendor atau survei lapangan.'
  ]);
}

function drawSourceCatalog(doc, lines, materialCatalog) {
  drawSectionTitle(doc, 'Sumber Data Harga', 'Daftar berikut menjelaskan dari mana harga material pada estimasi ini diambil.');
  const usedSources = collectUsedSources(lines, materialCatalog);

  usedSources.forEach((item) => {
    const text = `${item.name}\nHarga: ${formatCurrency(item.pricePerUnit)} / ${item.unit} | Sumber: ${item.sourceName} (${item.sourceType}) | Update: ${formatDate(item.priceUpdatedAt)}\n${item.standardRef}\n${item.notes}`;
    const height = Math.max(54, doc.heightOfString(text, { width: 455, lineGap: 2 }) + 18);
    ensureSpace(doc, height + 8);
    const y = doc.y;
    doc.roundedRect(PAGE.margin, y, 495, height, 6).fillAndStroke('#ffffff', '#e2e8f0');
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a').text(item.name, 64, y + 10, { width: 455 });
    doc.font('Helvetica').fontSize(8).fillColor('#334155')
      .text(`Harga: ${formatCurrency(item.pricePerUnit)} / ${item.unit} | Sumber: ${item.sourceName} (${item.sourceType}) | Update: ${formatDate(item.priceUpdatedAt)}`, 64, y + 25, { width: 455 });
    doc.fillColor('#64748b')
      .text(item.standardRef, 64, y + 39, { width: 455, lineGap: 2 })
      .text(item.notes, 64, doc.y + 2, { width: 455, lineGap: 2 });
    doc.y = y + height + 8;
  });
}

function collectUsedSources(lines, materialCatalog) {
  const fallbackDate = new Date();
  const items = lines.map((line) => {
    const match = materialCatalog.find((material) => matchesMaterial(line.name, material.name));
    return {
      name: match?.name || line.name,
      unit: match?.unit || line.unit,
      pricePerUnit: Number(match?.pricePerUnit || line.unitPrice),
      sourceName: match?.sourceName || 'Katalog estimasi VoltCost',
      sourceType: match?.sourceType || 'admin',
      priceUpdatedAt: match?.priceUpdatedAt || fallbackDate,
      standardRef: match?.standardRef || 'PUIL 2011 dan SLO ESDM sebagai rujukan teknis keselamatan instalasi.',
      notes: match?.notes || 'Harga adalah estimasi dan perlu diverifikasi ulang berdasarkan vendor, merek, wilayah, dan waktu survei.'
    };
  });

  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.name}:${item.unit}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matchesMaterial(lineName, materialName) {
  const line = normalizeName(lineName);
  const material = normalizeName(materialName);
  return line.includes(material) || material.includes(line);
}

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b\d+\s*a\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function drawClosingNote(doc) {
  ensureSpace(doc, 56);
  doc.moveDown(0.5);
  doc.font('Helvetica-Oblique').fontSize(8).fillColor('#64748b').text(
    'Dokumen ini adalah estimasi awal untuk kebutuhan perencanaan. Hasil akhir tetap membutuhkan survei teknisi, pengecekan jalur, kondisi bangunan, ketersediaan material, dan ketentuan keselamatan instalasi yang berlaku.',
    PAGE.margin,
    doc.y,
    { width: 495, align: 'center', lineGap: 2 }
  );
}

function drawBullets(doc, items) {
  items.forEach((item) => {
    const height = doc.heightOfString(item, { width: 465, lineGap: 2 }) + 8;
    ensureSpace(doc, height);
    const y = doc.y;
    doc.circle(PAGE.margin + 4, y + 5, 2).fill('#0284c7');
    doc.font('Helvetica').fontSize(9).fillColor('#334155').text(item, PAGE.margin + 16, y, { width: 465, lineGap: 2 });
    doc.moveDown(0.5);
  });
}

function ensureSpace(doc, height) {
  if (doc.y + height > PAGE.bottom) {
    doc.addPage();
    doc.y = PAGE.margin;
  }
}

function formatCurrency(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n || 0));
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatQuantity(value) {
  return Number.isInteger(Number(value)) ? String(Number(value)) : Number(value).toFixed(2);
}

module.exports = { generateEstimatePdf };
