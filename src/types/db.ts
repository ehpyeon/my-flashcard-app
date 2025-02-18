export interface Situation {
  id: string
  title: string
  type: 'speech' | 'conversation'
  description: string | null
  datelist: string[] // ISO date strings
  numdate: number
  studyrate: number
  created_at: string
  updated_at: string
}

export interface Correction {
  id: string
  situation_id: string
  title: string
  before_sentence: string
  before_intention: string
  after_sentence: string
  after_detail: string
  meaning: string | null
  grammar: string | null
  expression: string | null
  datelist: string[]
  score: number
  created_at: string
  updated_at: string
}

export interface CorrectionWithAnswers extends Correction {
  answer_first?: string
  answer_full?: string
  situations?: {
    id: string
    title: string
    type: string
  } | null
} 