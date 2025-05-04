export function getFullS3Url(filePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_S3_BASE_URL environment variable is not set');
  }
  return `${baseUrl}/${filePath}`;
} 