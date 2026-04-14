import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword, generateToken, generateRefreshToken } from '@/lib/auth/utils';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { 
      fullName,
      email, 
      phone, 
      password, 
      motherNickname,
      firstPetName,
      deviceId, 
      location, 
      systemInfo,
      gsmInfo,
      isEmailVerified,
      isPhoneVerified
    } = await request.json();
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Store security questions (hashed)
    const hashedMotherNickname = await hashPassword(motherNickname);
    const hashedFirstPetName = await hashPassword(firstPetName);
    
    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      phone,
      password: hashedPassword,
      fullName: fullName,
      motherNickname: hashedMotherNickname,
      firstPetName: hashedFirstPetName,
      deviceId: deviceId || 'unknown',
      location: location || 'unknown',
      isEmailVerified: isEmailVerified || false,
      isPhoneVerified: isPhoneVerified || false,
      systemInfo: JSON.stringify(systemInfo),
      gsmInfo: JSON.stringify(gsmInfo),
      createdAt: new Date(),
    }).returning();
    
    // Generate tokens
    const token = generateToken(newUser.id, newUser.email);
    const refreshToken = generateRefreshToken(newUser.id);
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      token,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}