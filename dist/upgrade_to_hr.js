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
function upgradeLatestToHR() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield prismaClient_1.default.profiles.findMany({
            orderBy: { created_at: 'desc' },
            take: 5
        });
        console.log("Recent users:");
        for (const user of users) {
            console.log(`- ${user.email} | Role: ${user.role} | Verified: ${user.email_verified} | Status: ${user.verification_status}`);
        }
        // Find the latest employee who is pending or rejected
        const latest = users.find(u => u.role === 'employee' || u.role === 'hr');
        if (latest) {
            yield prismaClient_1.default.profiles.update({
                where: { id: latest.id },
                data: { role: 'hr', verification_status: 'approved', email_verified: true }
            });
            console.log(`\n✅ Upgraded ${latest.email} to HR and Approved!`);
        }
    });
}
upgradeLatestToHR().catch(console.error);
