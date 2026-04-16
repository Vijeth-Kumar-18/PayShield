import { NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { db } from '@/lib/db';
import { users, webauthnCredentials, webauthnChallenges } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';

const expectedOrigin = 'http://localhost:3000'; // Match production
const expectedRPID = 'localhost';

export async function POST(req) {
  try {
    const { email, authenticationResponse } = await req.json();

    if (!email || !authenticationResponse) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch user
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const user = dbUsers[0];

    // Get expected challenge
    const dbChallenge = await db.select().from(webauthnChallenges).where(eq(webauthnChallenges.userId, user.id)).limit(1);
    if (!dbChallenge.length) return NextResponse.json({ error: 'No active challenge found' }, { status: 400 });
    const expectedChallenge = dbChallenge[0].currentChallenge;

    // Retrieve the specific credential by ID
    const credIdBase64url = authenticationResponse.id;
    const dbCreds = await db.select().from(webauthnCredentials).where(eq(webauthnCredentials.credentialId, credIdBase64url)).limit(1);

    if (!dbCreds.length) return NextResponse.json({ error: 'Credential not recognized' }, { status: 400 });
    const credential = dbCreds[0];

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: authenticationResponse,
        expectedChallenge,
        expectedOrigin,
        expectedRPID,
        credential: {
          id: Buffer.from(credential.credentialId, 'base64url'),
          publicKey: Buffer.from(credential.publicKey, 'base64url'),
          counter: credential.counter,
          transports: credential.transports,
        },
      });
    } catch (error) {
       console.error('Verify Authentication Error Details:', error);
       return NextResponse.json({ error: 'Biometric verification failed', details: error.message }, { status: 400 });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
      // Update counter in DB for replay protection
      await db.update(webauthnCredentials)
        .set({ counter: authenticationInfo.newCounter })
        .where(eq(webauthnCredentials.id, credential.id));

      // Generate Session Token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
      const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        name: user.name,
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

      const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400,
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json({ error: 'Verification returned negative' }, { status: 400 });
    }
  } catch (error) {
    console.error('Login verify error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
