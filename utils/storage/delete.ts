'use server'

import { getStorageClient } from '@/utils/storage/client'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

const BUCKET = process.env.STORAGE_BUCKET_NAME!
const CDN_URL = process.env.STORAGE_CDN!

/**
 * Extracts the storage object key from its CDN URL.
 * Example:
 *   https://cdn.example.com/hero-banners/desktop/123_image.png
 * → hero-banners/desktop/123_image.png
 */
function extractKeyFromUrl(url: string): string {
  return url.replace(`${CDN_URL}/`, '')
}

/**
 * A Universal storage delete function
 *
 * @param url - The CDN URL of the object to delete
 * @returns true if success, false otherwise
 */
export async function deleteFromStorage(url: string | null): Promise<boolean> {
  if (!url) return false

  const storage = getStorageClient()
  const key = extractKeyFromUrl(url)

  try {
    await storage.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    )
    console.log(`Deleted from storage: ${key}`)
    return true
  } catch (error) {
    console.error(`Failed to delete from storage: ${key}`, error)
    return false
  }
}
