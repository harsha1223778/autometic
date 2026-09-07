import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('video') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mov'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi)$/i)) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload MP4, WebM, MOV, or AVI.' },
        { status: 400 }
      );
    }

    // Limit to 250MB for prototype
    const MAX_SIZE = 250 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 250MB prototype limit.' },
        { status: 400 }
      );
    }

    // Convert file to buffer and save to public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadsDir, safeFilename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;

    // Curated high quality video thumbnails for mock representation
    const sampleThumbnails = [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600&auto=format&fit=crop&q=80',
    ];
    const mockThumbnail = sampleThumbnails[Math.floor(Math.random() * sampleThumbnails.length)];

    return NextResponse.json({
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      thumbnailUrl: mockThumbnail,
      duration: 32.5, // estimated initial duration
    });
  } catch (error: any) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video file: ' + (error?.message || 'Server error') },
      { status: 500 }
    );
  }
}
