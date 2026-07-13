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
const bcrypt_1 = __importDefault(require("bcrypt"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultPassword = yield bcrypt_1.default.hash('password123', 10);
        const admin = yield prismaClient_1.default.profiles.upsert({
            where: { email: 'premn7111@gmail.com' },
            update: {
                password: defaultPassword,
                role: 'admin',
                verification_status: 'approved',
                is_active: true
            },
            create: {
                email: 'premn7111@gmail.com',
                full_name: 'Prem Admin',
                password: defaultPassword,
                role: 'admin',
                verification_status: 'approved',
                is_active: true
            }
        });
        const employee = yield prismaClient_1.default.profiles.upsert({
            where: { email: 'virendrapratapsingh2408@gmail.com' },
            update: {
                password: defaultPassword,
                role: 'employee',
                verification_status: 'approved',
                is_active: true
            },
            create: {
                email: 'virendrapratapsingh2408@gmail.com',
                full_name: 'Virendra Pratap Singh',
                password: defaultPassword,
                role: 'employee',
                verification_status: 'approved',
                is_active: true
            }
        });
        console.log('Successfully seeded database!');
        console.log(`Admin Account -> Email: ${admin.email} | Password: password123`);
        console.log(`Employee Account -> Email: ${employee.email} | Password: password123`);
    });
}
main()
    .catch(console.error)
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.default.$disconnect();
}));
