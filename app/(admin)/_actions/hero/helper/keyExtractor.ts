const CDN_URL = process.env.R2_CDN!

export function extractKeyFromUrl(url: string): string {
  // Remove the CDN URL to get just the key
  return url.replace(`${CDN_URL}/`, '')
}
