import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { videoProcessor } from '@/services/videoProcessingService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const analysis = await videoProcessor.analyze(project.originalVideoUrl);

    // If duration was 0, update project duration
    if (project.duration <= 0 && analysis.totalDuration > 0) {
      await prisma.project.update({
        where: { id },
        data: { duration: analysis.totalDuration },
      });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Video analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze video' }, { status: 500 });
  }
}
