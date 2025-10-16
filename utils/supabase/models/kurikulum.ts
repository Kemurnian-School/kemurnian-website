export interface KurikulumRecord {
  id: number;
  title: string;
  body: string;
  preview?: string | null;
  order?: number;
  created_at: string;
}
