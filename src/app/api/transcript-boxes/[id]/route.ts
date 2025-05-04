import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const id = parseInt(params.id);

    const updatedBox = await prisma.transcriptBox.update({
      where: { id },
      data: updates,
      include: {
        translations: true,
      },
    });

    return NextResponse.json(updatedBox);
  } catch (error) {
    console.error('Error updating transcript box:', error);
    return NextResponse.json(
      { error: 'Failed to update transcript box' },
      { status: 500 }
    );
  }
} 