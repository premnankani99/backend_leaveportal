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
const prismaClient_1 = __importDefault(require("./prismaClient"));
function testApply() {
    return __awaiter(this, void 0, void 0, function* () {
        const employeeId = '12548e9e-762c-44dd-a8f1-8a30961636e2'; // Prem's ID
        try {
            const profileBefore = yield prismaClient_1.default.profiles.findUnique({ where: { id: employeeId } });
            console.log("Balance before:", profileBefore === null || profileBefore === void 0 ? void 0 : profileBefore.available_leaves);
            const [newLeave, updatedProfile] = yield prismaClient_1.default.$transaction([
                prismaClient_1.default.leave_requests.create({
                    data: {
                        employee_id: employeeId,
                        leave_type: 'Casual Leave (Paid)',
                        start_date: new Date(),
                        end_date: new Date(),
                        total_days: 1,
                        reason: 'Test from script',
                        status: 'pending'
                    }
                }),
                prismaClient_1.default.profiles.update({
                    where: { id: employeeId },
                    data: { available_leaves: { decrement: 1 } }
                })
            ]);
            console.log("Balance after:", updatedProfile.available_leaves);
            // Now cancel it (like withdraw)
            const [cancelledLeave, refundedProfile] = yield prismaClient_1.default.$transaction([
                prismaClient_1.default.leave_requests.update({
                    where: { id: newLeave.id },
                    data: { status: 'cancelled' }
                }),
                prismaClient_1.default.profiles.update({
                    where: { id: employeeId },
                    data: { available_leaves: { increment: 1 } }
                })
            ]);
            console.log("Balance after refund:", refundedProfile.available_leaves);
            // cleanup
            yield prismaClient_1.default.leave_requests.delete({ where: { id: newLeave.id } });
        }
        catch (error) {
            console.error("FAIL:", error);
        }
    });
}
testApply().finally(() => prismaClient_1.default.$disconnect());
