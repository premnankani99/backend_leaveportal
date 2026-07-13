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
exports.deleteHoliday = exports.addHoliday = exports.getHolidays = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const httpCodes_1 = require("../constants/httpCodes");
const strings_1 = require("../constants/strings");
const getHolidays = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const holidays = yield prismaClient_1.default.holidays.findMany({
            orderBy: { date: 'asc' }
        });
        res.status(httpCodes_1.HTTP_STATUS.OK).json(holidays);
    }
    catch (error) {
        console.error("Error fetching holidays:", error);
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.FETCH_ERROR });
    }
});
exports.getHolidays = getHolidays;
const addHoliday = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, name, description, type } = req.body;
        if (!date || !name) {
            res.status(httpCodes_1.HTTP_STATUS.BAD_REQUEST).json({ error: "Date and Name are required" });
            return;
        }
        const dateObj = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateObj < today) {
            res.status(httpCodes_1.HTTP_STATUS.BAD_REQUEST).json({ error: "You cannot add a holiday for a past date." });
            return;
        }
        dateObj.setHours(0, 0, 0, 0);
        const newHoliday = yield prismaClient_1.default.holidays.create({
            data: {
                date: dateObj,
                name,
                description: description || null,
                type: type || 'public'
            }
        });
        res.status(httpCodes_1.HTTP_STATUS.CREATED).json(newHoliday);
    }
    catch (error) {
        console.error("Error adding holiday:", error);
        if (error.code === 'P2002') {
            res.status(httpCodes_1.HTTP_STATUS.BAD_REQUEST).json({ error: "A holiday on this date already exists." });
            return;
        }
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Could not create holiday" });
    }
});
exports.addHoliday = addHoliday;
const deleteHoliday = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.holidays.delete({
            where: { id: id }
        });
        res.status(httpCodes_1.HTTP_STATUS.OK).json({ message: "Holiday deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting holiday:", error);
        if (error.code === 'P2025') {
            res.status(httpCodes_1.HTTP_STATUS.NOT_FOUND).json({ error: "Holiday not found" });
            return;
        }
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.DELETE_ERROR });
    }
});
exports.deleteHoliday = deleteHoliday;
