'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import Generation from '@/components/Generation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AnalysisResult {
  title: string;
  before_versa_after_sentence: string;
  before_sentence: string;
  before_intent: string;
  after_sentence: string;
  after_detail: string;
}

export default function GenerationPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set())
  
  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return null
  }

  const handleAnalysisComplete = async (results: AnalysisResult[]) => {
    setAnalysisResults(results)
  }

  const handleSaveCard = async (index: number) => {
    if (savedIndices.has(index)) return

    try {
      const result = analysisResults[index]
      const { error } = await supabase.from('corrections').insert([{
        title: result.title,
        before_sentence: result.before_sentence,
        before_intention: result.before_intent,
        after_sentence: result.after_sentence,
        after_detail: result.after_detail,
      }])

      if (error) throw error

      setSavedIndices(prev => new Set([...prev, index]))
      alert('카드가 저장되었습니다.')
    } catch (error) {
      console.error('Error saving card:', error)
      alert('카드 저장에 실패했습니다.')
    }
  }

  const handleSaveAll = async () => {
    try {
      const unsavedResults = analysisResults.filter((_, index) => !savedIndices.has(index))
      const { error } = await supabase.from('corrections').insert(
        unsavedResults.map(result => ({
          title: result.title,
          before_sentence: result.before_sentence,
          before_intention: result.before_intent,
          after_sentence: result.after_sentence,
          after_detail: result.after_detail,
        }))
      )

      if (error) throw error

      setSavedIndices(new Set(analysisResults.map((_, i) => i)))
      alert('모든 카드가 저장되었습니다.')
    } catch (error) {
      console.error('Error saving all cards:', error)
      alert('카드 저장에 실패했습니다.')
    }
  }

  return (
    <Box className="min-h-screen bg-neutral-950">
      <div className="container mx-auto px-4 py-12">
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

        <h1 className="text-2xl font-light text-white/90 mb-12 text-center">SPEAK ENGLISH</h1>
        
        <Generation onAnalysisComplete={handleAnalysisComplete} />

        {/* 분석 결과 카드 */}
        {analysisResults.length > 0 && (
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-light text-white/80">
                분석 결과 ({currentIndex + 1}/{analysisResults.length})
              </h2>
              <div className="flex items-center gap-3">
                {/* 네비게이션 버튼 */}
                <Button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="w-12 h-12 bg-neutral-900 text-white/90 hover:bg-neutral-800 
                    transition-all duration-300 rounded-lg border border-white/10
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transform hover:translate-y-[-2px] hover:shadow-lg
                    active:translate-y-[0px]"
                >
                  ←
                </Button>
                <Button
                  onClick={() => setCurrentIndex(prev => Math.min(analysisResults.length - 1, prev + 1))}
                  disabled={currentIndex === analysisResults.length - 1}
                  className="w-12 h-12 bg-neutral-900 text-white/90 hover:bg-neutral-800 
                    transition-all duration-300 rounded-lg border border-white/10
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transform hover:translate-y-[-2px] hover:shadow-lg
                    active:translate-y-[0px]"
                >
                  →
                </Button>
              </div>
            </div>

            {/* 현재 카드 내용 */}
            <Box className="p-8 rounded-lg bg-neutral-900/50 border border-white/10 backdrop-blur-sm
              shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h3 className="text-lg font-medium text-white/90 mb-6">{analysisResults[currentIndex].title}</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-white/60 mb-2">원문</p>
                  <p className="text-white/90 p-4 bg-neutral-800/50 rounded-lg border border-white/5">
                    {analysisResults[currentIndex].before_sentence}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-2">수정</p>
                  <p className="text-white/90 p-4 bg-neutral-800/50 rounded-lg border border-white/5">
                    {analysisResults[currentIndex].after_sentence}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-2">설명</p>
                  <p className="text-white/70 p-4 bg-neutral-800/50 rounded-lg border border-white/5">
                    {analysisResults[currentIndex].after_detail}
                  </p>
                </div>
              </div>
            </Box>

            {/* 저장 버튼 영역 */}
            <div className="mt-8 flex justify-center gap-4">
              {/* 단일 카드 저장 버튼 */}
              <Button
                onClick={() => handleSaveCard(currentIndex)}
                disabled={savedIndices.has(currentIndex)}
                className="px-8 py-3 bg-neutral-900 text-white/90 hover:bg-neutral-800 
                  transition-all duration-300 rounded-lg border border-white/10
                  transform hover:translate-y-[-2px] hover:shadow-lg
                  active:translate-y-[0px] disabled:opacity-50 disabled:cursor-not-allowed
                  min-w-[160px]"
              >
                {savedIndices.has(currentIndex) ? '저장됨' : '현재 카드 저장'}
              </Button>

              {/* 전체 저장 버튼 */}
              <Button
                onClick={handleSaveAll}
                disabled={savedIndices.size === analysisResults.length}
                className="px-8 py-3 bg-neutral-900 text-white/90 hover:bg-neutral-800 
                  transition-all duration-300 rounded-lg border border-white/10
                  transform hover:translate-y-[-2px] hover:shadow-lg
                  active:translate-y-[0px] disabled:opacity-50 disabled:cursor-not-allowed
                  min-w-[160px]"
              >
                {savedIndices.size === analysisResults.length 
                  ? '모두 저장됨' 
                  : `${analysisResults.length - savedIndices.size}개 저장`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Box>
  )
} 