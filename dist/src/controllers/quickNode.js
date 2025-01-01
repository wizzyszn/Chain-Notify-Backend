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
exports.quicknodeWebHook = void 0;
const userModel_1 = require("../models/userModel");
const nodemailer_1 = __importDefault(require("nodemailer"));
// Notification service
// Notification service
class NotificationService {
    constructor() {
        // Yahoo SMTP configuration
        this.emailTransporter = nodemailer_1.default.createTransport({
            host: 'smtp.mail.yahoo.com',
            port: 465,
            secure: true, // true for 465
            auth: {
                user: process.env.EMAIL, // Your Yahoo email
                pass: process.env.EMAIL_PASSWORD // Your Yahoo App Password
            },
            debug: true // Enable debug logs
        });
        // Verify connection configuration
        this.verifyEmailConnection();
    }
    verifyEmailConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.emailTransporter.verify();
                console.log('Yahoo SMTP connection verified successfully');
            }
            catch (error) {
                console.error('Yahoo SMTP connection failed:', error);
            }
        });
    }
    sendEmail(to, subject, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate email address
                if (!to || !this.isValidEmail(to)) {
                    console.error('Invalid email address:', to);
                    return false;
                }
                const mailOptions = {
                    from: {
                        name: 'ChainNotify',
                        address: process.env.YAHOO_EMAIL
                    },
                    to,
                    subject,
                    html: content,
                    text: this.stripHtml(content) // Fallback plain text
                };
                const info = yield this.emailTransporter.sendMail(mailOptions);
                console.log('Email sent successfully:', info.messageId);
                return true;
            }
            catch (error) {
                console.error('Email notification error details:', {
                    error: error.message,
                    code: error.code,
                    command: error.command,
                    response: error.response,
                    responseCode: error.responseCode,
                    recipient: to,
                    subject
                });
                // Handle specific Yahoo SMTP error cases
                if (error.code === 'EENVELOPE') {
                    console.error('Invalid sender or recipient address - check Yahoo email settings');
                }
                else if (error.code === 'EAUTH') {
                    console.error('Yahoo authentication failed - check app password');
                }
                return false;
            }
        });
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '');
    }
    // ... rest of the NotificationService methods remain the same ...
    formatTransactionMessage(type, amount, from, to) {
        const formattedAmount = amount.toFixed(8);
        return type === 'received'
            ? `You received ${formattedAmount} ETH from ${from}`
            : `You sent ${formattedAmount} ETH to ${to}`;
    }
}
// Utility functions
const convertHexToDecimal = (hexValue) => {
    return parseInt(hexValue, 16);
};
const validateTransaction = (transaction) => {
    return (transaction &&
        typeof transaction.hash === 'string' &&
        typeof transaction.from === 'string' &&
        typeof transaction.to === 'string' &&
        typeof transaction.value === 'string' &&
        typeof transaction.blockNumber === 'string');
};
// Webhook handler
const quicknodeWebHook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notificationService = new NotificationService();
    try {
        const transactions = req.body;
        const results = yield Promise.all(transactions.map((transaction) => __awaiter(void 0, void 0, void 0, function* () {
            const parsedData = {
                hash: transaction.hash,
                from: transaction.from,
                to: transaction.to,
                value: convertHexToDecimal(transaction.value),
                blockNumber: convertHexToDecimal(transaction.blockNumber)
            };
            const users = yield userModel_1.userModel.find({
                "wallet.address": {
                    $in: [parsedData.from, parsedData.to]
                }
            });
            if (!users.length) {
                return {
                    transactionHash: parsedData.hash,
                    status: 'skipped',
                    message: 'No matching users found'
                };
            }
            const updatePromises = users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
                const isReceived = user.wallet.address === parsedData.to;
                const notificationMessage = notificationService.formatTransactionMessage(isReceived ? 'received' : 'sent', parsedData.value, parsedData.from, parsedData.to);
                // Send notifications based on user preferences
                if (user.notificationPreferences.email) {
                    yield notificationService.sendEmail(user.email, 'New Transaction Alert', notificationMessage);
                }
                /*if (user.notificationPreferences.push) {
                  await notificationService.sendPushNotification(
                    user._id.toString(),
                    'New Transaction',
                    notificationMessage
                  );
                }
        */
                return userModel_1.userModel.findByIdAndUpdate(user._id, {
                    $push: {
                        "wallet.transactions": {
                            hash: parsedData.hash,
                            type: isReceived ? "received" : "sent",
                            amount: parsedData.value,
                            blockNumber: parsedData.blockNumber,
                            date: new Date(),
                            status: "confirmed",
                            from: parsedData.from,
                            to: parsedData.to,
                            read: false,
                            message: notificationMessage
                        }
                    }
                }, { new: true }).exec();
            }));
            yield Promise.all(updatePromises);
            return {
                transactionHash: parsedData.hash,
                status: 'processed',
                usersUpdated: users.length
            };
        })));
        res.status(200).json({
            success: true,
            message: 'Successfully processed transactions and sent notifications',
            results
        });
    }
    catch (error) {
        console.error("Error in webhook:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while processing webhook",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.quicknodeWebHook = quicknodeWebHook;
