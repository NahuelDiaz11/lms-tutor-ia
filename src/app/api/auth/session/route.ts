import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getSessionUser(req);
    const availableUsers = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      user: currentUser,
      availableUsers,
    });
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return NextResponse.json({ error: 'Error al obtener sesión' }, { status: 500 });
  }
}
