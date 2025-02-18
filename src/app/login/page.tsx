'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

// 아이콘 컴포넌트 수정
const IconMic = () => (
  <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
)

const IconSparkles = () => (
  <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

export default function Home() {
  const router = useRouter()
  const [showSignUp, setShowSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!showSignUp) {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        // 로그인 성공 시 리다이렉션
        router.push('/')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.')
        setShowSignUp(false)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="min-h-screen bg-neutral-950">
      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center gap-12">
        {/* 왼쪽: 로그인/회원가입 폼 */}
        <div className="w-full lg:w-1/2 max-w-md mx-auto px-4">
          <Box className={`p-8 rounded-2xl ${
            showSignUp 
              ? 'bg-neutral-900/50 backdrop-blur-md' 
              : 'bg-neutral-900/50 border border-neutral-800'
          }`}>
            <Text variant="h1" className="text-white/90 text-3xl font-light mb-8 text-center">
              {showSignUp ? '회원가입' : 'SPEAK ENGLISH'}
            </Text>
            <form onSubmit={handleSubmit} className="space-y-5 max-w-full">
              <div className="w-full">
                {showSignUp && <label className="text-neutral-400 text-sm mb-2 block">이메일</label>}
                <input
                  type="email"
                  placeholder={showSignUp ? '' : '이메일'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-neutral-800/50 text-white/90 border border-neutral-700 rounded-lg 
                    focus:outline-none focus:border-neutral-600 placeholder-neutral-500"
                />
              </div>
              <div className="w-full">
                {showSignUp && <label className="text-neutral-400 text-sm mb-2 block">비밀번호</label>}
                <input
                  type="password"
                  placeholder={showSignUp ? '' : '비밀번호'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-neutral-800/50 text-white/90 border border-neutral-700 rounded-lg 
                    focus:outline-none focus:border-neutral-600 placeholder-neutral-500"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className={`
                  inline-flex items-center justify-center
                  py-3.5 rounded-lg font-medium
                  ${showSignUp 
                    ? 'bg-neutral-800 text-white/90 hover:bg-neutral-700' 
                    : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'
                  }
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                `}
              >
                {loading ? (showSignUp ? '가입 중...' : '로그인 중...') : (showSignUp ? '가입하기' : '로그인')}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowSignUp(!showSignUp)}
                className="text-neutral-500 text-sm hover:text-neutral-400 transition-colors"
              >
                {showSignUp 
                  ? '이미 계정이 있으신가요? 로그인으로 돌아가기'
                  : '계정이 없으신가요? 회원가입'
                }
              </button>
            </div>
          </Box>
        </div>

        {/* 오른쪽: 서비스 소개 */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <Text variant="h2" className="text-white text-4xl font-light mb-6">
            AI와 함께 영어 말하기 연습
          </Text>
          <Text className="text-white/60 text-lg mb-8 leading-relaxed">
            실시간 음성 인식과 AI 분석을 통해 
            자연스러운 영어 회화를 연습해보세요.
            즉각적인 피드백으로 더 효과적인 학습이 가능합니다.
          </Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md">
              <IconMic />
              <Text className="text-white font-medium mb-2">실시간 음성 인식</Text>
              <Text className="text-white/60 text-sm">
                말하는 즉시 텍스트로 변환되어 확인할 수 있습니다
              </Text>
            </div>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md">
              <IconSparkles />
              <Text className="text-white font-medium mb-2">AI 분석</Text>
              <Text className="text-white/60 text-sm">
                문법, 발음, 표현 등을 자세히 분석해드립니다
              </Text>
            </div>
          </div>

          <div className="relative w-full h-64 rounded-xl overflow-hidden bg-white/5 backdrop-blur-md p-6">
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Text className="text-white/80 text-xl font-light">
                실시간 음성 인식 데모
              </Text>
              <Text className="text-white/40 text-sm">
                로그인하고 바로 시작해보세요
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}
