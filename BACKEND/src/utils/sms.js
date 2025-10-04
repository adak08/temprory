import twilio from "twilio";
import { ApiError } from "./ApiError.js";


const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);


const sendSMS = async (to, message) => {
  try {
    if (!to || !message) {
      throw new Error("Recipient phone number and message are required.");
    }
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE, // Your Twilio number
      to
    });
    console.log(`SMS sent successfully to ${to}`);
  } catch (error) {
    console.error("SMS sending failed:", error);
    throw new ApiError(500, `Failed to send SMS to ${to}: ${error.message}`);
  }
};

export { sendSMS };