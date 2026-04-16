import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { db } from '@/lib/db';
import { webauthnChallenges, webauthnCredentials, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const rpName = 'PayShield Secure';
const rpID = 'localhost'; // Should use env var in production

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');
        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

        // Get user ID
        const selectedUsers = await db.select().from(users).where(eq(users.email, email));
        if (selectedUsers.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const user = selectedUsers[0];

        // Get existing credentials
        const existingCredentials = await db.select().from(webauthnCredentials).where(eq(webauthnCredentials.userId, user.id));

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: new Uint8Array(Buffer.from(user.id.toString())),
            userName: user.email,
            timeout: 60000,
            attestationType: 'none',
            excludeCredentials: existingCredentials.map(cred => ({
                id: Buffer.from(cred.credentialId, 'base64url'),
                type: 'public-key',
                transports: cred.transports || ['internal'],
            })),
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'preferred',
            },
            supportedAlgorithmIDs: [-7, -257],
        });

        // Store the challenge
        const existingChallenge = await db.select().from(webauthnChallenges).where(eq(webauthnChallenges.userId, user.id));
        if (existingChallenge.length > 0) {
            await db.update(webauthnChallenges)
                .set({ currentChallenge: options.challenge })
                .where(eq(webauthnChallenges.userId, user.id));
        } else {
            await db.insert(webauthnChallenges).values({
                userId: user.id,
                currentChallenge: options.challenge
            });
        }

        return NextResponse.json(options);
    } catch (e) {
        console.error('Registration generate error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
