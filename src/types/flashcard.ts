export interface Flashcard {
  id: string
  front: string
  back: string
  category: string
  created_at: string
  is_completed: boolean
  last_reviewed_at?: string
}

export interface CreateFlashcardInput {
  front: string
  back: string
  category: string
} 