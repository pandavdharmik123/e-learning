import { S3Client } from '@aws-sdk/client-s3';

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