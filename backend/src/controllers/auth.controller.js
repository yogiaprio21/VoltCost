const service = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
    const result = await service.register(req.body);
    res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
    const result = await service.login(req.body);

    // Set cookie for better security/convenience
    res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json(result);
});

const logout = asyncHandler(async (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
    res.json(req.user);
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await service.forgotPassword(email);
    res.json(result);
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const result = await service.resetPassword(token, password);
    res.json(result);
});

module.exports = { register, login, logout, me, forgotPassword, resetPassword };
