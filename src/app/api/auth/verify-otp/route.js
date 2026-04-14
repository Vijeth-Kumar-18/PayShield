import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { identifier, otp, type } = await request.json();
    
    console.log('Verify OTP request:', { identifier, otp, type });
    
    if (!identifier || !otp || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find the OTP in database
    const result = await sql`
      SELECT * FROM otp_codes 
      WHERE identifier = ${identifier} 
        AND type = ${type}
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    console.log('Found OTP records:', result.length);
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'OTP not found or expired. Please request a new code.' }, { status: 400 });
    }
    
    const otpRecord = result[0];
    console.log('Stored OTP:', otpRecord.otp);
    console.log('User entered OTP:', otp);
    
    // Compare OTP (stored as plain text for now)
    if (otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }
    
    // Delete used OTP
    await sql`
      DELETE FROM otp_codes WHERE id = ${otpRecord.id}
    `;
    
    console.log(`✅ OTP verified for ${identifier}`);
    
    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
    
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}