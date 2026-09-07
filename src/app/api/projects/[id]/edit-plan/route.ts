import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const latestJob = await prisma.editJob.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestJob) {
      return NextResponse.json({ operations: [], instructions: '' });
    }

    const ops = latestJob.operations ? JSON.parse(latestJob.operations) : [];
    return NextResponse.json({
      operations: ops,
      instructions: latestJob.instructions,
      jobId: latestJob.id,
      status: latestJob.status,
    });
  } catch (error) {
    console.error('Fetch edit plan error:', error);
    return NextResponse.json({ error: 'Failed to retrieve edit plan' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { operations, mode = 'auto', instructions } = body;

    const editJob = await prisma.editJob.create({
      data: {
        projectId: id,
        mode,
        instructions: typeof instructions === 'string' ? instructions : JSON.stringify(instructions),
        operations: JSON.stringify(operations || []),
        status: 'ready',
        progress: 0,
      },
    });

    return NextResponse.json({ editJob });
  } catch (error) {
    console.error('Save edit plan error:', error);
    return NextResponse.json({ error: 'Failed to save edit plan' }, { status: 500 });
  }
}
