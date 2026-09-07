import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.editJob.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Realistic progress advancement simulation if currently in processing
    if (job.status === 'processing' && job.progress < 100) {
      // Calculate next progress step
      const nextProgress = Math.min(100, job.progress + Math.floor(Math.random() * 20) + 15);
      const isComplete = nextProgress >= 100;

      const outputUrl = isComplete
        ? (job.project.originalVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')
        : null;

      const updated = await prisma.editJob.update({
        where: { id },
        data: {
          progress: nextProgress,
          status: isComplete ? 'completed' : 'processing',
          outputVideoUrl: outputUrl,
        },
      });

      if (isComplete) {
        await prisma.project.update({
          where: { id: job.projectId },
          data: { status: 'completed' },
        });

        await prisma.userActivity.create({
          data: {
            userId: job.project.userId,
            action: 'VIDEO_RENDER_COMPLETED',
            metadata: JSON.stringify({ projectId: job.projectId, jobId: job.id }),
          },
        });
      }

      return NextResponse.json({
        job: {
          ...updated,
          operations: updated.operations ? JSON.parse(updated.operations) : [],
        },
      });
    }

    return NextResponse.json({
      job: {
        ...job,
        operations: job.operations ? JSON.parse(job.operations) : [],
      },
    });
  } catch (error) {
    console.error('Job check error:', error);
    return NextResponse.json({ error: 'Failed to retrieve job status' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.editJob.update({
      where: { id },
      data: {
        progress: body.progress,
        status: body.status,
        outputVideoUrl: body.outputVideoUrl,
        errorMessage: body.errorMessage,
      },
    });

    return NextResponse.json({ job: updated });
  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 });
  }
}
