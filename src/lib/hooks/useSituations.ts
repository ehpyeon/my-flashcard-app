import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Situation } from '@/types/db'

export function useSituations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createSituation = async (situation: Omit<Situation, 'id' | 'created_at' | 'updated_at' | 'numdate' | 'studyrate'>) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('situations')
        .insert([situation])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating situation:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createSituation
  }
}

// 훅 대신 함수로 직접 export
export async function createSituation(situation: Omit<Situation, 'id' | 'created_at' | 'updated_at' | 'numdate' | 'studyrate'>) {
  const { data, error } = await supabase
    .from('situations')
    .insert([situation])
    .select()
    .single()

  if (error) throw error
  return data
} 