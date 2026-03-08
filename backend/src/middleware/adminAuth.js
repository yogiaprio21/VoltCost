const { ApiError } = require('./errorHandler');

module.exports = function adminAuth(req, res, next) {
  const key = req.header('X-Admin-Key');
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return next(new ApiError(500, 'Admin API key not configured'));
  if (!key || key !== expected) return next(new ApiError(401, 'Unauthorized'));
  next();
};
