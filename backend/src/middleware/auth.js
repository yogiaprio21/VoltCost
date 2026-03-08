const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');

function authenticate(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(new ApiError(401, 'Authentication required'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        next(new ApiError(401, 'Invalid or expired token'));
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ApiError(403, 'Forbidden: Insufficient permissions'));
        }
        next();
    };
}

module.exports = { authenticate, authorize };
