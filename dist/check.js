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
function get() {
    return __awaiter(this, void 0, void 0, function* () {
        const u = yield prismaClient_1.default.profiles.findUnique({ where: { email: 'premn7111@gmail.com' } });
        console.log("ACTIVE:", u === null || u === void 0 ? void 0 : u.is_active, "DELETED:", u === null || u === void 0 ? void 0 : u.is_deleted, "ROLE:", u === null || u === void 0 ? void 0 : u.role);
    });
}
get().finally(() => prismaClient_1.default.$disconnect());
