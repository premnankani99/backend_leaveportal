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
exports.actionCompOffService = exports.fetchMyCompOffsService = exports.fetchPendingCompOffsService = exports.requestCompOffService = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const requestCompOffService = (employee_id, total_days, reason) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.default.compOffGrant.create({
        data: {
            employeeId: employee_id,
            grantedAt: new Date(),
            daysGranted: total_days,
            reason: reason,
            status: 'pending'
        }
    });
});
exports.requestCompOffService = requestCompOffService;
const fetchPendingCompOffsService = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.default.compOffGrant.findMany({
        where: { status: 'pending' },
        include: { employee: true },
        orderBy: { grantedAt: 'desc' }
    });
});
exports.fetchPendingCompOffsService = fetchPendingCompOffsService;
const fetchMyCompOffsService = (employee_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.default.compOffGrant.findMany({
        where: { employeeId: String(employee_id) },
        orderBy: { grantedAt: 'desc' }
    });
});
exports.fetchMyCompOffsService = fetchMyCompOffsService;
const actionCompOffService = (id, admin_id, status, adminNote) => __awaiter(void 0, void 0, void 0, function* () {
    const request = yield prismaClient_1.default.compOffGrant.findUnique({ where: { id } });
    if (!request)
        throw new Error("Request not found");
    if (request.status !== 'pending')
        throw new Error("Request is already processed");
    yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.compOffGrant.update({
            where: { id },
            data: { status, adminNote, grantedBy: admin_id }
        });
        if (status === 'approved') {
            yield tx.profiles.update({
                where: { id: request.employeeId },
                data: { available_leaves: { increment: request.daysGranted } }
            });
        }
    }));
});
exports.actionCompOffService = actionCompOffService;
