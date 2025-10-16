export interface NewsRecord {
  id: number;
  title: string;
  body: string;
  date: string;
  from: string;
  image_urls: string[];
  embed?: string | null;
  created_at: string;
}
