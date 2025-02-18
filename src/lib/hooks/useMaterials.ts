'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LearningMaterial } from '@/types/material'

export function useMaterials() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('learning_materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setMaterials(data)
    } catch (err) {
      console.error('Error fetching materials:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const createMaterial = async (input: Omit<LearningMaterial, 'id' | 'created_at'>) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('learning_materials')
        .insert([input])
        .select()

      if (error) throw error
      
      const newMaterial = data[0] as LearningMaterial
      setMaterials(prev => [newMaterial, ...prev])
      return newMaterial
    } catch (err) {
      console.error('Error creating material:', err)
      setError(err as Error)
      throw err
    }
  }

  return {
    materials,
    loading,
    error,
    fetchMaterials,
    createMaterial
  }
} 