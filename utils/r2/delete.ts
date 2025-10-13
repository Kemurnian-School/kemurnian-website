'use server'

import { getR2Client } from '@/utils/r2/client'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

const BUCKET = process.env.R2_BUCKET_NAME!
const CDN_URL = process.env.R2_CDN!

/**
 * Extracts the R2 object key from its CDN URL.
 * Example:
 *   https://cdn.example.com/hero-banners/desktop/123_image.png
 * → hero-banners/desktop/123_image.png
 */
function extractKeyFromUrl(url: string): string {
  return url.replace(`${CDN_URL}/`, '')
}

/**
 * A Universal R2 delete function
 *
 * @param url - The CDN URL of the object to delete
 * @returns true if success, false otherwise
 */
export async function deleteFromR2(url: string | null): Promise<boolean> {
  if (!url) return false

  const r2 = getR2Client()
  const key = extractKeyFromUrl(url)

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    )
    console.log(`Deleted from R2: ${key}`)
    return true
  } catch (error) {
    console.error(`Failed to delete from R2: ${key}`, error)
    return false
  }
}
