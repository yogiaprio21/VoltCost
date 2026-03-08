const { z } = require('zod');

const materialSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['cable', 'mcb', 'switch', 'socket', 'panel', 'conduit']),
  unit: z.string().min(1),
  pricePerUnit: z.number().nonnegative()
});

const estimateInputSchema = z.object({
  houseArea: z.number().int().nonnegative(),
  lampPoints: z.number().int().nonnegative(),
  socketPoints: z.number().int().nonnegative(),
  acCount: z.number().int().nonnegative(),
  pumpCount: z.number().int().nonnegative(),
  powerCapacity: z.number().int().refine((v) => [900, 1300, 2200, 3500].includes(v), 'Invalid powerCapacity'),
  installationType: z.enum(['standard', 'premium'])
});

const idParamSchema = z.object({ id: z.string().regex(/^\d+$/).transform((v) => Number(v)) });

const registerSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal harus 8 karakter')
});

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password harus diisi')
});

module.exports = { materialSchema, estimateInputSchema, idParamSchema, registerSchema, loginSchema };
