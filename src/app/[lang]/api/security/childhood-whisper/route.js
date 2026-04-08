import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { decryptValue } from '@/lib/security/crypto';

const schema = z.object({
  userId: z.string().min(1),
  mirrorTransactionId: z.string().min(1),
  motherNickname: z.string().min(1),
  firstPetName: z.string().min(1),
  ipAddress: z.string().min(3)
});

function normalize(value) {
  return String(value).trim().toLowerCase();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }

    const mirrorTxn = await prisma.transaction.findUnique({
      where: { id: data.mirrorTransactionId }
    });

    if (!mirrorTxn || mirrorTxn.userId !== data.userId || mirrorTxn.ledgerType !== 'MIRROR') {
      return Response.json({ error: 'Flagged mirror transaction not found.' }, { status: 404 });
    }

    const motherMatch =
      normalize(decryptValue(user.childhoodWhisperMotherEnc)) === normalize(data.motherNickname);
    const petMatch =
      normalize(decryptValue(user.childhoodWhisperPetEnc)) === normalize(data.firstPetName);

    if (motherMatch && petMatch) {
      const result = await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: mirrorTxn.id },
          data: { status: 'DECLINED', mlReasons: { promotedToReal: true } }
        });

        const realTxn = await tx.transaction.create({
          data: {
            userId: user.id,
            amount: mirrorTxn.amount,
            payee: mirrorTxn.payee,
            status: 'SUCCESS',
            ledgerType: 'REAL',
            locationCountry: mirrorTxn.locationCountry,
            locationCity: mirrorTxn.locationCity,
            ipAddress: mirrorTxn.ipAddress,
            deviceDna: mirrorTxn.deviceDna,
            browserSignature: mirrorTxn.browserSignature,
            screenResolution: mirrorTxn.screenResolution,
            mlScore: mirrorTxn.mlScore,
            mlReasons: mirrorTxn.mlReasons,
            isTransferAllAttempt: mirrorTxn.isTransferAllAttempt
          }
        });

        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            balance: Number(user.balance) - Number(mirrorTxn.amount),
            isFrozen: false,
            frozenReason: null,
            lastKnownIp: data.ipAddress
          }
        });

        await tx.securityEvent.create({
          data: {
            userId: user.id,
            type: 'CHILDHOOD_WHISPER_PASSED',
            ipAddress: data.ipAddress,
            metadata: { mirrorTransactionId: mirrorTxn.id, realTransactionId: realTxn.id }
          }
        });

        return { realTxn, updatedUser };
      });

      return Response.json(
        {
          verified: true,
          message: 'Verification successful. Switched to real account.',
          realTransaction: result.realTxn,
          balance: result.updatedUser.balance
        },
        { status: 200 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          isFrozen: true,
          frozenReason: 'Childhood Whisper verification failed.'
        }
      });

      await tx.transaction.update({
        where: { id: mirrorTxn.id },
        data: { status: 'FROZEN' }
      });

      await tx.securityEvent.create({
        data: {
          userId: user.id,
          type: 'ACCOUNT_FROZEN',
          ipAddress: data.ipAddress,
          metadata: { mirrorTransactionId: mirrorTxn.id, reason: 'Childhood Whisper mismatch' }
        }
      });
    });

    return Response.json(
      {
        verified: false,
        message: 'Verification failed. Account frozen and IP logged.'
      },
      { status: 403 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Verification failed.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
