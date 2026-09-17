export type EmagazineStatus = "draft" | "published";

export interface Emagazine {
  id: number;
  title: string;
  issue_number: string;
  publication_date: string;
  description: string;

  featured_image: string | null;
  featured_image_url: string | null;

  pdf_file: string | null;
  pdf_url: string | null;

  status: EmagazineStatus;

  created_at: string;
  updated_at: string;
}