export interface LearningMaterial {
  id: string
  title: string
  content: string
  created_at: string
  is_completed: boolean
}

export interface StudyRecord {
  id: string
  material_id: string
  before_sentence: string
  after_sentence: string
  difficulty_level: string
  created_at: string
}

export interface GeneratedSentence {
  title: string
  before_versa_after_sentence: string
  before_sentence: string
  before_intent: string
  after_sentence: string
  after_details: string
} 