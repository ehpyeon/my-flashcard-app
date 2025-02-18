'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoginButton } from './LoginButton'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error logging out:', error)
      alert('로그아웃에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <Box className="max-w-md w-full text-center mb-8">
          <h1 className="text-3xl font-light text-white/90 mb-8 tracking-wide">
            VAN&apos;S ENGLISH
          </h1>
          <p className="text-white/60 mb-12 tracking-wide">
            {authMode === 'login' ? '이메일로 로그인하세요' : '회원가입을 진행하세요'}
          </p>
          <LoginButton onModeChange={setAuthMode} />
        </Box>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="w-full px-6 py-4 flex justify-end border-b border-white/10">
        <Button
          onClick={handleLogout}
          className="px-4 py-2 bg-transparent text-white/60 hover:text-white/90 transition-colors text-sm font-light"
        >
          로그아웃
        </Button>
      </div>
      {children}
    </div>
  )
} 