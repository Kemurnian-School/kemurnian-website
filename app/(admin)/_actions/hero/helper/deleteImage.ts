'use server'
import { getR2Client } from '@/utils/r2/client'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { extractKeyFromUrl } from './keyExtractor'

const BUCKET = process.env.R2_BUCKET_NAME!

export async function deleteImage(url: string) {
  if (!url) return

  const r2 = getR2Client()
  const key = extractKeyFromUrl(url)

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    )
    console.log(`Successfully deleted: ${key}`)
  } catch (error) {
    console.error(`Failed to delete R2 object: ${key}`, error)
    throw error
  }
}
