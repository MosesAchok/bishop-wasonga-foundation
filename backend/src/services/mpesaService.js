
import axios from "axios";

// ==========================================
// DARAJA API BASE URL
// ==========================================

const getDarajaBaseUrl = () => {
  const environment = process.env.MPESA_ENV;

  if (environment === "production") {
    return "https://api.safaricom.co.ke";
  }

  return "https://sandbox.safaricom.co.ke";
};

// ==========================================
// FORMAT KENYAN PHONE NUMBER
// ==========================================

export const formatMpesaPhone = (phone) => {
  const cleanedPhone = String(phone || "").replace(/\s+/g, "");

  // Format: 254712345678
  if (/^254[17]\d{8}$/.test(cleanedPhone)) {
    return cleanedPhone;
  }

  // Format: +254712345678
  if (/^\+254[17]\d{8}$/.test(cleanedPhone)) {
    return cleanedPhone.substring(1);
  }

  // Format: 0712345678 or 0112345678
  if (/^0[17]\d{8}$/.test(cleanedPhone)) {
    return `254${cleanedPhone.substring(1)}`;
  }

  throw new Error("Invalid Kenyan M-Pesa phone number.");
};

// ==========================================
// GENERATE DARAJA ACCESS TOKEN
// ==========================================

export const getMpesaAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa API credentials are not configured.");
  }

  const credentials = Buffer.from(
    `${consumerKey}:${consumerSecret}`
  ).toString("base64");

  const response = await axios.get(
    `${getDarajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
      timeout: 15000,
    }
  );

  if (!response.data?.access_token) {
    throw new Error("Unable to obtain M-Pesa access token.");
  }

  return response.data.access_token;
};

// ==========================================
// GENERATE STK PUSH TIMESTAMP
// ==========================================

const generateTimestamp = () => {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return (
    values.year +
    values.month +
    values.day +
    values.hour +
    values.minute +
    values.second
  );
};

// ==========================================
// GENERATE STK PUSH PASSWORD
// ==========================================

const generateStkPassword = (
  shortCode,
  passkey,
  timestamp
) => {
  return Buffer.from(
    `${shortCode}${passkey}${timestamp}`
  ).toString("base64");
};

// ==========================================
// INITIATE M-PESA STK PUSH
// ==========================================

export const initiateStkPush = async ({
  phone,
  amount,
  accountReference,
  transactionDesc,
}) => {
  // BLOCK REAL STK PUSH DURING TEST MODE
  if (process.env.MPESA_TEST_MODE === "true") {
    throw new Error(
      "STK Push is disabled while callback test mode is active."
    );
  }

  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const transactionType = process.env.MPESA_TRANSACTION_TYPE;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  if (
    !shortCode ||
    !passkey ||
    !transactionType ||
    !callbackUrl
  ) {
    throw new Error(
      "M-Pesa STK Push configuration is incomplete."
    );
  }

  // Validate callback URL.
  let callback;

  try {
    callback = new URL(callbackUrl);
  } catch {
    throw new Error("M-Pesa callback URL is invalid.");
  }

  if (
    callback.protocol !== "https:" ||
    callback.hostname === "your-domain.com"
  ) {
    throw new Error(
      "A publicly accessible HTTPS callback URL is required."
    );
  }

  const formattedPhone = formatMpesaPhone(phone);
  const numericAmount = Number(amount);

  if (
    !Number.isSafeInteger(numericAmount) ||
    numericAmount < 1
  ) {
    throw new Error(
      "M-Pesa amount must be a positive whole number."
    );
  }

  if (!accountReference) {
    throw new Error(
      "A donation account reference is required."
    );
  }

  const timestamp = generateTimestamp();

  const password = generateStkPassword(
    shortCode,
    passkey,
    timestamp
  );

  const accessToken = await getMpesaAccessToken();

  const requestData = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: transactionType,
    Amount: numericAmount,
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: String(accountReference).substring(0, 12),
    TransactionDesc: String(
      transactionDesc || "Foundation Donation"
    ).substring(0, 13),
  };

  const response = await axios.post(
    `${getDarajaBaseUrl()}/mpesa/stkpush/v1/processrequest`,
    requestData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  return response.data;
};

// ==========================================
// QUERY M-PESA STK PUSH STATUS
// ==========================================

export const queryStkPush = async (checkoutRequestId) => {
  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortCode || !passkey) {
    throw new Error(
      "M-Pesa STK Query configuration is incomplete."
    );
  }

  if (
    typeof checkoutRequestId !== "string" ||
    !checkoutRequestId.trim()
  ) {
    throw new Error(
      "A valid Checkout Request ID is required."
    );
  }

  const cleanCheckoutRequestId = checkoutRequestId.trim();

  // STRICT TEST-ONLY SIMULATION
  // Only test-prefixed IDs can use this simulation.
  if (
    process.env.MPESA_TEST_MODE === "true" &&
    cleanCheckoutRequestId.startsWith("TEST-CHECKOUT-")
  ) {
    console.log("Simulated STK Query used for test ID.");

    return {
      ResponseCode: "0",
      ResponseDescription: "Test simulation successful.",
      ResultCode: "0",
      ResultDesc: "Simulated successful payment verification.",
    };
  }

  // REAL DARAJA STK QUERY
  const timestamp = generateTimestamp();

  const password = generateStkPassword(
    shortCode,
    passkey,
    timestamp
  );

  const accessToken = await getMpesaAccessToken();

  const response = await axios.post(
    `${getDarajaBaseUrl()}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: cleanCheckoutRequestId,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  return response.data;
};
