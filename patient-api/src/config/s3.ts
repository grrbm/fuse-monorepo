import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_PUBLIC_BUCKET!;
const AWS_REGION = process.env.AWS_REGION!;

// Validate required environment variables
if (!BUCKET_NAME) {
  console.error('❌ AWS_PUBLIC_BUCKET environment variable is required');
  throw new Error('AWS_PUBLIC_BUCKET environment variable is required');
}
if (!AWS_REGION) {
  console.error('❌ AWS_REGION environment variable is required');
  throw new Error('AWS_REGION environment variable is required');
}
if (!process.env.AWS_ACCESS_KEY_ID) {
  console.error('❌ AWS_ACCESS_KEY_ID environment variable is required');
  throw new Error('AWS_ACCESS_KEY_ID environment variable is required');
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('❌ AWS_SECRET_ACCESS_KEY environment variable is required');
  throw new Error('AWS_SECRET_ACCESS_KEY environment variable is required');
}

console.log('✅ S3 configuration loaded:', {
  bucket: BUCKET_NAME,
  region: AWS_REGION,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
});

// Upload file to S3 and return the public URL
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    // Generate unique key with timestamp
    const key = `product-images/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // ACL: "public-read", // Make file publicly readable - Commented out due to bucket ACL restrictions
    });

    await s3Client.send(command);

    // Return public URL
    const url = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    console.log('✅ File uploaded to S3:', url);
    return url;

  } catch (error) {
    console.error('❌ S3 upload failed:', error);
    throw new Error('Failed to upload file to S3');
  }
}

// Delete file from S3 using URL
export async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    // Extract key from S3 URL
    const key = extractKeyFromS3Url(fileUrl);
    if (!key) {
      throw new Error('Invalid S3 URL format');
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log('✅ File deleted from S3:', key);

  } catch (error) {
    console.error('❌ S3 delete failed:', error);
    throw new Error('Failed to delete file from S3');
  }
}

// Extract S3 key from URL
function extractKeyFromS3Url(url: string): string | null {
  try {
    const bucketPattern = new RegExp(`https://${BUCKET_NAME}\\.s3\\.${AWS_REGION}\\.amazonaws\\.com/(.+)`);
    const match = url.match(bucketPattern);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
    return null;
  }
}

// Validate file type for logo uploads
export function isValidImageFile(contentType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(contentType);
}

// Validate file size (max 5MB for logos)
export function isValidFileSize(fileSize: number): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return fileSize <= maxSize;
}