import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { pageId, x, y, width, height } = await request.json();

    const transcriptBox = await prisma.transcriptBox.create({
      data: {
        newspaperPageId: pageId,
        x,
        y,
        width,
        height,
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(transcriptBox);
  } catch (error) {
    console.error('Error creating transcript box:', error);
    return NextResponse.json(
      { error: 'Failed to create transcript box' },
      { status: 500 }
    );
  }
} 