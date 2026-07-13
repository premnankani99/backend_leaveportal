"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const holidays_1 = require("../controllers/holidays");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
// Public route to get holidays (all employees need to know holidays for leave calendar)
router.get('/', holidays_1.getHolidays);
// Protected routes for Admins and HRs to manage holidays
router.post('/', auth_1.verifyToken, (0, rbac_1.hasPermission)('holidays:write'), holidays_1.addHoliday);
router.delete('/:id', auth_1.verifyToken, (0, rbac_1.hasPermission)('holidays:write'), holidays_1.deleteHoliday);
exports.default = router;
