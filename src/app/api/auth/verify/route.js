import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { email, phone, otp, type } = await request.json();
    
    const identifier = type === 'email' ? email : phone;
    const storedData = global.otpStore?.get(identifier);
    
    if (!storedData || storedData.otp !== otp || storedData.expires < Date.now()) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }
    
    // Update user verification status
    if (type === 'email') {
      await db.update(users).set({ isEmailVerified: true }).where(eq(users.email, email));
    } else if (type === 'phone') {
      await db.update(users).set({ isPhoneVerified: true }).where(eq(users.phone, phone));
    }
    
    // Clean up OTP
    global.otpStore.delete(identifier);
    
    return NextResponse.json({ success: true, message: 'Verification successful' });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}