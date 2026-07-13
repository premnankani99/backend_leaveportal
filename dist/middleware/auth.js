"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const strings_1 = require("../constants/strings");
const httpCodes_1 = require("../constants/httpCodes");
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_leave_portal';
/**
 * Middleware to verify JWT token.
 * @param {AuthRequest} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
const verifyToken = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        res.status(httpCodes_1.HTTP_STATUS.UNAUTHORIZED).json({ error: strings_1.MESSAGES.SERVER_ERROR });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.UNAUTHORIZED).json({ error: strings_1.MESSAGES.SERVER_ERROR });
    }
};
exports.verifyToken = verifyToken;
/**
 * Middleware to check if user is admin.
 * @param {AuthRequest} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(httpCodes_1.HTTP_STATUS.FORBIDDEN).json({ error: strings_1.MESSAGES.SERVER_ERROR });
    }
};
exports.isAdmin = isAdmin;
