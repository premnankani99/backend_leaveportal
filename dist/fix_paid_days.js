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
function fix() {
    return __awaiter(this, void 0, void 0, function* () {
        const leaves = yield prismaClient_1.default.leave_requests.findMany({ where: { paid_days: null } });
        for (const leave of leaves) {
            let paid = leave.total_days;
            if (leave.leave_type.includes('Unpaid - LOP') || leave.leave_type.includes('Unpaid - Probation')) {
                paid = 0;
            }
            else if (leave.leave_type.includes(' Paid, ')) {
                const match = leave.leave_type.match(/\((\d+(?:\.\d+)?)\sPaid/);
                if (match)
                    paid = parseFloat(match[1]);
            }
            yield prismaClient_1.default.leave_requests.update({
                where: { id: leave.id },
                data: { paid_days: paid }
            });
            console.log(`Updated ${leave.id} with paid_days = ${paid}`);
        }
    });
}
fix().then(() => console.log('Done'));
