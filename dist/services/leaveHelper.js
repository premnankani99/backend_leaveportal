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
exports.sendWithdrawalEmail = exports.handlePendingOrApprovedWithdrawal = exports.sendStatusEmail = exports.sendLeaveEmails = exports.computeWithdrawalUpdateData = exports.extractPaidDays = exports.calculateLeaveType = exports.isInProbation = exports.calculateTotalDays = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const emailService_1 = require("../utils/emailService");
const emailTemplates_1 = require("../utils/emailTemplates");
const numbers_1 = require("../constants/numbers");
const strings_1 = require("../constants/strings");
const calculateTotalDays = (start, end) => __awaiter(void 0, void 0, void 0, function* () {
    const holidays = yield prismaClient_1.default.holidays.findMany({
        where: { date: { gte: start, lte: end } }
    });
    const holidayDateStrings = holidays.map(h => h.date.toISOString().split('T')[0]);
    let days = 0;
    const current = new Date(start);
    current.setUTCHours(0, 0, 0, 0);
    const endUTC = new Date(end);
    endUTC.setUTCHours(0, 0, 0, 0);
    while (current <= endUTC) {
        const dayOfWeek = current.getUTCDay();
        const dateStr = current.toISOString().split('T')[0];
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDateStrings.includes(dateStr))
            days++;
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return days;
});
exports.calculateTotalDays = calculateTotalDays;
const isInProbation = (joinedDate) => {
    const now = new Date();
    const diffYears = now.getFullYear() - joinedDate.getFullYear();
    const diffMonths = now.getMonth() - joinedDate.getMonth();
    return ((diffYears * numbers_1.NUMBERS.MONTHS_IN_YEAR) + diffMonths) < numbers_1.NUMBERS.PROBATION_MONTHS;
};
exports.isInProbation = isInProbation;
const calculateLeaveType = (inProbation_1, employeeId_1, totalDays_1, leaveType_1, start_1, ...args_1) => __awaiter(void 0, [inProbation_1, employeeId_1, totalDays_1, leaveType_1, start_1, ...args_1], void 0, function* (inProbation, employeeId, totalDays, leaveType, start, availableLeaves = 0) {
    const availablePaid = availableLeaves;
    if (inProbation) {
        if (availablePaid >= totalDays) {
            return `${leaveType} (Paid)`;
        }
        else if (availablePaid > 0) {
            return `${leaveType} (${availablePaid} Paid, ${totalDays - availablePaid} Unpaid - Probation)`;
        }
        else {
            return `${leaveType} (Unpaid - Probation)`;
        }
    }
    if (totalDays > availablePaid) {
        return availablePaid > 0
            ? `${leaveType} (${availablePaid} Paid, ${totalDays - availablePaid} Unpaid LOP)`
            : `${leaveType} (Unpaid - LOP)`;
    }
    return `${leaveType} (Paid)`;
});
exports.calculateLeaveType = calculateLeaveType;
const extractPaidDays = (leaveTypeStr, totalDays) => {
    if (leaveTypeStr.includes('(Paid)'))
        return totalDays;
    const match = leaveTypeStr.match(/\((\d+(?:\.\d+)?)\s+Paid/);
    if (match)
        return parseFloat(match[1]);
    return 0;
};
exports.extractPaidDays = extractPaidDays;
const computeWithdrawalUpdateData = (leave, status) => {
    const updateData = { status };
    if (status === 'approved') {
        updateData.approved_at = new Date();
        if (leave.status === 'withdrawal_requested' && leave.withdrawn_dates)
            updateData.withdrawn_dates = null;
    }
    else if (status === 'rejected') {
        updateData.rejected_at = new Date();
    }
    else if (status === 'cancelled') {
        if (leave.withdrawn_dates) {
            let withdrawnArray = typeof leave.withdrawn_dates === 'string' ? JSON.parse(leave.withdrawn_dates) : leave.withdrawn_dates;
            if (withdrawnArray.length > 0 && withdrawnArray.length < leave.total_days) {
                updateData.total_days = Math.max(0, leave.total_days - withdrawnArray.length);
                updateData.status = 'approved';
            }
        }
        else {
            updateData.withdrawn_at = new Date();
        }
    }
    return updateData;
};
exports.computeWithdrawalUpdateData = computeWithdrawalUpdateData;
const sendLeaveEmails = (profile, totalDays, start, end, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const durationText = totalDays === 1 ? '1 day' : `${totalDays} days`;
    if (profile.email) {
        yield (0, emailService_1.sendEmail)({
            to: profile.email, subject: 'Leave Application Submitted', text: `Your leave for ${durationText} is submitted.`,
            html: (0, emailTemplates_1.leaveAppliedEmployeeTemplate)(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        });
    }
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
        yield (0, emailService_1.sendEmail)({
            to: adminEmail, subject: 'New Leave Request', text: `Employee ${profile.full_name} applied for ${durationText} of leave.`,
            html: (0, emailTemplates_1.leaveAppliedAdminTemplate)(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        });
    }
});
exports.sendLeaveEmails = sendLeaveEmails;
const sendStatusEmail = (leave, status, adminNote) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if ((_a = leave.employee) === null || _a === void 0 ? void 0 : _a.email) {
        yield (0, emailService_1.sendEmail)({
            to: leave.employee.email, subject: `Leave Request ${status.toUpperCase()}`, text: `Your leave has been ${status}.`,
            html: (0, emailTemplates_1.leaveStatusUpdateTemplate)(leave.employee.full_name, leave.start_date.toDateString(), leave.end_date.toDateString(), status, adminNote || '')
        });
    }
});
exports.sendStatusEmail = sendStatusEmail;
const handlePendingOrApprovedWithdrawal = (leave, datesToWithdraw) => {
    let updateData = {};
    let message = "";
    if (datesToWithdraw && Array.isArray(datesToWithdraw) && datesToWithdraw.length > 0)
        updateData.withdrawn_dates = datesToWithdraw;
    if (leave.status === 'pending') {
        if (updateData.withdrawn_dates) {
            if (updateData.withdrawn_dates.length >= leave.total_days) {
                updateData.status = 'cancelled';
                updateData.withdrawn_at = new Date();
                updateData.withdrawn_dates = null;
                message = strings_1.MESSAGES.LEAVE_CANCELLED;
            }
            else {
                updateData.status = 'pending';
                updateData.total_days = Math.max(0, leave.total_days - updateData.withdrawn_dates.length);
                message = "Partial leave withdrawn instantly as it was still pending.";
            }
        }
        else {
            updateData.status = 'cancelled';
            updateData.withdrawn_at = new Date();
            message = strings_1.MESSAGES.LEAVE_CANCELLED;
        }
    }
    else if (leave.status === 'approved') {
        updateData.status = 'withdrawal_requested';
        updateData.withdrawal_requested_at = new Date();
        message = updateData.withdrawn_dates ? strings_1.MESSAGES.LEAVE_WITHDRAWN_PARTIAL : strings_1.MESSAGES.LEAVE_WITHDRAWN_FULL;
    }
    return { message, updateData };
};
exports.handlePendingOrApprovedWithdrawal = handlePendingOrApprovedWithdrawal;
const sendWithdrawalEmail = (employee, start, end, message) => __awaiter(void 0, void 0, void 0, function* () {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && employee) {
        yield (0, emailService_1.sendEmail)({
            to: adminEmail, subject: 'Leave Withdrawal Request', text: `Withdrawal request from ${employee.full_name}`,
            html: (0, emailTemplates_1.leaveWithdrawalAdminTemplate)(employee.full_name, start.toDateString(), end.toDateString(), message)
        });
    }
});
exports.sendWithdrawalEmail = sendWithdrawalEmail;
