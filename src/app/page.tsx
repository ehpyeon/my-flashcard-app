'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'
import { useAuth } from '@/lib/hooks/useAuth'

// 아이콘 컴포넌트들
const IconMic = () => (
  <svg className="w-12 h-12 mb-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
)

const IconBook = () => (
  <svg className="w-12 h-12 mb-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading, signOut } = useAuth()

  if (loading) {
    return (
      <Box className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white/80 rounded-full animate-spin" />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return null // useAuth에서 자동으로 /login으로 리다이렉트됨
  }

  return (
    <Box className="min-h-screen bg-neutral-950">
      {/* 헤더 */}
      <div className="absolute top-0 right-0 p-6">
        <Button
          onClick={signOut}
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white/80 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          로그아웃
        </Button>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Text variant="h1" className="text-white/90 text-4xl font-light mb-16 text-center">
            SPEAK ENGLISH
          </Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* 말하기 연습 카드 */}
            <Box className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:bg-neutral-900/70 transition-all duration-200 hover:scale-105">
              <Button
                onClick={() => router.push('/generation')}
                variant="ghost"
                className="w-full h-full flex flex-col items-center justify-center py-12"
              >
                <IconMic />
                <Text className="text-2xl font-light text-white/90 mb-2">말하기 연습</Text>
                <Text className="text-sm text-white/60 text-center">
                  AI와 함께 실시간으로<br />
                  영어 말하기를 연습해보세요
                </Text>
              </Button>
            </Box>

            {/* 학습하기 카드 */}
            <Box className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:bg-neutral-900/70 transition-all duration-200 hover:scale-105">
              <Button
                onClick={() => router.push('/study')}
                variant="ghost"
                className="w-full h-full flex flex-col items-center justify-center py-12"
              >
                <IconBook />
                <Text className="text-2xl font-light text-white/90 mb-2">학습하기</Text>
                <Text className="text-sm text-white/60 text-center">
                  플래시카드로 영어 문장을<br />
                  복습하고 학습해보세요
                </Text>
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </Box>
  )
}
