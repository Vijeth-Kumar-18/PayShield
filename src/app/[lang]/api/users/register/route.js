import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { encryptValue } from '@/lib/security/crypto';
import { createSpicePasswordHash } from '@/lib/security/password';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  phone: z.string().min(8).max(20).optional(),
  password: z.string().min(8),
  motherNickname: z.string().min(1),
  firstPetName: z.string().min(1),
  openingBalance: z.number().min(0).optional()
});

export async function POST(request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      return Response.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const { passwordHash, spiceSalt } = await createSpicePasswordHash(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        passwordHash,
        spiceSalt,
        balance: data.openingBalance ?? 0,
        childhoodWhisperMotherEnc: encryptValue(data.motherNickname.trim().toLowerCase()),
        childhoodWhisperPetEnc: encryptValue(data.firstPetName.trim().toLowerCase())
      },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        createdAt: true
      }
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Failed to register user.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
