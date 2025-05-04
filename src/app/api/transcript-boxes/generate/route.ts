import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { uploadToS3 } from '@/lib/s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function POST(request: Request) {
  try {
    const { pageId, x, y, width, height } = await request.json();

    // Get the newspaper page
    const newspaperPage = await prisma.newspaperPage.findUnique({
      where: { id: pageId },
    });

    if (!newspaperPage) {
      return NextResponse.json({ error: 'Newspaper page not found' }, { status: 404 });
    }

    // Extract the key from the fileUrl
    const key = newspaperPage.fileUrl;

    // Get the image from S3
    const { Body, ContentType } = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
    );

    if (!Body) {
      return NextResponse.json({ error: 'Failed to get image from S3' }, { status: 500 });
    }

    const imageBuffer = await streamToBuffer(Body as Readable);

    // Get the original image dimensions
    const metadata = await sharp(imageBuffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Calculate the scale factors
    const scaleX = originalWidth / newspaperPage.width;
    const scaleY = originalHeight / newspaperPage.height;

    // Calculate the crop coordinates in the original image
    const cropX = Math.round(x * scaleX);
    const cropY = Math.round(y * scaleY);
    const cropWidth = Math.round(width * scaleX);
    const cropHeight = Math.round(height * scaleY);

    // Crop the image
    const croppedImageBuffer = await sharp(imageBuffer)
      .extract({
        left: cropX,
        top: cropY,
        width: cropWidth,
        height: cropHeight,
      })
      .toBuffer();


    // Generate a unique filename
    const fileExtension = key.split('.').pop();
    const partUniqueFilename = `${randomUUID()}.${fileExtension}`;
    const partFilePath = `pages-parts/${partUniqueFilename}`;

    // Convert the cropped image to base64
    const base64Image = croppedImageBuffer.toString('base64');

    // Call OpenAI API to get the transcript
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please transcribe the text in this image, even if it's not in english or if it's an old language. Return only the text, no additional formatting or explanation :"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "auto"
              }
            }
          ],
        },
      ],
      max_tokens: 4000,
    });

    const transcript = response.choices[0].message.content;

    // Upload to S3
    const partSignedUrl = await uploadToS3(croppedImageBuffer, partFilePath, ContentType || 'image/jpeg');

    // Create the transcript box
    const transcriptBox = await prisma.transcriptBox.create({
      data: {
        newspaperPageId: pageId,
        x,
        y,
        width,
        height,
        partFileUrl: partFilePath,
        text: transcript || null,
      },
      include: {
        translations: true,
      },
    });

    // Generate French translation
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Please translate the following text to French: \`\`\`${transcript}\`\`\`.  Return only the translated text, no additional formatting or explanation :`
        }
      ],
      max_tokens: 4000,
    });

    const frenchTranslation = translationResponse.choices[0].message.content;

    // Create the French translation
    await prisma.transcriptBoxTranslation.create({
      data: {
        transcriptBoxId: transcriptBox.id,
        language: "fr",
        translationText: frenchTranslation || "",
      },
    });

    // Fetch the updated transcript box with translations
    const updatedBox = await prisma.transcriptBox.findUnique({
      where: { id: transcriptBox.id },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(updatedBox);
  } catch (error) {
    console.error('Error generating transcript:', error);
    return NextResponse.json(
      { error: 'Failed to generate transcript' },
      { status: 500 }
    );
  }
} 