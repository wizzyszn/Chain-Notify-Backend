import { Request, RequestHandler, Response } from "express"
import { userModel } from "../models/userModel"
import { sendFailedRes, sendSuccessRes } from "../utils/response"
import { typeOfResponse } from "../types"
import { Types } from "mongoose"
interface WalletDetail {
    address : string,
    balance : number,
    email : string
}

interface ConnectWalletRequest extends Request {
    body: WalletDetail
  }
//connect wallet
  const connectWallet = async (req : ConnectWalletRequest, res : Response) =>{
    const {address,email} = req.body;
    try{
        const response = await userModel.findOne({email});
        if(!response)
            throw new Error(`This user doesn't exist in our database`);

        response.wallet.address = address;
        await response.save();
        return sendSuccessRes(response,res,"wallet connect",200,typeOfResponse.json, true)
    }catch (err: any) {
        console.error("Error occurred while connecting wallet:", err);
        return sendFailedRes(
          res,
          500,
          undefined,
          err.message as string
        );
      }
  }
//get all transactions
const getAllTransactions = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
      const user = await userModel.findOne({ email })
      if (!user) throw new Error(`This user doesn't exist in our database`);

      return sendSuccessRes(user.wallet.transactions, res, "transactions retrieved", 200, typeOfResponse.json, true);
  } catch (err: any) {
      console.error("Error occurred while retrieving transactions:", err);
      return sendFailedRes(res, 500, undefined, err.message as string);
  }
};

// mark as read
// mark as read
// mark as read
const markAsRead  =
  async (req: Request, res: Response) : Promise<void> => {
    try {
      const { transactionId } = req.params; // Assuming transactionId is the hash
      const { email } = req.body;
  
      const updatedUser = await userModel.findOneAndUpdate(
        { 
          email,
          'wallet.transactions.hash': transactionId 
        },
        { 
          $set: { 
            'wallet.transactions.$.read': true 
          } 
        },
        { 
          new: true
        }
      );
  
      if (!updatedUser) {
         res.status(404).json({ 
          success: false, 
          message: 'Transaction not found or user does not exist' 
        });
        return
      }
  
      // Find the updated transaction
      const updatedTransaction = updatedUser.wallet.transactions.find(transaction => transaction.hash === transactionId);
      res.status(200).json({
        success: true,
        data: updatedTransaction
      });
      return
  
    } catch (error) {
      console.error('Error marking transaction as read:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating transaction read status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return
    }
  }
// mark all as read
const markAllAsRead  : RequestHandler= async (req: Request, res: Response) : Promise<void> => {
  try {
    const { email } = req.body;

    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      { 
        $set: { 
          'wallet.transactions.$[elem].read': true 
        } 
      },
      { 
        arrayFilters: [{ 'elem.read': false }],
        new: true,
        projection: {
          'wallet.transactions': 1
        }
      }
    );

    if (!updatedUser) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return
    }

    res.status(200).json({
      success: true,
      data: updatedUser.wallet.transactions
    });
    return

  } catch (error) {
    console.error('Error marking all transactions as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating transactions read status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return
  }
}
const getNotificationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const { email } = req.body;
    console.log(notificationId)
    // Validate if the notificationId is a valid ObjectId
    if (!Types.ObjectId.isValid(notificationId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid notification ID format',
      });
      return;
    }

    // Find user and specific transaction using the transaction's _id
    const user = await userModel.findOne(
      {
        email,
        'wallet.transactions._id': new Types.ObjectId(notificationId)
      },
      {
        'wallet.transactions.$': 1
      }
    );

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
    await userModel.updateOne(
      { 
        email, 
        'wallet.transactions._id': new Types.ObjectId(notificationId)
      },
      {
        $set: {
          'wallet.transactions.$.read': true,
        },
      }
    );

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error fetching transaction notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

//export functions
  export {
    connectWallet,
    getAllTransactions,
    markAsRead,
    markAllAsRead,
    getNotificationById
  }