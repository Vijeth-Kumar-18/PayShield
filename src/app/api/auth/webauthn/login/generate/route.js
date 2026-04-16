import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { db } from '@/lib/db';
import { users, webauthnCredentials, webauthnChallenges } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const rpID = 'localhost';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Fetch user
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = dbUsers[0];

    // Fetch user credentials
    const credentials = await db.select().from(webauthnCredentials).where(eq(webauthnCredentials.userId, user.id));

    if (!credentials.length) {
      return NextResponse.json({ error: 'No biometric credentials registered' }, { status: 400 });
    }

    // Generate Authentication Options
    const options = await generateAuthenticationOptions({
      allowCredentials: credentials.map(cred => ({
        id: Buffer.from(cred.credentialId, 'base64url'),
        type: 'public-key',
        transports: cred.transports,
      })),
      userVerification: 'preferred',
      rpID,
    });

    // Store challenge in DB
    const existingChallenge = await db.select().from(webauthnChallenges).where(eq(webauthnChallenges.userId, user.id)).limit(1);

    if (existingChallenge.length > 0) {
      await db.update(webauthnChallenges)
        .set({ currentChallenge: options.challenge })
        .where(eq(webauthnChallenges.userId, user.id));
    } else {
      await db.insert(webauthnChallenges).values({
        userId: user.id,
        currentChallenge: options.challenge,
      });
    }

    return NextResponse.json(options);
  } catch (error) {
    console.error('Authentication generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
