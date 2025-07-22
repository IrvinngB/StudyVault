export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  content: string;
  tags?: string[];
  updatedAt: string;
  isFavorite: boolean;
}