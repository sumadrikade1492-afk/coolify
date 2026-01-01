import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client: twilio.Twilio | null = null;

function getClient(): twilio.Twilio {
  if (!client) {
    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials not configured");
    }
    client = twilio(accountSid, authToken);
  }
  return client;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationSMS(phoneNumber: string, code: string): Promise<boolean> {
  try {
    const twilioClient = getClient();
    
    if (!twilioPhoneNumber) {
      throw new Error("Twilio phone number not configured");
    }

    await twilioClient.messages.create({
      body: `Your NRIChristianMatrimony verification code is: ${code}. This code expires in 10 minutes.`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}

export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && twilioPhoneNumber);
}
