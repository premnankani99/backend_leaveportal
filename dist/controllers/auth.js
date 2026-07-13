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
exports.me = exports.resetPassword = exports.forgotPassword = exports.login = exports.verifyOtp = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const emailService_1 = require("../utils/emailService");
const emailTemplates_1 = require("../utils/emailTemplates");
const strings_1 = require("../constants/strings");
const numbers_1 = require("../constants/numbers");
const httpCodes_1 = require("../constants/httpCodes");
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_leave_portal';
/**
 * Generates a 6-digit OTP string.
 * @returns {string} The generated OTP.
 */
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
/**
 * Handles existing user verification for registration.
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} True if registration can proceed, false if blocked.
 */
const handleExistingUserForRegister = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prismaClient_1.default.profiles.findUnique({ where: { email } });
    if (existingUser) {
        if (!existingUser.email_verified || existingUser.verification_status === 'rejected') {
            yield prismaClient_1.default.leave_requests.deleteMany({ where: { employee_id: existingUser.id } });
            yield prismaClient_1.default.profiles.delete({ where: { email } });
            return true;
        }
        return false;
    }
    return true;
});
const capitalizeName = (name) => {
    if (!name)
        return name;
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
/**
 * Creates a new user with OTP.
 * @param {any} data - The user registration data.
 * @returns {Promise<any>} The created user.
 */
const createUserWithOtp = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(data.password, numbers_1.NUMBERS.BCRYPT_SALT_ROUNDS);
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + numbers_1.NUMBERS.OTP_EXPIRY_MINUTES * numbers_1.NUMBERS.MS_IN_MINUTE);
    const newUser = yield prismaClient_1.default.profiles.create({
        data: {
            full_name: capitalizeName(data.full_name),
            email: data.email,
            password: hashedPassword,
            role: "employee",
            email_verified: false,
            otp_code: otpCode,
            otp_expires_at: otpExpiresAt
        }
    });
    // Log OTP to console for easier local testing
    console.log(`\n=========================================`);
    console.log(`🔐 OTP for ${data.email} is: ${otpCode}`);
    console.log(`=========================================\n`);
    return { newUser, otpCode };
});
/**
 * Registers a new employee.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
const register = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { full_name, password } = _req.body;
        const email = _req.body.email.toLowerCase();
        if (email.toLowerCase() === 'premnankani99@gmail.com') {
            res.status(httpCodes_1.HTTP_STATUS.BAD_REQUEST).json({ error: strings_1.MESSAGES.ADMIN_REGISTRATION_NOT_ALLOWED });
            return;
        }
        const canProceed = yield handleExistingUserForRegister(email);
        if (!canProceed) {
            res.status(httpCodes_1.HTTP_STATUS.BAD_REQUEST).json({ error: strings_1.MESSAGES.EMAIL_ALREADY_EXISTS });
            return;
        }
        const { newUser, otpCode } = yield createUserWithOtp({ full_name, email, password });
        yield (0, emailService_1.sendEmail)({
            to: email,
            subject: 'Verify Your Email - Leave Portal',
            text: `Your OTP is ${otpCode}`,
            html: (0, emailTemplates_1.getOtpEmailTemplate)(full_name, otpCode)
        });
        res.status(httpCodes_1.HTTP_STATUS.CREATED).json({
            message: strings_1.MESSAGES.REGISTRATION_SUCCESS,
            userId: newUser.id,
            requireOtp: true
        });
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.SERVER_ERROR });
    }
});
exports.register = register;
/**
 * Validates the OTP for a user.
 * @param {any} user - The user object.
 * @param {string} otp - The provided OTP.
 * @returns {string | null} Error message or null if valid.
 */
const validateUserForOtp = (user, otp) => {
    if (!user)
        return strings_1.MESSAGES.USER_NOT_FOUND;
    if (user.email_verified)
        return strings_1.MESSAGES.EMAIL_VERIFIED;
    if (user.otp_code !== otp)
        return strings_1.MESSAGES.INVALID_OTP;
    if (user.otp_expires_at && new Date() > user.otp_expires_at)
        return strings_1.MESSAGES.INVALID_OTP;
    return null;
};
/**
 * Verifies the registration OTP.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
const verifyOtp = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp } = _req.body;
        const email = _req.body.email.toLowerCase();
        const user = yield prismaClient_1.default.profiles.findUnique({ where: { email } });
        const errorMsg = validateUserForOtp(user, otp);
        if (errorMsg) {
            res.status(httpCodes_1.HTTP_STATUS.BAD_REQUEST).json({ error: errorMsg });
            return;
        }
        const updatedUser = yield prismaClient_1.default.profiles.update({
            where: { email },
            data: { email_verified: true, otp_code: null, otp_expires_at: null }
        });
        const token = jsonwebtoken_1.default.sign({ id: updatedUser.id, role: updatedUser.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(httpCodes_1.HTTP_STATUS.OK).json({ message: strings_1.MESSAGES.EMAIL_VERIFIED, token, user: updatedUser });
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.SERVER_ERROR });
    }
});
exports.verifyOtp = verifyOtp;
/**
 * Handles unverified user during login by sending a new OTP.
 * @param {any} user - The unverified user object.
 * @returns {Promise<void>}
 */
