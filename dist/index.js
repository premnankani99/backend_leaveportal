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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const emailService_1 = require("./utils/emailService");
const auth_1 = __importDefault(require("./routes/auth"));
const leaves_1 = __importDefault(require("./routes/leaves"));
const admin_1 = __importDefault(require("./routes/admin"));
const holidays_1 = __importDefault(require("./routes/holidays"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const httpCodes_1 = require("./constants/httpCodes");
// Test API Route
app.get('/', (_req, res) => {
    res.send("Backend API is running in TypeScript!");
});
// Test Email API
app.get('/api/test-email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const receiverEmail = req.query.email || process.env.ADMIN_EMAIL;
    if (!receiverEmail) {
        res.status(httpCodes_1.HTTP_STATUS.BAD_REQUEST).json({ error: "No email provided." });
        return;
    }
    const success = yield (0, emailService_1.sendEmail)({
        to: receiverEmail,
        subject: "SMTP Connection Test",
        text: "Congratulations! Your SMTP connection in the Leave Portal is working perfectly! 🎉"
    });
    if (success) {
        res.status(httpCodes_1.HTTP_STATUS.OK).json({ message: `Test email sent successfully to ${receiverEmail}! Please check your inbox.` });
    }
    else {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to send email." });
    }
}));
app.use('/api/auth', auth_1.default);
app.use('/api/leaves', leaves_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/holidays', holidays_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
