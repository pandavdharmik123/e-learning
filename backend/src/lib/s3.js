import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3 = new S3Client({
  region: process.env.AWS_REGION
});

export function s3PublicUrl(bucket, key) {
  if (process.env.S3_PUBLIC_BASE) {
    return `${process.env.S3_PUBLIC_BASE}/${key}`;
  }
  const region = process.env.AWS_REGION;
  const host = region === 'us-east-1'
    ? `https://${bucket}.s3.amazonaws.com`
    : `https://${bucket}.s3.${region}.amazonaws.com`;
  return `${host}/${key}`;
}

export async function getPresignedUrl(bucket, key, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

export function extractS3Key(fileUrl) {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION;
  const patterns = [
    new RegExp(`^https://${bucket}\\.s3\\.${region}\\.amazonaws\\.com/(.+)$`),
    new RegExp(`^https://${bucket}\\.s3\\.amazonaws\\.com/(.+)$`),
    new RegExp(`^${process.env.S3_PUBLIC_BASE}/(.+)$`),
  ];
  for (const pattern of patterns) {
    const match = fileUrl.match(pattern);
    if (match) return match[1];
  }
  return null;
}