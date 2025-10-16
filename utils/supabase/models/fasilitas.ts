export interface FasilitasRecord {
  id?: number; // Optional for creation, present after DB insert
  nama_sekolah: string;
  title: string;
  image_urls: string;
  storage_path: string;
  created_at?: string;
}
