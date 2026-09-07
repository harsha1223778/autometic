import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get('genre');

    const whereClause: any = {};
    if (genre && genre !== 'all') {
      whereClause.genre = genre;
    }

    const tracks = await prisma.musicTrack.findMany({
      where: whereClause,
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Fetch music tracks error:', error);
    return NextResponse.json({ error: 'Failed to fetch music tracks' }, { status: 500 });
  }
}
