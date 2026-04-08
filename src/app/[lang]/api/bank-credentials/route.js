import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { encryptValue, decryptValue } from '@/lib/security/crypto';

const createSchema = z.object({
  userId: z.string().min(1),
  bankName: z.string().min(2),
  accountHolderName: z.string().min(2),
  accountNumber: z.string().min(8),
  ifsc: z.string().min(4),
  upiId: z.string().min(3)
});

export async function POST(request) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const payload = encryptValue(
      JSON.stringify({
        accountNumber: data.accountNumber,
        ifsc: data.ifsc,
        upiId: data.upiId
      })
    );

    const saved = await prisma.bankCredential.create({
      data: {
        userId: data.userId,
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        encryptedPayload: payload
      }
    });

    return Response.json(
      {
        id: saved.id,
        userId: saved.userId,
        bankName: saved.bankName,
        accountHolderName: saved.accountHolderName,
        createdAt: saved.createdAt
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Failed to store bank credentials.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId is required.' }, { status: 400 });
    }

    const records = await prisma.bankCredential.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const masked = records.map((record) => {
      const securePayload = JSON.parse(decryptValue(record.encryptedPayload));
      const accountNumber = String(securePayload.accountNumber || '');
      const suffix = accountNumber.slice(-4);
      const maskedAccount = suffix ? `XXXXXX${suffix}` : 'XXXXXX';

      return {
        id: record.id,
        bankName: record.bankName,
        accountHolderName: record.accountHolderName,
        accountNumberMasked: maskedAccount,
        ifsc: securePayload.ifsc,
        upiId: securePayload.upiId,
        createdAt: record.createdAt
      };
    });

    return Response.json({ records: masked }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch bank credentials.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
