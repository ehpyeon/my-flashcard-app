'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { FlashcardContainer } from '@/components/Flashcard/FlashcardContainer'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function StudyPage() {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return null // useAuth에서 자동으로 /login으로 리다이렉트됨
  }

  return (
    <div className="min-h-screen p-8 bg-black">
      <h1 className="text-2xl font-light text-white/90 mb-12 tracking-wider text-center">STUDY CARDS</h1>
      <FlashcardContainer />
    </div>
  )
} 