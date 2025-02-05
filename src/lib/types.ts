export interface Article {
  id: string;
  url: string;
  category?: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  dateAdded: string;
  publishedDate?: string;
  read: boolean;
  status: "active" | "archived";
  deleted: boolean;
}
