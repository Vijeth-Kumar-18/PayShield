import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userSessions } from '@/lib/db/schema';
import { comparePassword, generateToken, generateRefreshToken, generateOTP } from '@/lib/auth/utils';
import { sendVerificationSMS } from '@/lib/services/smsService';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { email, password, deviceInfo, ipAddress, userAgent } = await request.json();
    
    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check if email and phone are verified
    if (!user.isEmailVerified || !user.isPhoneVerified) {
      return NextResponse.json({ 
        error: 'Please verify your email and phone first',
        requiresVerification: true 
      }, { status: 403 });
    }
    
    // Generate 2FA OTP if enabled
    let twoFactorOTP = null;
    if (user.twoFactorEnabled) {
      twoFactorOTP = generateOTP();
      await sendVerificationSMS(user.phone, twoFactorOTP);
      // Store in cache
      if (!global.twoFactorStore) global.twoFactorStore = new Map();
      global.twoFactorStore.set(user.id, { otp: twoFactorOTP, expires: Date.now() + 5 * 60 * 1000 });
      
      return NextResponse.json({
        requiresTwoFactor: true,
        userId: user.id,
        message: '2FA code sent to your phone',
      });
    }
    
    // Generate tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);
    
    // Create session
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 7);
    
    await db.insert(userSessions).values({
      userId: user.id,
      sessionToken: refreshToken,
      deviceInfo,
      ipAddress,
      userAgent,
      expiresAt: sessionExpiry,
    });
    
    // Update last login
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));
    
    return NextResponse.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}