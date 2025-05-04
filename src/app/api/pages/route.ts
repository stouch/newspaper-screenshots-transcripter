import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const pages = await prisma.newspaperPage.findMany({
      include: {
        transcriptBoxes: {
          include: {
            translations: true,
          },
        },
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const x = parseInt(formData.get('x') as string);
    const y = parseInt(formData.get('y') as string);
    const name = formData.get('name') as string;

    if (!file || isNaN(x) || isNaN(y) || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${randomUUID()}.${fileExtension}`;
    const filePath = `pages/${uniqueFilename}`;
    
    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const signedUrl = await uploadToS3(buffer, filePath, file.type);

    // Create page in database
    const page = await prisma.newspaperPage.create({
      data: {
        name,
        fileUrl: filePath,
        x,
        y,
        width: 400,
        height: 600,
      },
      include: {
        transcriptBoxes: true,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
} 