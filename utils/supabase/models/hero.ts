export interface HeroBannerFetch {
  id: number;
  image_urls: string;
  order: number;
  header_text: string;
}

export interface HeroBannerRecord {
  id?: string;
  header_text?: string;
  href_text?: string;
  button_text?: string;
  image_urls?: string | null;
  tablet_image_urls?: string | null;
  mobile_image_urls?: string | null;
  order?: number;
}