const handleUnverifiedLogin = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + numbers_1.NUMBERS.OTP_EXPIRY_MINUTES * numbers_1.NUMBERS.MS_IN_MINUTE);
    yield prismaClient_1.default.profiles.update({
        where: { email: user.email },
        data: { otp_code: otpCode, otp_expires_at: otpExpiresAt }
    });
    // Log OTP to console for easier local testing
    console.log(`\n=========================================`);
    console.log(`🔐 OTP for ${user.email} is: ${otpCode}`);
    console.log(`=========================================\n`);
    yield (0, emailService_1.sendEmail)({
        to: user.email,
        subject: 'Verify Your Email - Leave Portal',
        text: `Your OTP is ${otpCode}`,
        html: (0, emailTemplates_1.getOtpEmailTemplate)(user.full_name, otpCode)
    });
});
/**
 * Authenticates a user.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
const login = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password } = _req.body;
        const email = _req.body.email.toLowerCase();
        const user = yield prismaClient_1.default.profiles.findUnique({ where: { email } });
        if (!user || !user.password) {
            res.status(httpCodes_1.HTTP_STATUS.NOT_FOUND).json({ error: "Email not registered" });
            return;
        }
        if (!user.email_verified) {
            yield handleUnverifiedLogin(user);
            res.status(httpCodes_1.HTTP_STATUS.FORBIDDEN).json({ error: strings_1.MESSAGES.OTP_SENT, requireOtp: true });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(httpCodes_1.HTTP_STATUS.BAD_REQUEST).json({ error: strings_1.MESSAGES.INVALID_CREDENTIALS });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(httpCodes_1.HTTP_STATUS.OK).json({ message: strings_1.MESSAGES.LOGIN_SUCCESS, token, user });
    }
    catch (_error) {
        console.error("Login Error:", _error);
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.SERVER_ERROR });
    }
});
exports.login = login;
/**
 * Generates an OTP for password reset.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
const forgotPassword = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = _req.body.email.toLowerCase();
        const user = yield prismaClient_1.default.profiles.findUnique({ where: { email } });
        if (!user) {
            res.status(httpCodes_1.HTTP_STATUS.OK).json({ message: strings_1.MESSAGES.FORGOT_PASSWORD_EMAIL_SENT });
            return;
        }
        const resetOtp = generateOTP();
        const expiresAt = new Date(Date.now() + numbers_1.NUMBERS.OTP_EXPIRY_MINUTES * numbers_1.NUMBERS.MS_IN_MINUTE);
        yield prismaClient_1.default.profiles.update({
            where: { email },
            data: { reset_token: resetOtp, reset_token_expires_at: expiresAt }
        });
        yield (0, emailService_1.sendEmail)({
            to: email,
            subject: 'Password Reset Request',
            text: `Your OTP is ${resetOtp}`,
            html: (0, emailTemplates_1.getResetPasswordEmailTemplate)(user.full_name, resetOtp)
        });
        res.status(httpCodes_1.HTTP_STATUS.OK).json({ message: strings_1.MESSAGES.FORGOT_PASSWORD_EMAIL_SENT });
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.SERVER_ERROR });
    }
});
exports.forgotPassword = forgotPassword;
/**
 * Validates reset token.
 * @param {any} user - User object.
 * @param {string} otp - Provided OTP.
 * @returns {string | null} Error string or null.
 */
const validateResetToken = (user, otp) => {
    if (!user)
        return strings_1.MESSAGES.USER_NOT_FOUND;
    if (user.reset_token !== otp)
        return strings_1.MESSAGES.INVALID_OTP;
    if (user.reset_token_expires_at && new Date() > user.reset_token_expires_at)
        return strings_1.MESSAGES.INVALID_OTP;
    return null;
};
/**
 * Resets the user's password.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
const resetPassword = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp, newPassword } = _req.body;
        const email = _req.body.email.toLowerCase();
        const user = yield prismaClient_1.default.profiles.findUnique({ where: { email } });
        const errorMsg = validateResetToken(user, otp);
        if (errorMsg) {
            res.status(httpCodes_1.HTTP_STATUS.BAD_REQUEST).json({ error: errorMsg });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, numbers_1.NUMBERS.BCRYPT_SALT_ROUNDS);
        yield prismaClient_1.default.profiles.update({
            where: { email },
            data: { password: hashedPassword, reset_token: null, reset_token_expires_at: null }
        });
        res.status(httpCodes_1.HTTP_STATUS.OK).json({ message: strings_1.MESSAGES.PASSWORD_RESET_SUCCESS });
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.SERVER_ERROR });
    }
});
exports.resetPassword = resetPassword;
/**
 * Gets the current user's profile.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userReq = req;
        const user = yield prismaClient_1.default.profiles.findUnique({
            where: { id: userReq.user.id }
        });
        if (!user) {
            res.status(httpCodes_1.HTTP_STATUS.NOT_FOUND).json({ error: strings_1.MESSAGES.USER_NOT_FOUND });
            return;
        }
        res.status(httpCodes_1.HTTP_STATUS.OK).json({ user });
    }
    catch (_error) {
        res.status(httpCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: strings_1.MESSAGES.SERVER_ERROR });
    }
});
exports.me = me;
