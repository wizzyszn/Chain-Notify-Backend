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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationById = exports.markAllAsRead = exports.markAsRead = exports.getAllTransactions = exports.connectWallet = void 0;
const userModel_1 = require("../models/userModel");
const response_1 = require("../utils/response");
const types_1 = require("../types");
const mongoose_1 = require("mongoose");
//connect wallet
const connectWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address, email } = req.body;
    try {
        const response = yield userModel_1.userModel.findOne({ email });
        if (!response)
            throw new Error(`This user doesn't exist in our database`);
        response.wallet.address = address;
        yield response.save();
        return (0, response_1.sendSuccessRes)(response, res, "wallet connect", 200, types_1.typeOfResponse.json, true);
    }
    catch (err) {
        console.error("Error occurred while connecting wallet:", err);
        return (0, response_1.sendFailedRes)(res, 500, undefined, err.message);
    }
});
exports.connectWallet = connectWallet;
//get all transactions
const getAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield userModel_1.userModel.findOne({ email });
        if (!user)
            throw new Error(`This user doesn't exist in our database`);
        return (0, response_1.sendSuccessRes)(user.wallet.transactions, res, "transactions retrieved", 200, types_1.typeOfResponse.json, true);
    }
    catch (err) {
        console.error("Error occurred while retrieving transactions:", err);
        return (0, response_1.sendFailedRes)(res, 500, undefined, err.message);
    }
});
exports.getAllTransactions = getAllTransactions;
// mark as read
// mark as read
// mark as read
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transactionId } = req.params; // Assuming transactionId is the hash
        const { email } = req.body;
        const updatedUser = yield userModel_1.userModel.findOneAndUpdate({
            email,
            'wallet.transactions.hash': transactionId
        }, {
            $set: {
                'wallet.transactions.$.read': true
            }
        }, {
            new: true
        });
        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: 'Transaction not found or user does not exist'
            });
            return;
        }
        // Find the updated transaction
        const updatedTransaction = updatedUser.wallet.transactions.find(transaction => transaction.hash === transactionId);
        res.status(200).json({
            success: true,
            data: updatedTransaction
        });
        return;
    }
    catch (error) {
        console.error('Error marking transaction as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating transaction read status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
    }
});
exports.markAsRead = markAsRead;
// mark all as read
const markAllAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const updatedUser = yield userModel_1.userModel.findOneAndUpdate({ email }, {
            $set: {
                'wallet.transactions.$[elem].read': true
            }
        }, {
            arrayFilters: [{ 'elem.read': false }],
            new: true,
            projection: {
                'wallet.transactions': 1
            }
        });
        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: updatedUser.wallet.transactions
        });
        return;
    }
    catch (error) {
        console.error('Error marking all transactions as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating transactions read status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
    }
});
exports.markAllAsRead = markAllAsRead;
const getNotificationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { notificationId } = req.params;
        const { email } = req.body;
        console.log(notificationId);
        // Validate if the notificationId is a valid ObjectId
        if (!mongoose_1.Types.ObjectId.isValid(notificationId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid notification ID format',
            });
            return;
        }
        // Find user and specific transaction using the transaction's _id
        const user = yield userModel_1.userModel.findOne({
            email,
            'wallet.transactions._id': new mongoose_1.Types.ObjectId(notificationId)
        }, {
            'wallet.transactions.$': 1
        });
        if (!user || !user.wallet.transactions.length) {
            res.status(404).json({
                success: false,
                message: 'Transaction notification not found',
            });
            return;
        }
        // Get the specific transaction
        const transaction = user.wallet.transactions[0];
        // Mark transaction as read
        yield userModel_1.userModel.updateOne({
            email,
            'wallet.transactions._id': new mongoose_1.Types.ObjectId(notificationId)
        }, {
            $set: {
                'wallet.transactions.$.read': true,
            },
        });
        res.status(200).json({
            success: true,
            data: transaction,
        });
    }
    catch (error) {
        console.error('Error fetching transaction notification:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction notification',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.getNotificationById = getNotificationById;
