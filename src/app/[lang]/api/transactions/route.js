import { prisma } from '@/lib/prisma';
import { computeGenuinityScore, shouldUseMirrorLedger } from '@/lib/security/genuinity';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const mode = searchParams.get('mode') || 'auto';

    if (!userId) {
      return Response.json({ error: 'userId is required.' }, { status: 400 });
    }

    const [user, recentLogs] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.behavioralLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 25
      })
    ]);

    if (!user) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }

    const genuinityScore = computeGenuinityScore(recentLogs);
    const resolvedMode =
      mode === 'auto' ? (shouldUseMirrorLedger(genuinityScore) ? 'mirror' : 'real') : mode;

    await prisma.user.update({
      where: { id: userId },
      data: { genuinityScore }
    });

    const ledgerType = resolvedMode === 'mirror' ? 'MIRROR' : 'REAL';

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ledgerType
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return Response.json(
      {
        userId,
        genuinityScore,
        mode: resolvedMode,
        ledgerType,
        transactions
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch transactions.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
