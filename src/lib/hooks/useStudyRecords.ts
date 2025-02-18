'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StudyRecord, GeneratedSentence } from '@/types/material'

export function useStudyRecords() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createStudyRecords = async (
    materialId: string, 
    sentences: GeneratedSentence[]
  ) => {
    try {
      setLoading(true)
      setError(null)

      const records = sentences.map(sentence => ({
        material_id: materialId,
        before_sentence: sentence.before_sentence,
        after_sentence: sentence.after_sentence,
        difficulty_level: 'normal'
      }))

      const { data, error } = await supabase
        .from('study_records')
        .insert(records)
        .select()

      if (error) throw error

      return data as StudyRecord[]
    } catch (err) {
      console.error('Error creating study records:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createStudyRecords
  }
} 