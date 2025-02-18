'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Flashcard, CreateFlashcardInput } from '@/types/flashcard'

export function useFlashcards(category?: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchFlashcards()
  }, [category])

  const fetchFlashcards = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('study_records')
        .select(`
          *,
          learning_materials!inner(
            id,
            title,
            is_completed
          )
        `)
        .eq('learning_materials.is_completed', false)
        .order('created_at', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error
      
      const flashcards = data.map(record => ({
        id: record.id,
        front: record.before_sentence,
        back: record.after_sentence,
        category: record.difficulty_level,
        created_at: record.created_at,
        is_completed: record.learning_materials.is_completed,
        material_id: record.material_id
      }))

      setFlashcards(flashcards)
    } catch (err) {
      console.error('Error fetching flashcards:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const createFlashcard = async (input: CreateFlashcardInput) => {
    try {
      setError(null)
      console.log('Creating flashcard with input:', input)

      const { data, error } = await supabase
        .from('study_records')
        .insert([
          {
            ...input,
            is_completed: false,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      if (!data || data.length === 0) {
        throw new Error('카드 생성 후 데이터를 받지 못했습니다')
      }

      const newCard = data[0] as Flashcard
      setFlashcards(prev => [...prev, newCard])
      return newCard
    } catch (err) {
      console.error('Error creating flashcard:', err)
      setError(err as Error)
      throw err
    }
  }

  const updateFlashcard = async (id: string, updates: Partial<Flashcard>) => {
    try {
      // learning_materials 테이블의 is_completed 업데이트
      const { data: studyRecord, error: fetchError } = await supabase
        .from('study_records')
        .select('material_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // learning_materials 테이블 업데이트
      const { data, error } = await supabase
        .from('learning_materials')
        .update({ is_completed: updates.is_completed })
        .eq('id', studyRecord.material_id)
        .select()

      if (error) throw error

      // 로컬 상태 업데이트
      setFlashcards(prev => 
        prev.map(card => 
          card.id === id 
            ? { ...card, is_completed: updates.is_completed } 
            : card
        )
      )
      
      return data[0]
    } catch (err) {
      console.error('Error updating flashcard:', err)
      setError(err as Error)
      throw err
    }
  }

  const deleteFlashcard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id)

      if (error) throw error
      setFlashcards(prev => prev.filter(card => card.id !== id))
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  return {
    flashcards,
    loading,
    error,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    refreshFlashcards: fetchFlashcards
  }
} 