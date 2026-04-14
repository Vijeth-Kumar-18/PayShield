import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const sql = neon(process.env.DATABASE_URL);

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email sender
const sendEmail = async (to, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('Email config:', {
    hasUser: !!emailUser,
    hasPass: !!emailPass,
    user: emailUser
  });
  
  if (!emailUser || !emailPass) {
    console.log(`[TEST MODE] Would send OTP ${otp} to ${to}`);
    return { success: false, testMode: true, otp };
  }
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    
    await transporter.sendMail({
      from: `"PAYSHIELD" <${emailUser}>`,
      to: to,
      subject: 'Your PAYSHIELD Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your Verification Code</h2>
          <p>Your PAYSHIELD verification code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #4f46e5;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    console.log(`✅ Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// SMS sender using Twilio
let twilioClient = null;

// Initialize Twilio if credentials are valid
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID !== 'your-twilio-account-sid') {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ Twilio configured for SMS');
}

const sendSMS = async (to, otp) => {
  // Format phone number (ensure it has country code)
  let phoneNumber = to;

  if (!phoneNumber.startsWith('+')) {
    phoneNumber = '+91' + phoneNumber; // ✅ FIXED HERE
  }
  
  if (!twilioClient) {
    console.log(`[TEST MODE] Would send SMS to ${phoneNumber} with OTP: ${otp}`);
    return { success: false, testMode: true, otp };
  }
  
  try {
    const message = await twilioClient.messages.create({
      body: `🔐 PAYSHIELD: Your verification code is ${otp}. Valid for 10 minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`✅ SMS sent to ${phoneNumber}: ${message.sid}`);
    return { success: true };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
};

export async function POST(request) {
  try {
    const { identifier, type } = await request.json();
    
    console.log('Send OTP request:', { identifier, type });
    
    if (!identifier || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    console.log(`Generated OTP for ${identifier}: ${otp}`);
    
    // Store OTP in database
    await sql`
      DELETE FROM otp_codes WHERE identifier = ${identifier} AND type = ${type}
    `;
    
    await sql`
      INSERT INTO otp_codes (identifier, otp, type, expires_at, created_at)
      VALUES (${identifier}, ${otp}, ${type}, ${expiresAt}, NOW())
    `;
    
    // Send based on type
    if (type === 'email') {
      const result = await sendEmail(identifier, otp);
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Verification code sent to your email'
        });
      } else if (result.testMode) {
        return NextResponse.json({ 
          success: true, 
          testMode: true, 
          testOtp: otp,
          message: 'Test mode: Check console for OTP'
        });
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }
    
    if (type === 'phone') {
      const result = await sendSMS(identifier, otp);
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Verification code sent to your phone'
        });
      } else if (result.testMode) {
        return NextResponse.json({ 
          success: true, 
          testMode: true, 
          testOtp: otp,
          message: 'Test mode: Check console for OTP'
        });
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      testMode: true, 
      testOtp: otp 
    });
    
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}