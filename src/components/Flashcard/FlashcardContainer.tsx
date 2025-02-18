'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Flashcard from '.'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { Correction } from '@/types/db'
import { useRouter } from 'next/navigation'

interface Situation {
  id: string;
  title: string;
  type: string;
}

// Correction 타입 확장
interface CorrectionWithAnswers extends Correction {
  answer_first?: string;
  answer_full?: string;
  situations?: Situation[] | null;
}

interface RawSupabaseResponse {
  id: string;
  title: string;
  before_sentence: string;
  before_intention: string;
  after_sentence: string;
  after_detail: string;
  datelist: string[];
  score: number;
  answer_first?: string;
  answer_full?: string;
  situations: Situation[];
}

export function FlashcardContainer() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [corrections, setCorrections] = useState<CorrectionWithAnswers[]>([])
  const router = useRouter()

  useEffect(() => {
    loadCorrections()
  }, [])

  const loadCorrections = async () => {
    try {
      setLoading(true)
      console.log('Starting to load corrections...')

      const { data, error } = await supabase
        .from('corrections_with_answers')
        .select(`
          id,
          title,
          before_sentence,
          before_intention,
          after_sentence,
          after_detail,
          datelist,
          score,
          answer_first,
          answer_full,
          situations (
            id,
            title,
            type
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || !data.length) {
        console.log('No data returned from Supabase')
        return
      }

      const processedData: CorrectionWithAnswers[] = data.map(item => ({
        id: item.id,
        situation_id: item.situations?.[0]?.id ?? '',
        title: item.title,
        before_sentence: item.before_sentence,
        before_intention: item.before_intention,
        after_sentence: item.after_sentence,
        after_detail: item.after_detail,
        meaning: '',
        grammar: '',
        expression: '',
        datelist: item.datelist || [],
        score: item.score || 0,
        created_at: '',
        updated_at: '',
        answer_first: typeof item.answer_first === 'string' ? item.answer_first : JSON.stringify(item.answer_first),
        answer_full: typeof item.answer_full === 'string' ? item.answer_full : JSON.stringify(item.answer_full)
      }))

      setCorrections(processedData)
    } catch (err) {
      console.error('Error loading corrections:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    const currentCard = corrections[currentIndex]
    try {
      // 현재 날짜를 datelist에 추가
      const newDate = new Date().toISOString().split('T')[0]
      const updatedDatelist = [...currentCard.datelist, newDate]
      
      const { error } = await supabase
        .from('corrections')
        .update({ 
          datelist: updatedDatelist,
          score: (currentCard.score || 0) + 1
        })
        .eq('id', currentCard.id)

      if (error) throw error
      setCurrentIndex((prev) => (prev + 1) % corrections.length)
    } catch (err) {
      console.error('Error updating correction:', err)
      alert('업데이트에 실패했습니다')
    }
  }

  return (
    <Box className="w-full max-w-3xl mx-auto py-12">
      {/* 홈 버튼 */}
      <div className="absolute top-0 right-0 p-6">
        <Button
          onClick={() => router.push('/')}
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white/80 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          홈
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-white/10 border-t-white/80 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-white/60">에러가 발생했습니다: {error?.message}</div>
      ) : !corrections.length ? (
        <div className="text-white/60">학습할 카드가 없습니다.</div>
      ) : (
        <Box className="flex flex-col items-center gap-6">
          <Flashcard
            frontContent={corrections[currentIndex].title}
            backContent={corrections[currentIndex].answer_full?.replace(/<(Before|After)>/g, '### $1\n\n') || ''}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
            formatText={(text) => {
              const parts = text.split(/(%%.+?%%)/)
              return parts.map((part, i) => {
                if (part.startsWith('%%') && part.endsWith('%%')) {
                  const content = part.slice(2, -2)
                  return <span key={i} className="text-red-500">{content}</span>
                }
                return part
              })
            }}
          />

          {/* 네비게이션 컨트롤 */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                setIsFlipped(false)
                setCurrentIndex(prev => Math.max(0, prev - 1))
              }}
              disabled={currentIndex === 0}
              className="text-neutral-400 hover:text-white/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 진행 상태 표시 */}
            <div className="text-white/80 font-medium min-w-[4rem] text-center">
              {currentIndex + 1} / {corrections.length}
            </div>

            <button 
              onClick={async () => {
                if (currentIndex === corrections.length - 1) {
                  await handleComplete()
                } else {
                  setIsFlipped(false)
                  setCurrentIndex(prev => prev + 1)
                }
              }}
              className="text-neutral-400 hover:text-white/80 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </Box>
      )}
    </Box>
  )
} 