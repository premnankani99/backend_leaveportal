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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all HR emails to always CC them
        const hrUsers = yield prismaClient_1.default.profiles.findMany({
            where: { role: 'hr' },
            select: { email: true }
        });
        const hrEmails = hrUsers.map(hr => hr.email).filter(Boolean);
        // Construct the CC array based on existing options and new HR emails
        let ccArray = [];
        if (options.cc) {
            if (Array.isArray(options.cc)) {
                ccArray = [...options.cc];
            }
            else {
                ccArray = [options.cc];
            }
        }
        // Add HR emails (avoiding duplicates if any)
        hrEmails.forEach(email => {
            if (!ccArray.includes(email)) {
                ccArray.push(email);
            }
        });
        const mailOptions = {
            from: process.env.FROM_EMAIL || '"Leave Portal" <noreply@yourdomain.com>',
            to: options.to,
            cc: ccArray.length > 0 ? ccArray : undefined,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };
        const info = yield transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    }
    catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
});
exports.sendEmail = sendEmail;
