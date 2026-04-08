import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifySpicePassword, createSpicePasswordHash } from '@/lib/security/password';
import { encryptValue } from '@/lib/security/crypto';

const schema = z
  .object({
    userId: z.string().min(1),
    name: z.string().min(2).max(80).optional(),
    phone: z.string().min(8).max(20).optional(),
    motherNickname: z.string().min(1).optional(),
    firstPetName: z.string().min(1).optional(),
    currentPassword: z.string().min(8).optional(),
    newPassword: z.string().min(8).optional()
  })
  .refine(
    (value) => {
      if (value.newPassword) {
        return Boolean(value.currentPassword);
      }
      return true;
    },
    { message: 'currentPassword is required when changing password.', path: ['currentPassword'] }
  );

export async function PATCH(request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }

    const updateData = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.phone) {
      updateData.phone = data.phone;
    }

    if (data.motherNickname) {
      updateData.childhoodWhisperMotherEnc = encryptValue(data.motherNickname.trim().toLowerCase());
    }

    if (data.firstPetName) {
      updateData.childhoodWhisperPetEnc = encryptValue(data.firstPetName.trim().toLowerCase());
    }

    if (data.currentPassword && data.newPassword) {
      const matches = await verifySpicePassword(data.currentPassword, user.spiceSalt, user.passwordHash);
      if (!matches) {
        return Response.json({ error: 'Current password is incorrect.' }, { status: 403 });
      }

      const { passwordHash, spiceSalt } = await createSpicePasswordHash(data.newPassword);
      updateData.passwordHash = passwordHash;
      updateData.spiceSalt = spiceSalt;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        updatedAt: true
      }
    });

    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: data.newPassword ? 'PASSWORD_CHANGED' : 'PROFILE_UPDATED',
        metadata: {
          fieldsUpdated: Object.keys(updateData)
        }
      }
    });

    return Response.json({ user: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Failed to update profile.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
