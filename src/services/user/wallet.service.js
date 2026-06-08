// wallet.service.js — creditWallet as a reusable function
import {Wallet, WalletTransaction} from "../../models/index.js"
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from "../../config/appConstants.js";

export const creditWallet = async ({
  userId,
  amount,
  type,
  note       = null,
  referralId = null,
  session,
}) => {
  // Find or create wallet
  console.log("Crediting : ", userId, amount, type, note, referralId)
  let wallet = await Wallet.findOne({ user: userId }).session(session);
  if (!wallet) {
    [wallet] = await Wallet.create([{ user: userId }], { session });
  }

  const balanceBefore = wallet.balance;
  const balanceAfter  = balanceBefore + amount;

  // Increment balance
  await Wallet.updateOne(
    { _id: wallet._id },
    { $inc: { balance: amount, lifetimeEarnings: amount } },
    { session },
  );

  // Create wallet transaction record
  await WalletTransaction.create(
    [
      {
        wallet:    wallet._id,
        user:      userId,
        type,
        status:    TRANSACTION_STATUS.SUCCESS,
        amount,
        balanceBefore,
        balanceAfter,
        referral:  referralId,
        note,
      },
    ],
    { session },
  );
};