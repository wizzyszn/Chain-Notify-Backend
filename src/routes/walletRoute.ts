import { Router } from "express";
import { connectWallet, getAllTransactions, getNotificationById, markAllAsRead, markAsRead } from "../controllers/walletControllers";

const walletRouter = Router();

walletRouter.post('/connect', connectWallet);
walletRouter.post('/transactions', getAllTransactions);
walletRouter.post('/mark-as-read/:transactionId', markAsRead);
walletRouter.post('/mark-all-as-read', markAllAsRead);
//get notification by id
walletRouter.post('/notification/:notificationId', getNotificationById);

export {
    walletRouter
}