"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRouter = void 0;
const express_1 = require("express");
const walletControllers_1 = require("../controllers/walletControllers");
const walletRouter = (0, express_1.Router)();
exports.walletRouter = walletRouter;
walletRouter.post('/connect', walletControllers_1.connectWallet);
walletRouter.post('/transactions', walletControllers_1.getAllTransactions);
walletRouter.post('/mark-as-read/:transactionId', walletControllers_1.markAsRead);
walletRouter.post('/mark-all-as-read', walletControllers_1.markAllAsRead);
//get notification by id
walletRouter.post('/notification/:notificationId', walletControllers_1.getNotificationById);
