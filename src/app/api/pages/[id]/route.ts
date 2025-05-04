import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { x, y } = await request.json();
    const id = parseInt(params.id);

    const updatedPage = await prisma.newspaperPage.update({
      where: { id },
      data: { x, y },
      include: {
        transcriptBoxes: {
          include: {
            translations: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Error updating page position:', error);
    return NextResponse.json(
      { error: 'Failed to update page position' },
      { status: 500 }
    );
  }
} 