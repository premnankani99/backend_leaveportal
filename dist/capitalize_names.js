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
const capitalizeName = (name) => {
    if (!name)
        return name;
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
function updateNames() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield prismaClient_1.default.profiles.findMany();
        for (const user of users) {
            if (user.full_name) {
                const capitalized = capitalizeName(user.full_name);
                if (capitalized !== user.full_name) {
                    yield prismaClient_1.default.profiles.update({
                        where: { id: user.id },
                        data: { full_name: capitalized }
                    });
                    console.log(`✅ Updated ${user.full_name} -> ${capitalized}`);
                }
            }
        }
        console.log("Done updating all names.");
    });
}
updateNames().catch(console.error);
