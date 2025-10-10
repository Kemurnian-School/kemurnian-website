'use server'

import { getR2Client } from '@/utils/r2/client'
import { PutObjectCommand } from '@aws-sdk/client-s3'

const BUCKET = process.env.R2_BUCKET_NAME!
const CDN_URL = process.env.R2_CDN!

export async function uploadImage(
  file: File | null,
  device: 'desktop' | 'tablet' | 'mobile'
) {
  if (!file) return null

  const filename = `hero-banners/${device}/${Date.now()}_${file.name}`
  const r2 = getR2Client()

  const arrayBuffer = await file.arrayBuffer()

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: filename,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type,
    })
  )

  return `${CDN_URL}/${filename}`
}
