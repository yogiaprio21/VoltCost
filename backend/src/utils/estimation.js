function computeCableLength({ houseArea, lampPoints, socketPoints, acCount, pumpCount }) {
  const base = Math.max(0, Math.round(houseArea * 1.2));
  const lamps = lampPoints * 8;
  const sockets = socketPoints * 6;
  const ac = acCount * 20;
  const pump = pumpCount * 15;
  return base + lamps + sockets + ac + pump;
}

function computeMcbRequirement({ powerCapacity, circuits }) {
  const mainMap = { 900: 6, 1300: 10, 2200: 16, 3500: 20 };
  const mainRating = mainMap[powerCapacity] || 16;
  const branchRating = 6;
  const branchCount = Math.max(1, circuits);
  return { main: { rating: mainRating, count: 1 }, branch: { rating: branchRating, count: branchCount } };
}

function computePanelCount() {
  return 1;
}

function computeConduitLength(cableLength) {
  return Math.round(cableLength * 0.7);
}

function computeCost(materials, metrics, installationType) {
  const cable = materials.find((m) => m.type === 'cable');
  const mcb = materials.find((m) => m.type === 'mcb');
  const panel = materials.find((m) => m.type === 'panel');
  const switchM = materials.find((m) => m.type === 'switch');
  const socketM = materials.find((m) => m.type === 'socket');
  const conduit = materials.find((m) => m.type === 'conduit');

  const lines = [];
  if (cable) lines.push({ name: 'Cable', unit: cable.unit, quantity: metrics.cableLength, unitPrice: Number(cable.pricePerUnit) });
  if (conduit) lines.push({ name: 'Conduit', unit: conduit.unit, quantity: metrics.conduitLength, unitPrice: Number(conduit.pricePerUnit) });
  if (switchM) lines.push({ name: 'Switch', unit: switchM.unit, quantity: metrics.lampPoints, unitPrice: Number(switchM.pricePerUnit) });
  if (socketM) lines.push({ name: 'Socket', unit: socketM.unit, quantity: metrics.socketPoints, unitPrice: Number(socketM.pricePerUnit) });
  if (mcb) {
    lines.push({ name: `MCB ${metrics.mcb.main.rating}A`, unit: mcb.unit, quantity: metrics.mcb.main.count, unitPrice: Number(mcb.pricePerUnit) });
    lines.push({ name: `MCB ${metrics.mcb.branch.rating}A`, unit: mcb.unit, quantity: metrics.mcb.branch.count, unitPrice: Number(mcb.pricePerUnit) });
  }
  if (panel) lines.push({ name: 'Panel Board', unit: panel.unit, quantity: metrics.panelCount, unitPrice: Number(panel.pricePerUnit) });

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const labor = Math.round(subtotal * 0.15);
  const premium = installationType === 'premium' ? Math.round((subtotal + labor) * 0.2) : 0;
  const total = subtotal + labor + premium;
  return { lines, subtotal, labor, premium, total };
}

function buildBreakdown({ input, materials }) {
  const cableLength = computeCableLength(input);
  const conduitLength = computeConduitLength(cableLength);
  const circuits = Math.ceil((input.lampPoints + input.socketPoints + input.acCount + input.pumpCount) / 6) || 1;
  const mcb = computeMcbRequirement({ powerCapacity: input.powerCapacity, circuits });
  const panelCount = computePanelCount();
  const metrics = { cableLength, conduitLength, circuits, mcb, panelCount, lampPoints: input.lampPoints, socketPoints: input.socketPoints };
  const cost = computeCost(materials, metrics, input.installationType);
  return { metrics, cost };
}

module.exports = { buildBreakdown };
