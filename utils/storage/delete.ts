'use server'

import * as ftp from "basic-ftp"

/**
 * Extracts the storage object key from its CDN URL.
 * Example:
 * https://sekolahkemurnian.sch.id/content/hero-banners/desktop/123_image.png
 * → uploads/hero-banners/desktop/123_image.png
 */
function extractKeyFromUrl(url: string, cdnUrl: string): string {
  return url.replace(`${cdnUrl}/`, '')
}

/**
 * A Universal storage delete function
 *
 * @param url - The CDN URL of the object to delete
 * @returns true if success, false otherwise
 */
export async function deleteFromStorage(url: string | null): Promise<boolean> {
  if (!url) return false

  const CDN_URL = process.env.STORAGE_CDN!
  const key = extractKeyFromUrl(url, CDN_URL)

  const client = new ftp.Client()
  client.ftp.verbose = false

  try {
    await client.access({
      host: process.env.FTP_HOST!,
      user: process.env.FTP_USER!,
      password: process.env.FTP_PASSWORD!,
      secure: false, 
    })

    await client.remove(key)
    console.log(`Deleted from FTP storage: ${key}`)
    return true

  } catch (error: any) {
    if (error.code === 550) {
      console.log(`File already missing from FTP storage: ${key}`)
      return true
    }
    
    console.error(`Failed to delete from FTP storage: ${key}`, error)
    return false

  } finally {
    client.close()
  }
}
