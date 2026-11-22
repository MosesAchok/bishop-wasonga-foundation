
import Donation from "../models/Donation.js";
import {
  formatMpesaPhone,
  initiateStkPush,
  queryStkPush,
} from "../services/mpesaService.js";

// ==========================================
// SUBMIT DONATION AND INITIATE STK PUSH
// ==========================================

export const submitDonationEnquiry = async (req, res) => {
  let donation;

  try {
    const { name, email, phone, amount, message } = req.body;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = formatMpesaPhone(phone);
    const cleanAmount = Number(amount);
    const cleanMessage = message?.trim() || "";

    if (!Number.isSafeInteger(cleanAmount) || cleanAmount < 1) {
      return res.status(400).json({
        success: false,
        message: "Donation amount must be a positive whole number.",
      });
    }

    // Save donation before initiating payment.
    donation = await Donation.create({
      id: `DON-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      amount: cleanAmount,
      message: cleanMessage,
      method: "M-Pesa",
      status: "Pending",
    });

    // Initiate Safaricom STK Push.
    const stkResponse = await initiateStkPush({
      phone: cleanPhone,
      amount: cleanAmount,
      accountReference: donation.id,
      transactionDesc: "Foundation Donation",
    });

    if (
      String(stkResponse.ResponseCode) !== "0" ||
      !stkResponse.CheckoutRequestID
    ) {
      donation.mpesaResultDescription =
        stkResponse.ResponseDescription ||
        stkResponse.errorMessage ||
        "Safaricom did not accept the STK Push request.";

      // Keep Pending because the outcome could be uncertain.
      await donation.save();

      return res.status(502).json({
        success: false,
        message:
          "Payment request could not be confirmed. Please contact the foundation before retrying.",
      });
    }

    donation.merchantRequestId =
      stkResponse.MerchantRequestID || "";

    donation.checkoutRequestId =
      stkResponse.CheckoutRequestID;

    donation.mpesaResultDescription =
      stkResponse.ResponseDescription ||
      "M-Pesa payment request initiated.";

    await donation.save();

    return res.status(201).json({
      success: true,
      message:
        "Payment request sent. Please check your phone and enter your M-Pesa PIN.",
      data: {
        donationId: donation.id,
        amount: donation.amount,
        phone: donation.phone,
        status: donation.status,
      },
    });
  } catch (error) {
    console.error("Donation submission error:", error.message);

    if (donation) {
      donation.mpesaResultDescription =
        "Payment initiation outcome requires review.";

      try {
        await donation.save();
      } catch (saveError) {
        console.error(
          "Unable to update donation record:",
          saveError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Your payment request could not be confirmed. Please contact the foundation before attempting another payment.",
    });
  }
};

// ==========================================
// SAFARICOM STK PUSH CALLBACK
// ==========================================

export const mpesaCallback = async (req, res) => {
  // Always acknowledge callbacks to avoid unnecessary retries.
  const acknowledge = () =>
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Callback received.",
    });

  try {
    const callback = req.body?.Body?.stkCallback;

    if (!callback?.CheckoutRequestID) {
      console.error("Invalid M-Pesa callback received.");
      return acknowledge();
    }

    const donation = await Donation.findOne({
      checkoutRequestId: callback.CheckoutRequestID,
    });

    if (!donation) {
      console.error(
        "Unmatched M-Pesa CheckoutRequestID received."
      );
      return acknowledge();
    }

    // Never alter completed or cancelled donations.
    if (
      donation.status === "Completed" ||
      donation.status === "Cancelled"
    ) {
      return acknowledge();
    }

    // Callback failures are recorded but not treated as
    // definitive financial reconciliation.
    if (String(callback.ResultCode) !== "0") {
      donation.mpesaResultCode = String(
        callback.ResultCode ?? ""
      );

      donation.mpesaResultDescription =
        callback.ResultDesc ||
        "Payment outcome requires reconciliation.";

      await donation.save();

      console.log(
        "M-Pesa callback requires reconciliation:",
        donation.id
      );

      return acknowledge();
    }

    // Query Safaricom using the known CheckoutRequestID.
    let queryResponse;

    try {
      queryResponse = await queryStkPush(
        donation.checkoutRequestId
      );
    } catch (queryError) {
      console.error(
        "M-Pesa STK Query failed:",
        queryError.response?.data || queryError.message
      );

      donation.mpesaResultDescription =
        "Payment awaiting Safaricom verification.";

      await donation.save();

      return acknowledge();
    }

    // Query request itself must be accepted.
    if (String(queryResponse.ResponseCode) !== "0") {
      donation.mpesaResultDescription =
        "Safaricom verification could not be completed.";

      await donation.save();

      return acknowledge();
    }

    // Only proceed when the query explicitly reports success.
    if (String(queryResponse.ResultCode ?? "") !== "0") {
      donation.mpesaResultCode = String(
        queryResponse.ResultCode ?? ""
      );

      donation.mpesaResultDescription =
        queryResponse.ResultDesc ||
        "Payment status is not confirmed. Reconciliation required.";

      await donation.save();

      return acknowledge();
    }

    // Extract callback metadata.
    const metadataItems =
      callback.CallbackMetadata?.Item || [];

    const getMetadataValue = (name) =>
      metadataItems.find((item) => item.Name === name)?.Value;

    const receiptNumber = getMetadataValue(
      "MpesaReceiptNumber"
    );

    const paidAmount = Number(
      getMetadataValue("Amount")
    );

    const paidPhone = getMetadataValue("PhoneNumber");

    // Require all critical payment details.
    if (
      !receiptNumber ||
      !Number.isFinite(paidAmount) ||
      !paidPhone
    ) {
      donation.mpesaResultDescription =
        "Safaricom payment verification requires further review.";

      await donation.save();

      return acknowledge();
    }

    // Normalize callback phone number.
    let normalizedPaidPhone;

    try {
      normalizedPaidPhone = formatMpesaPhone(
        String(paidPhone)
      );
    } catch {
      normalizedPaidPhone = "";
    }

    // Match payment against original donation.
    if (
      paidAmount !== donation.amount ||
      normalizedPaidPhone !== donation.phone
    ) {
      console.error(
        "Donation payment details mismatch:",
        donation.id
      );

      donation.mpesaResultDescription =
        "Payment details mismatch. Manual reconciliation required.";

      await donation.save();

      return acknowledge();
    }

    // Atomically complete only a Pending donation.
    const completedDonation =
      await Donation.findOneAndUpdate(
        {
          _id: donation._id,
          status: "Pending",
        },
        {
          $set: {
            status: "Completed",
            reference: String(receiptNumber),
            mpesaResultCode: "0",
            mpesaResultDescription:
              "Safaricom STK Query confirmed success.",
            paidAt: new Date(),
          },
        },
        { new: true }
      );

    if (!completedDonation) {
      return acknowledge();
    }

    console.log(
      "Verified donation completed:",
      completedDonation.id,
      completedDonation.reference
    );

    return acknowledge();
  } catch (error) {
    console.error(
      "M-Pesa callback processing error:",
      error.message
    );

    return acknowledge();
  }
};
