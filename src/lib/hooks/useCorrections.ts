import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Correction } from '@/types/db'

export function useCorrections() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createCorrections = async (situationId: string, corrections: Omit<Correction, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('corrections')
        .insert(corrections)
        .select()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating corrections:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createCorrections
  }
}

// 대신 이렇게 수정
export async function createCorrections(situationId: string, corrections: Omit<Correction, 'id' | 'created_at' | 'updated_at'>[]) {
  const { data, error } = await supabase
    .from('corrections')
    .insert(corrections)
    .select()

  if (error) throw error
  return data
} 