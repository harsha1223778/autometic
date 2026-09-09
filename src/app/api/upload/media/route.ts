import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Support multiple files under 'files' or 'file' or 'media' or 'video'
    const files: File[] = [];
    for (const [, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No media files provided' }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const sampleThumbnails = [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    ];

    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|webm|mov|avi|mkv)$/i);
      const isImage = file.type.startsWith('image/') || !!file.name.match(/\.(png|jpe?g|webp|gif|svg)$/i);

      if (!isVideo && !isImage) {
        return NextResponse.json(
          { error: `File "${file.name}" is not an accepted video or image format.` },
          { status: 400 }
        );
      }

      // 250MB limit
      const MAX_SIZE = 250 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 250MB limit.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const safeFilename = `${timestamp}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = join(uploadsDir, safeFilename);
      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${safeFilename}`;

      results.push({
        id: `media-${timestamp}-${i}`,
        url: publicUrl,
        name: file.name,
        type: isVideo ? ('video' as const) : ('image' as const),
        fileSize: file.size,
        duration: isVideo ? 30.0 : 5.0, // default display duration for images
        thumbnailUrl: isImage ? publicUrl : sampleThumbnails[i % sampleThumbnails.length],
      });
    }

    return NextResponse.json({
      success: true,
      media: results,
      // For single-file compatibility
      url: results[0]?.url,
      thumbnailUrl: results[0]?.thumbnailUrl,
      duration: results[0]?.duration,
    });
  } catch (error: any) {
    console.error('Multi-media upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload media files: ' + (error?.message || 'Server error') },
      { status: 500 }
    );
  }
}
