import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { width, height } = await request.json();
    const id = parseInt(params.id);

    const updatedPage = await prisma.newspaperPage.update({
      where: { id },
      data: { width, height },
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
    console.error('Error updating page size:', error);
    return NextResponse.json(
      { error: 'Failed to update page size' },
      { status: 500 }
    );
  }
} 