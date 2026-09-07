import { NextRequest, NextResponse } from 'next/server';
import { generateAIEditPlan } from '@/services/aiPlanService';
import { z } from 'zod';

const aiRequestSchema = z.object({
  prompt: z.string().min(2, 'Prompt must contain instructions'),
  projectId: z.string().optional(),
  projectTitle: z.string().optional(),
  duration: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = aiRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid prompt', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { prompt, projectTitle, duration } = result.data;
    const plan = await generateAIEditPlan(prompt, { title: projectTitle, duration });

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error('AI Edit Plan error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI editing plan: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
