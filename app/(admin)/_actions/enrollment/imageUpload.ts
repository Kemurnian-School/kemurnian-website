'use server'
import { getR2Client } from '@/utils/r2/client'
import { PutObjectCommand } from '@aws-sdk/client-s3'

const BUCKET = process.env.R2_BUCKET_NAME!
const CDN_URL = process.env.R2_CDN!

export async function uploadFile(file: File): Promise<string> {
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const key = `enrollment/${timestamp}_${sanitizedName}`

  const r2 = getR2Client()
  const arrayBuffer = await file.arrayBuffer()

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type,
    })
  )

  return `${CDN_URL}/${key}`
}

