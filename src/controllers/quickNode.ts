import { Request, Response, RequestHandler } from "express";
import { userModel } from "../models/userModel";
import nodemailer from "nodemailer";
import { getEnvVar } from "../utils/env";
//import admin from 'firebase-admin';

// Types
interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
}

interface WebhookPayload {
  data: TransactionData[];
}

// Notification service
// Notification service
class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // Yahoo SMTP configuration
    this.emailTransporter = nodemailer.createTransport({
      host: "smtp.mail.yahoo.com",
      port: 465,
      secure: true, // true for 465
      auth: {
        user: process.env.EMAIL, // Your Yahoo email
        pass: process.env.EMAIL_PASSWORD, // Your Yahoo App Password
      },
      debug: true, // Enable debug logs
    });

    // Verify connection configuration
    this.verifyEmailConnection();
  }

  private async verifyEmailConnection(): Promise<void> {
    try {
      await this.emailTransporter.verify();
      console.log("Yahoo SMTP connection verified successfully");
    } catch (error) {
      console.error("Yahoo SMTP connection failed:", error);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    content: string
  ): Promise<boolean> {
    try {
      // Validate email address
      if (!to || !this.isValidEmail(to)) {
        console.error("Invalid email address:", to);
        return false;
      }

      const mailOptions = {
        from: {
          name: "ChainNotify",
          address: process.env.YAHOO_EMAIL as string,
        },
        to,
        subject,
        html: content,
        text: this.stripHtml(content), // Fallback plain text
      };

      const info = await this.emailTransporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return true;
    } catch (error: any) {
      console.error("Email notification error details:", {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        recipient: to,
        subject,
      });

      // Handle specific Yahoo SMTP error cases
      if (error.code === "EENVELOPE") {
        console.error(
          "Invalid sender or recipient address - check Yahoo email settings"
        );
      } else if (error.code === "EAUTH") {
        console.error("Yahoo authentication failed - check app password");
      }

      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "");
  }

  // ... rest of the NotificationService methods remain the same ...
  formatTransactionMessage(
    type: "sent" | "received",
    amount: number,
    from: string,
    to: string
  ): string {
    const formattedAmount = amount.toFixed(8);
    return type === "received"
      ? `You received ${formattedAmount} ETH from ${from}`
      : `You sent ${formattedAmount} ETH to ${to}`;
  }
}
// Utility functions
const convertHexToDecimal = (hexValue: string): number => {
  return parseInt(hexValue, 16);
};

const validateTransaction = (
  transaction: any
): transaction is TransactionData => {
  return (
    transaction &&
    typeof transaction.hash === "string" &&
    typeof transaction.from === "string" &&
    typeof transaction.to === "string" &&
    typeof transaction.value === "string" &&
    typeof transaction.blockNumber === "string"
  );
};

// Webhook handler
const quicknodeWebHook: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const notificationService = new NotificationService();

  try {
    const transactions = req.body;
    //console.log(transactions)
    const results = await Promise.all(
      transactions.map(async (transaction: TransactionData) => {
        const parsedData = {
          hash: transaction.hash,
          from: transaction.from,
          to: transaction.to,
          value: convertHexToDecimal(transaction.value),
          blockNumber: convertHexToDecimal(transaction.blockNumber),
        };

        const users = await userModel.find({
          "wallet.address": {
            $in: [parsedData.from, parsedData.to],
          },
        });

        if (users.length < 1) {
          return {
            transactionHash: parsedData.hash,
            status: "skipped",
            message: "No matching users found",
          };
        }

        const updatePromises = users.map(async (user) => {
          const isReceived = user.wallet.address === parsedData.to;
          const notificationMessage =
            notificationService.formatTransactionMessage(
              isReceived ? "received" : "sent",
              parsedData.value,
              parsedData.from,
              parsedData.to
            );

          // Send notifications based on user preferences
          if (user.notificationPreferences.email) {
            await notificationService.sendEmail(
              user.email,
              "New Transaction Alert",
              notificationMessage
            );
          }

          /*if (user.notificationPreferences.push) {
          await notificationService.sendPushNotification(
            user._id.toString(),
            'New Transaction',
            notificationMessage
          );
        }
*/

          return userModel
            .findByIdAndUpdate(
              user._id,
              {
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
                    message: notificationMessage,
                  },
                },
              },
              { new: true }
            )
            .exec();
        });

        await Promise.all(updatePromises);

        return {
          transactionHash: parsedData.hash,
          status: "processed",
          usersUpdated: users.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Successfully processed transactions and sent notifications",
      results,
    });
  } catch (error: any) {
    console.error("Error in webhook:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error while processing webhook",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export { quicknodeWebHook };
