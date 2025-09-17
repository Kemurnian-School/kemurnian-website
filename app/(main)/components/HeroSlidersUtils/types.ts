export interface HeroImage {
  id: number;
  order: number;
  image_urls: string;
  tablet_image_urls?: string | null;
  mobile_image_urls?: string | null;
  header_text?: string | null;
  button_text?: string | null;
  href_text?: string | null;
}
