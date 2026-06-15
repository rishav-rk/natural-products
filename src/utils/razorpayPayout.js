import axios from "axios";
import config from "../config/config.js";

const RAZORPAY_X_BASE_URL = "https://api.razorpay.com/v1";

// Base axios instance for RazorpayX
const razorpayXClient = axios.create({
  baseURL: RAZORPAY_X_BASE_URL,
  auth: {
    username: config.razorpayX.id,
    password: config.razorpayX.secret,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

// ── 1. Find or create contact ─────────────────────────────────────────────
export const findOrCreateContact = async (userId, name, email, contactNumber) => {
  const { data } = await razorpayXClient.get("/contacts", {
    params: { reference_id: userId.toString() },
  });

  if (data?.items?.length > 0) return data.items[0].id;

  const { data: contact } = await razorpayXClient.post("/contacts", {
    name,
    email,
    contact: contactNumber,
    reference_id: userId.toString(),
    type: "customer",
    notes: {
        "notes_key_1": "App wallet amount availer"
    }
  });

  return contact.id;
};

// ── 2. Find or create fund account ───────────────────────────────────────
export const findOrCreateFundAccount = async (
  contactId,
  accountNumber,
  ifsc,
  name,
) => {
  const { data } = await razorpayXClient.get("/fund_accounts", {
    params: { contact_id: contactId },
  });

  if (data?.items?.length > 0) {
    const match = data.items.find(
      (fa) =>
        fa.bank_account?.account_number === accountNumber &&
        fa.bank_account?.ifsc === ifsc &&
        fa.active === true,
    );
    if (match) return match.id;
  }

  const { data: fundAccount } = await razorpayXClient.post("/fund_accounts", {
    contact_id: contactId,
    account_type: "bank_account",
    bank_account: { name, ifsc, account_number: accountNumber },
  });

  return fundAccount.id;
};

// ── 3. Create payout ──────────────────────────────────────────────────────
export const createPayout = async (fundAccountId, amount, transactionId) => {
  const { data: payout } = await razorpayXClient.post("/payouts", {
    account_number: config.razorpayX.accountNumber,
    fund_account_id: fundAccountId,
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    mode: "IMPS",
    purpose: "payout",
    queue_if_low_balance: true,
    narration: "Wallet withdrawal",
    reference_id: transactionId.toString(),
  });

  return payout;
};

// ── Orchestrator ──────────────────────────────────────────────────────────
export const initiateRazorpayPayout = async ({
  userId,
  name,
  email,
  accountNumber,
  ifsc,
  amount,
  transactionId,
  contact
}) => {
  const contactId = await findOrCreateContact(userId, name, email, contact);
  const fundAccountId = await findOrCreateFundAccount(
    contactId,
    accountNumber,
    ifsc,
    name,
  );
  const payout = await createPayout(fundAccountId, amount, transactionId);
  return payout;
};
