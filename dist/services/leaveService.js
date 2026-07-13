"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawLeaveService = exports.processLeaveActionService = exports.fetchAllLeavesService = exports.fetchEmployeeLeavesService = exports.applyNewLeaveService = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const leaveHelper_1 = require("./leaveHelper");
const applyNewLeaveService = (employee_id_1, leave_type_1, start_date_1, end_date_1, reason_1, is_half_day_1, ...args_1) => __awaiter(void 0, [employee_id_1, leave_type_1, start_date_1, end_date_1, reason_1, is_half_day_1, ...args_1], void 0, function* (employee_id, leave_type, start_date, end_date, reason, is_half_day, isApproved = false) {
    const total_days = is_half_day ? 0.5 : yield (0, leaveHelper_1.calculateTotalDays)(start_date, end_date);
    const profile = yield prismaClient_1.default.profiles.findUnique({ where: { id: employee_id } });
    if (!profile)
        throw new Error("EMPLOYEE_NOT_FOUND");
    const joinedDate = profile.date_of_joining ? new Date(profile.date_of_joining) : new Date(profile.created_at);
    const inProbation = (0, leaveHelper_1.isInProbation)(joinedDate);
    // Calculate leave type incorporating current available balance
    const finalLeaveType = yield (0, leaveHelper_1.calculateLeaveType)(inProbation, employee_id, total_days, leave_type, start_date, profile.available_leaves);
    // Calculate how many paid days were actually consumed
    const paidDays = (0, leaveHelper_1.extractPaidDays)(finalLeaveType, total_days);
    // Immediately deduct consumed paid days from balance
    if (paidDays > 0) {
        yield prismaClient_1.default.profiles.update({
            where: { id: employee_id },
            data: { available_leaves: { decrement: paidDays } }
        });
    }
    const newLeave = yield prismaClient_1.default.leave_requests.create({
        data: { employee_id, leave_type: finalLeaveType, start_date, end_date, total_days, reason, status: isApproved ? 'approved' : 'pending' }
    });
    if (!isApproved) {
        yield (0, leaveHelper_1.sendLeaveEmails)(profile, total_days, start_date, end_date, reason);
    }
    return newLeave;
});
exports.applyNewLeaveService = applyNewLeaveService;
const fetchEmployeeLeavesService = (employee_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.default.leave_requests.findMany({
        where: { employee_id },
        orderBy: { created_at: 'desc' }
    });
});
exports.fetchEmployeeLeavesService = fetchEmployeeLeavesService;
const fetchAllLeavesService = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.default.leave_requests.findMany({
        include: { employee: true },
        orderBy: { created_at: 'desc' }
    });
});
exports.fetchAllLeavesService = fetchAllLeavesService;
const processLeaveActionService = (id, status, adminNote) => __awaiter(void 0, void 0, void 0, function* () {
    const leave = yield prismaClient_1.default.leave_requests.findUnique({ where: { id } });
    if (!leave)
        throw new Error("LEAVE_NOT_FOUND");
    const updateData = (0, leaveHelper_1.computeWithdrawalUpdateData)(leave, status);
    if (adminNote)
        updateData.admin_note = adminNote;
    const updatedLeave = yield prismaClient_1.default.leave_requests.update({
        where: { id }, data: updateData, include: { employee: true }
    });
    // Refund logic for rejected or cancelled (withdrawn) leaves
    let refundDays = 0;
    if (status === 'rejected' && leave.status === 'pending') {
        refundDays = (0, leaveHelper_1.extractPaidDays)(leave.leave_type, leave.total_days || 0);
    }
    else if (status === 'cancelled') {
        const originalPaidDays = (0, leaveHelper_1.extractPaidDays)(leave.leave_type, leave.total_days || 0);
        if (updateData.status === 'approved') {
            const newPaidDays = Math.min(originalPaidDays, updateData.total_days);
            refundDays = originalPaidDays - newPaidDays;
        }
        else {
            refundDays = originalPaidDays;
        }
    }
    if (refundDays > 0) {
        yield prismaClient_1.default.profiles.update({
            where: { id: leave.employee_id },
            data: { available_leaves: { increment: refundDays } }
        });
    }
    yield (0, leaveHelper_1.sendStatusEmail)(updatedLeave, status, adminNote);
    return updatedLeave;
});
exports.processLeaveActionService = processLeaveActionService;
const withdrawLeaveService = (id, datesToWithdraw) => __awaiter(void 0, void 0, void 0, function* () {
    const leave = yield prismaClient_1.default.leave_requests.findUnique({ where: { id } });
    if (!leave)
        throw new Error("LEAVE_NOT_FOUND");
    if (leave.status !== 'pending' && leave.status !== 'approved')
        throw new Error("CANNOT_WITHDRAW");
    const { message, updateData } = (0, leaveHelper_1.handlePendingOrApprovedWithdrawal)(leave, datesToWithdraw);
    const updatedLeave = yield prismaClient_1.default.leave_requests.update({
        where: { id }, data: updateData, include: { employee: true }
    });
    let refundDays = 0;
    if (updateData.status === 'cancelled') {
        refundDays = (0, leaveHelper_1.extractPaidDays)(leave.leave_type, leave.total_days || 0);
    }
    else if (updateData.status === 'pending' && updateData.total_days !== undefined) {
        const originalPaidDays = (0, leaveHelper_1.extractPaidDays)(leave.leave_type, leave.total_days || 0);
        const newPaidDays = Math.min(originalPaidDays, updateData.total_days);
        refundDays = originalPaidDays - newPaidDays;
    }
    if (refundDays > 0) {
        yield prismaClient_1.default.profiles.update({
            where: { id: leave.employee_id },
            data: { available_leaves: { increment: refundDays } }
        });
    }
    yield (0, leaveHelper_1.sendWithdrawalEmail)(updatedLeave.employee, updatedLeave.start_date, updatedLeave.end_date, message);
    return { message, updatedLeave };
});
exports.withdrawLeaveService = withdrawLeaveService;
