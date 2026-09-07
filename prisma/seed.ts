import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EditFlow AI database...');

  // 1. Create or upsert Demo User
  const passwordHash = await bcrypt.hash('Demo@12345', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@editflow.ai' },
    update: {
      name: 'Alex Rivera',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    create: {
      name: 'Alex Rivera',
      email: 'demo@editflow.ai',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log(`Created user: ${user.name} (${user.email})`);

  // 2. Clean previous sample projects for idempotent seed
  await prisma.editJob.deleteMany({ where: { project: { userId: user.id } } });
  await prisma.subtitle.deleteMany({ where: { project: { userId: user.id } } });
  await prisma.project.deleteMany({ where: { userId: user.id } });
  await prisma.userActivity.deleteMany({ where: { userId: user.id } });
  await prisma.musicTrack.deleteMany({});

  // 3. Seed Music Tracks
  const musicTracks = [
    {
      title: 'Horizon Glow',
      artist: 'Aetherial Sound',
      genre: 'soft',
      duration: 142,
      audioUrl: 'https://cdn.freesound.org/previews/612/612604_5674468-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/612/612604_5674468-lq.mp3',
    },
    {
      title: 'Neon Drift',
      artist: 'Synthwave Labs',
      genre: 'energetic',
      duration: 184,
      audioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
    },
    {
      title: 'Cinema Orchestral Rise',
      artist: 'Epic Cinematic Studio',
      genre: 'cinematic',
      duration: 210,
      audioUrl: 'https://cdn.freesound.org/previews/580/580310_11861866-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/580/580310_11861866-lq.mp3',
    },
    {
      title: 'Morning Coffee Vlog',
      artist: 'Acoustic Days',
      genre: 'upbeat',
      duration: 128,
      audioUrl: 'https://cdn.freesound.org/previews/612/612604_5674468-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/612/612604_5674468-lq.mp3',
    },
    {
      title: 'Deep Focus Chill',
      artist: 'Lofi Pulse',
      genre: 'chill',
      duration: 165,
      audioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
    },
    {
      title: 'Corporate Success Vision',
      artist: 'Summit Media',
      genre: 'corporate',
      duration: 150,
      audioUrl: 'https://cdn.freesound.org/previews/580/580310_11861866-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/580/580310_11861866-lq.mp3',
    },
    {
      title: 'Cosmic Ambient Flow',
      artist: 'Solaris Waves',
      genre: 'soft',
      duration: 198,
      audioUrl: 'https://cdn.freesound.org/previews/612/612604_5674468-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/612/612604_5674468-lq.mp3',
    },
    {
      title: 'Future Funk Beats',
      artist: 'Groove Cartel',
      genre: 'upbeat',
      duration: 135,
      audioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
    },
    {
      title: 'Cyberpunk Chase',
      artist: 'Grid Matrix',
      genre: 'energetic',
      duration: 172,
      audioUrl: 'https://cdn.freesound.org/previews/580/580310_11861866-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/580/580310_11861866-lq.mp3',
    },
    {
      title: 'Ethereal Journey',
      artist: 'Valkyrie Sounds',
      genre: 'cinematic',
      duration: 245,
      audioUrl: 'https://cdn.freesound.org/previews/612/612604_5674468-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/612/612604_5674468-lq.mp3',
    },
    {
      title: 'Modern Tech Presentation',
      artist: 'Nexus Audio',
      genre: 'corporate',
      duration: 140,
      audioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
    },
    {
      title: 'Midnight Breeze',
      artist: 'Velvet Horizon',
      genre: 'chill',
      duration: 180,
      audioUrl: 'https://cdn.freesound.org/previews/580/580310_11861866-lq.mp3',
      previewUrl: 'https://cdn.freesound.org/previews/580/580310_11861866-lq.mp3',
    },
  ];

  for (const track of musicTracks) {
    await prisma.musicTrack.create({ data: track });
  }
  console.log(`Seeded ${musicTracks.length} music tracks.`);

  // 4. Seed 8 Projects with varied video clips, thumbnails, and edit jobs
  const sampleProjects = [
    {
      title: 'Tech Founder Vlog - Week 12',
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      duration: 15.0,
      status: 'ready',
      mode: 'auto',
      instructions: 'Remove silent intervals greater than 1.5s, generate subtitles, add soft upbeat background music.',
    },
    {
      title: 'AI Product Keynote 2026',
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
      duration: 60.0,
      status: 'completed',
      mode: 'assistant',
      instructions: 'Make this keynote crisp with subtitles, intro hook, and normalized audio LUFS -14.',
    },
    {
      title: 'Tokyo Street Food Adventure',
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
      duration: 35.0,
      status: 'ready',
      mode: 'manual',
      instructions: 'Trim opening pause, color grade with Warm preset, crossfade audio.',
    },
    {
      title: 'Developer Podcast Ep. 45',
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
      duration: 48.0,
      status: 'ready',
      mode: 'auto',
      instructions: 'Remove filler words, auto-generate captions with animated karaoke styling.',
    },
    {
      title: 'Fitness Coaching Reel #3',
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      duration: 24.0,
      status: 'completed',
      mode: 'assistant',
      instructions: 'Crop to 9:16 vertical, add energetic beat sync, add bold center subtitles.',
    },
    {
      title: 'SaaS Platform Onboarding Walkthrough',
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      duration: 30.0,
      status: 'ready',
      mode: 'manual',
      instructions: 'Cut dead air, highlight cursor clicks, add subtle corporate soundtrack.',
    },
    {
      title: 'Cinematic Mountain Drone Footage',
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
      duration: 20.0,
      status: 'ready',
      mode: 'auto',
      instructions: 'Apply Cinematic teal/orange color filter and orchestral audio riser.',
    },
    {
      title: 'Quick Cooking Tutorial - Pasta Aglio',
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80',
      duration: 18.0,
      status: 'ready',
      mode: 'assistant',
      instructions: 'Speed up repetitive prep sections by 2x, keep audio pitch corrected, add recipe text badges.',
    },
  ];

  for (const projData of sampleProjects) {
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        title: projData.title,
        originalVideoUrl: projData.originalVideoUrl,
        thumbnailUrl: projData.thumbnailUrl,
        duration: projData.duration,
        status: projData.status,
      },
    });

    // Create Subtitle
    await prisma.subtitle.create({
      data: {
        projectId: project.id,
        language: 'en',
        content: `WEBVTT\n\n00:00.500 --> 00:03.200\nWelcome to ${projData.title}!\n\n00:03.500 --> 00:07.000\nIn this video, we'll demonstrate automated AI video editing.`,
      },
    });

    // Create EditJob
    const defaultOps = JSON.stringify([
      { type: 'remove_silence', enabled: true, threshold_seconds: 1.5 },
      { type: 'generate_subtitles', enabled: true, language: 'en', style: 'modern_white_bottom' },
      { type: 'normalize_audio', enabled: true, target_lufs: -14 },
      { type: 'add_background_music', enabled: true, mood: 'soft', volume: 0.15 },
    ]);

    await prisma.editJob.create({
      data: {
        projectId: project.id,
        mode: projData.mode,
        instructions: projData.instructions,
        operations: defaultOps,
        status: projData.status === 'completed' ? 'completed' : 'ready',
        progress: projData.status === 'completed' ? 100 : 0,
        outputVideoUrl: projData.status === 'completed' ? projData.originalVideoUrl : null,
      },
    });
  }
  console.log(`Seeded ${sampleProjects.length} sample projects with edit jobs.`);

  // 5. Seed Activities
  const activities = [
    { action: 'PROJECT_CREATED', metadata: JSON.stringify({ title: 'Tech Founder Vlog - Week 12' }) },
    { action: 'AUTO_EDIT_COMPLETED', metadata: JSON.stringify({ cuts: 14, silenceRemovedSeconds: 32.5 }) },
    { action: 'SUBTITLES_GENERATED', metadata: JSON.stringify({ language: 'en', wordCount: 840 }) },
    { action: 'VIDEO_EXPORTED', metadata: JSON.stringify({ format: '1080p_mp4', duration: '12m 10s' }) },
    { action: 'AI_ASSISTANT_SESSION', metadata: JSON.stringify({ query: 'Make this vlog look professional' }) },
  ];

  for (const act of activities) {
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        action: act.action,
        metadata: act.metadata,
      },
    });
  }
  console.log(`Seeded ${activities.length} user activities.`);

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
