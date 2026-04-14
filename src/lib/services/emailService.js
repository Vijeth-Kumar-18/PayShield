import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email, otp, name = 'User') => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('Email check:', {
    hasUser: !!emailUser,
    hasPass: !!emailPass,
    user: emailUser
  });
  
  if (!emailUser || !emailPass) {
    console.log(`[TEST MODE] OTP for ${email}: ${otp}`);
    return { success: true, testMode: true, otp };
  }

  try {
    // CORRECT: createTransport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    await transporter.sendMail({
      from: `"PAYSHIELD Security" <${emailUser}>`,
      to: email,
      subject: 'PAYSHIELD - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4f46e5;">PAYSHIELD Verification</h2>
          <p>Hello ${name},</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px;">
            <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #4f46e5;">${otp}</span>
          </div>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">PAYSHIELD - Secure Payment Platform</p>
        </div>
      `,
    });
    
    console.log(`✅ Email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};