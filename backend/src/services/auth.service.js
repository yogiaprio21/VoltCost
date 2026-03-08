const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { ApiError } = require('../middleware/errorHandler');
const { sendResetEmail } = require('../utils/email');
const crypto = require('crypto');

async function register({ email, password, name }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(400, 'Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, role: 'USER' }
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token
  };
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Keamanan: Tetap berikan respons sukses agar email user tidak bocor
    return { success: true };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // Valid selama 1 jam

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry: expiry
    }
  });

  try {
    await sendResetEmail(user.email, resetToken);
  } catch (err) {
    console.error('Email Error:', err);
    throw new ApiError(500, 'Gagal mengirim email reset password');
  }

  return { success: true };
}

async function resetPassword(token, newPassword) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }
    }
  });

  if (!user) {
    throw new ApiError(400, 'Token reset tidak valid atau sudah kadaluwarsa');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }
  });

  return { success: true };
}

module.exports = { register, login, forgotPassword, resetPassword };
