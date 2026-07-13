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
const prismaClient_1 = __importDefault(require("../prismaClient"));
function makeAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        const email = process.argv[2];
        if (!email) {
            console.error("Please provide an email address. Example: npx ts-node scripts/make_admin.ts email@example.com");
            process.exit(1);
        }
        try {
            const user = yield prismaClient_1.default.profiles.findUnique({ where: { email } });
            if (!user) {
                console.error(`User with email ${email} not found in the database.`);
                process.exit(1);
            }
            yield prismaClient_1.default.profiles.update({
                where: { email },
                data: { role: 'admin' }
            });
            console.log(`Success! ${email} has been promoted to Admin.`);
        }
        catch (error) {
            console.error("Error updating user:", error);
        }
        finally {
            yield prismaClient_1.default.$disconnect();
        }
    });
}
makeAdmin();
