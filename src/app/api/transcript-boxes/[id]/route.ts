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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // First delete all translations associated with the transcript box
    await prisma.transcriptBoxTranslation.deleteMany({
      where: { transcriptBoxId: id },
    });

    // Then delete the transcript box
    await prisma.transcriptBox.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transcript box:', error);
    return NextResponse.json(
      { error: 'Failed to delete transcript box' },
      { status: 500 }
    );
  }
} 