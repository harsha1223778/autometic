import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { operations = [], mode = 'auto', instructions = '' } = body;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create the rendering job
    const job = await prisma.editJob.create({
      data: {
        projectId: id,
        mode,
        instructions: typeof instructions === 'string' ? instructions : JSON.stringify(instructions),
        operations: JSON.stringify(operations),
        status: 'processing',
        progress: 10,
      },
    });

    // Mark project as processing
    await prisma.project.update({
      where: { id },
      data: { status: 'processing' },
    });

    // Record activity
    await prisma.userActivity.create({
      data: {
        userId: project.userId,
        action: 'VIDEO_RENDER_STARTED',
        metadata: JSON.stringify({ projectId: project.id, jobId: job.id, mode }),
      },
    });

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      message: 'Render job initiated successfully',
    });
  } catch (error) {
    console.error('Render trigger error:', error);
    return NextResponse.json({ error: 'Failed to initiate render job' }, { status: 500 });
  }
}
