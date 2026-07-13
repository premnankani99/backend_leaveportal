"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyCompOffs = exports.actionCompOffRequest = exports.getPendingCompOffRequests = exports.requestCompOff = exports.getLeavesByEmployee = exports.adjustUnpaidLeave = exports.withdrawLeave = exports.updateLeaveStatus = exports.getAllLeaves = exports.getMyLeaves = exports.applyLeaveOnBehalf = exports.applyLeave = void 0;
const httpCodes_1 = require("../constants/httpCodes");
const strings_1 = require("../constants/strings");
const LeaveService = __importStar(require("../services/leaveService"));
const CompOffService = __importStar(require("../services/compOffService"));
/**
 * Applies for a new leave.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const applyLeave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { leave_type, start_date, end_date, reason, is_half_day } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            throw new Error("No user ID");
        const newLeave = yield LeaveService.applyNewLeaveService(req.user.id, leave_type, new Date(start_date), new Date(end_date), reason, is_half_day, false);
        res.status(httpCodes_1.HTTP_STATUS.CREATED).json({ message: strings_1.MESSAGES.LEAVE_APPLIED, leave: newLeave });
    }
    catch (_error) {
        if (_error.message === "EMPLOYEE_NOT_FOUND")
            res.status(httpCodes_1.HTTP_STATUS.NOT_FOUND).json({ error: strings_1.MESSAGES.EMPLOYEE_NOT_FOUND });
        else
            res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.SERVER_ERROR });
    }
});
exports.applyLeave = applyLeave;
/**
 * Applies for a new leave on behalf of an employee.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const applyLeaveOnBehalf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employee_id, leave_type, start_date, end_date, reason, is_half_day } = req.body;
        if (!employee_id)
            throw new Error("No employee ID");
        const newLeave = yield LeaveService.applyNewLeaveService(employee_id, leave_type, new Date(start_date), new Date(end_date), reason, is_half_day, true);
        res.status(httpCodes_1.HTTP_STATUS.CREATED).json({ message: strings_1.MESSAGES.LEAVE_APPLIED, leave: newLeave });
    }
    catch (_error) {
        if (_error.message === "EMPLOYEE_NOT_FOUND")
            res.status(httpCodes_1.HTTP_STATUS.NOT_FOUND).json({ error: strings_1.MESSAGES.EMPLOYEE_NOT_FOUND });
        else
            res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.SERVER_ERROR });
    }
});
exports.applyLeaveOnBehalf = applyLeaveOnBehalf;
/**
 * Fetches personal leaves for the current employee.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const getMyLeaves = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            throw new Error("No user ID");
        const leaves = yield LeaveService.fetchEmployeeLeavesService(req.user.id);
        res.status(httpCodes_1.HTTP_STATUS.OK).json(leaves);
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.FETCH_ERROR });
    }
});
exports.getMyLeaves = getMyLeaves;
/**
 * Fetches all leaves across the system for admin view.
 * @param {AuthRequest} _req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const getAllLeaves = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaves = yield LeaveService.fetchAllLeavesService();
        res.status(httpCodes_1.HTTP_STATUS.OK).json(leaves);
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.FETCH_ERROR });
    }
});
exports.getAllLeaves = getAllLeaves;
/**
 * Updates the status of a specific leave request.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const updateLeaveStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedLeave = yield LeaveService.processLeaveActionService(String(req.params.id), req.body.status, req.body.adminNote);
        res.status(httpCodes_1.HTTP_STATUS.OK).json({ message: strings_1.MESSAGES.LEAVE_STATUS_UPDATED, leave: updatedLeave });
    }
    catch (_error) {
        if (_error.message === "LEAVE_NOT_FOUND")
            res.status(httpCodes_1.HTTP_STATUS.NOT_FOUND).json({ error: strings_1.MESSAGES.LEAVE_NOT_FOUND });
        else
            res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.UPDATE_ERROR });
    }
});
exports.updateLeaveStatus = updateLeaveStatus;
/**
 * Processes a withdrawal request for a leave.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const withdrawLeave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message, updatedLeave } = yield LeaveService.withdrawLeaveService(String(req.params.id), req.body.datesToWithdraw);
        res.status(httpCodes_1.HTTP_STATUS.OK).json({ message, leave: updatedLeave });
    }
    catch (_error) {
        if (_error.message === "LEAVE_NOT_FOUND")
            res.status(httpCodes_1.HTTP_STATUS.NOT_FOUND).json({ error: strings_1.MESSAGES.LEAVE_NOT_FOUND });
        else if (_error.message === "CANNOT_WITHDRAW")
            res.status(httpCodes_1.HTTP_STATUS.BAD_REQUEST).json({ error: strings_1.MESSAGES.CANNOT_WITHDRAW });
        else
            res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.SERVER_ERROR });
    }
});
exports.withdrawLeave = withdrawLeave;
/**
 * Adjusts an unpaid leave logic (Placeholder).
 * @param {AuthRequest} _req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const adjustUnpaidLeave = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(httpCodes_1.HTTP_STATUS.OK).json({ message: "adjustUnpaidLeave unimplemented" });
});
exports.adjustUnpaidLeave = adjustUnpaidLeave;
/**
 * Fetches all leaves associated with a specific employee ID.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const getLeavesByEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaves = yield LeaveService.fetchEmployeeLeavesService(String(req.params.employeeId));
        res.status(httpCodes_1.HTTP_STATUS.OK).json(leaves);
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.FETCH_ERROR });
    }
});
exports.getLeavesByEmployee = getLeavesByEmployee;
/**
 * Requests a new compensatory off for an employee.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const requestCompOff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            throw new Error("No user ID");
        const compOff = yield CompOffService.requestCompOffService(req.user.id, req.body.total_days, req.body.reason);
        res.status(httpCodes_1.HTTP_STATUS.CREATED).json({ message: "Comp-off requested successfully", compOff });
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to request comp-off" });
    }
});
exports.requestCompOff = requestCompOff;
/**
 * Fetches all pending compensatory off requests.
 * @param {AuthRequest} _req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const getPendingCompOffRequests = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield CompOffService.fetchPendingCompOffsService();
        res.status(httpCodes_1.HTTP_STATUS.OK).json(requests);
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch requests" });
    }
});
exports.getPendingCompOffRequests = getPendingCompOffRequests;
/**
 * Approves or rejects a specific compensatory off request.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const actionCompOffRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            throw new Error("No user ID");
        yield CompOffService.actionCompOffService(String(req.params.id), req.user.id, req.body.status, req.body.adminNote);
        res.status(httpCodes_1.HTTP_STATUS.OK).json({ message: `Request ${req.body.status} successfully` });
    }
    catch (_error) {
        if (_error.message === "Request not found")
            res.status(httpCodes_1.HTTP_STATUS.NOT_FOUND).json({ error: _error.message });
        else if (_error.message === "Request is already processed")
            res.status(httpCodes_1.HTTP_STATUS.BAD_REQUEST).json({ error: _error.message });
        else
            res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to action request" });
    }
});
exports.actionCompOffRequest = actionCompOffRequest;
/**
 * Fetches the logged-in user's comp off records.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
const getMyCompOffs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            throw new Error("No user ID");
        const compOffs = yield CompOffService.fetchMyCompOffsService(req.user.id);
        res.status(httpCodes_1.HTTP_STATUS.OK).json(compOffs);
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.FETCH_ERROR });
    }
});
exports.getMyCompOffs = getMyCompOffs;
