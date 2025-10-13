const CDN_URL = process.env.R2_CDN!

export function extractKeyFromUrl(url: string): string {
  return url.replace(`${CDN_URL}/`, '')
}
