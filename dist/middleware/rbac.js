"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = void 0;
const httpCodes_1 = require("../constants/httpCodes");
const strings_1 = require("../constants/strings");
// Define the permissions mapping for each role
const rolePermissions = {
    admin: [
        'leaves:read',
        'leaves:write',
        'employees:read',
        'employees:write',
        'announcements:write',
        'holidays:write'
    ],
    hr: [
        'leaves:read',
        'employees:read',
        'holidays:write'
    ],
    employee: [
        'leaves:self'
    ]
};
/**
 * Middleware factory to check if the authenticated user has a specific permission.
 * @param {string} permission - The required permission (e.g., 'leaves:write').
 * @returns {Function} Express middleware function.
 */
const hasPermission = (permission) => {
    return (req, res, next) => {
        // If there is no user attached to the request (e.g. verifyToken failed or wasn't called)
        if (!req.user || !req.user.role) {
            res.status(httpCodes_1.HTTP_STATUS.UNAUTHORIZED).json({ error: strings_1.MESSAGES.SERVER_ERROR });
            return;
        }
        const userRole = req.user.role;
        const allowedPermissions = rolePermissions[userRole] || [];
        // Check if the user's role grants them the required permission
        if (allowedPermissions.includes(permission)) {
            next();
        }
        else {
            res.status(httpCodes_1.HTTP_STATUS.FORBIDDEN).json({ error: "Access denied. Insufficient permissions." });
        }
    };
};
exports.hasPermission = hasPermission;
