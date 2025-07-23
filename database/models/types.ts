export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface ClassData {
  id: string
  name: string
  code?: string
  description?: string
  instructor?: string
  professor?: string
  schedule?: string
  classroom?: string
  color?: string
  credits?: number
  semester?: string
  syllabus_url?: string
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface GradeCategory {
  id: string
  name: string
  weight: number
  class_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Grade {
  id: string
  name: string
  score: number
  max_score: number
  category_id: string
  class_id: string
  user_id: string
  date: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  due_date?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  class_id?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Attachment {
  id: string
  filename: string
  local_path: string
  type: "image" | "document"
  size: number
  mime_type?: string
  created_at: string
}

export interface NoteData {
  id: string
  title: string
  content: string
  tags: string[]
  is_favorite: boolean
  class_id?: string
  user_id: string
  attachments: Attachment[]
  ai_summary?: string
  created_at: string
  updated_at: string
}
