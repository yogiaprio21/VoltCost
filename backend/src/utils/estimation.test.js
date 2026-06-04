const assert = require('node:assert/strict');
const { buildBreakdown, computeCostFromLines } = require('./estimation');

const materials = [
  { type: 'cable', name: 'Kabel NYM 3x2.5', unit: 'meter', pricePerUnit: 12000 },
  { type: 'conduit', name: 'Pipa conduit', unit: 'meter', pricePerUnit: 5000 },
  { type: 'switch', name: 'Saklar tunggal', unit: 'pcs', pricePerUnit: 18000 },
  { type: 'socket', name: 'Stopkontak', unit: 'pcs', pricePerUnit: 25000 },
  { type: 'mcb', name: 'MCB', unit: 'pcs', pricePerUnit: 45000 },
  { type: 'panel', name: 'Box panel', unit: 'unit', pricePerUnit: 150000 }
];

const input = {
  houseArea: 100,
  lampPoints: 10,
  socketPoints: 10,
  acCount: 1,
  pumpCount: 0,
  powerCapacity: 2200,
  installationType: 'premium'
};

const breakdown = buildBreakdown({ input, materials });

assert.equal(breakdown.metrics.cableLength, 280);
assert.equal(breakdown.metrics.conduitLength, 196);
assert.equal(breakdown.metrics.circuits, 4);
assert.equal(breakdown.metrics.mcb.main.rating, 10);
assert.equal(breakdown.cost.subtotal, 5145000);
assert.equal(breakdown.cost.labor, 771750);
assert.equal(breakdown.cost.premium, 1183350);
assert.equal(breakdown.cost.total, 7100100);

const override = computeCostFromLines([
  { name: 'Item A', unit: 'pcs', quantity: 2, unitPrice: 10000 },
  { name: 'Item B', unit: 'meter', quantity: -3, unitPrice: 5000 }
], 'standard');

assert.equal(override.lines[1].quantity, 0);
assert.equal(override.subtotal, 20000);
assert.equal(override.labor, 3000);
assert.equal(override.premium, 0);
assert.equal(override.total, 23000);

console.log('estimation tests passed');
