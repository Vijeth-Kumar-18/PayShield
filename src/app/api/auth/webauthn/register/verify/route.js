import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { db } from '@/lib/db';
import { webauthnChallenges, webauthnCredentials, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const expectedOrigin = 'http://localhost:3000'; // Should match production
const expectedRPID = 'localhost';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, registrationResponse } = body;

        // Fetch User
        const userMatches = await db.select().from(users).where(eq(users.email, email));
        if (!userMatches.length) throw new Error('User not found');
        const user = userMatches[0];

        // Fetch Challenge
        const challengeMatches = await db.select().from(webauthnChallenges).where(eq(webauthnChallenges.userId, user.id));
        if (!challengeMatches.length) throw new Error('No challenge found');
        const currentChallenge = challengeMatches[0].currentChallenge;

        let verification;
        try {
            verification = await verifyRegistrationResponse({
                response: registrationResponse,
                expectedChallenge: currentChallenge,
                expectedOrigin,
                expectedRPID,
            });
        } catch (err) {
            console.error('Verification failed', err);
            return NextResponse.json({ error: 'Verification failed', msg: err.message }, { status: 400 });
        }

        const { verified, registrationInfo } = verification;

        if (verified && registrationInfo) {
            const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = registrationInfo;

            const existingCreds = await db.select().from(webauthnCredentials).where(eq(webauthnCredentials.credentialId, Buffer.from(credentialID).toString('base64url')));

            if (existingCreds.length === 0) {
                await db.insert(webauthnCredentials).values({
                    userId: user.id,
                    credentialId: Buffer.from(credentialID).toString('base64url'),
                    publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
                    counter: counter,
                    transports: registrationResponse.response.transports || []
                });
            }

            return NextResponse.json({ success: true, message: 'Biometric successfully verified and stored' });
        }

        return NextResponse.json({ error: 'Not verified' }, { status: 400 });
    } catch (e) {
        console.error('Registration verify error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
