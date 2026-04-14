import twilio from 'twilio';

let client = null;

// Initialize Twilio with your credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (accountSid && authToken && accountSid !== 'your-twilio-account-sid') {
  client = twilio(accountSid, authToken);
  console.log('✅ Twilio SMS service configured');
} else {
  console.log('⚠️ Twilio not configured - SMS will use test mode');
}

export const sendVerificationSMS = async (phoneNumber, otp) => {
  if (!client) {
    console.log(`[TEST MODE] SMS would be sent to ${phoneNumber} with OTP: ${otp}`);
    return { success: true, testMode: true, otp };
  }

  try {
    const message = await client.messages.create({
      body: `🔐 PAYSHIELD: Your verification code is ${otp}. Valid for 10 minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`✅ SMS sent to ${phoneNumber}: ${message.sid}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};