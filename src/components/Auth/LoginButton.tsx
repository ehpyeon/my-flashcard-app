'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface LoginButtonProps {
  onModeChange: (mode: 'login' | 'signup') => void;
}

export function LoginButton({ onModeChange }: LoginButtonProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
    } catch (error) {
      console.error('Error logging in:', error)
      alert('로그인에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 비밀번호 유효성 검사
    if (password.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirmed: false
          }
        }
      })
      
      if (error) {
        if (error.message.includes('email')) {
          alert('이미 사용 중인 이메일입니다')
        } else {
          throw error
        }
        return
      }
      
      alert('가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.')
      setEmail('')
      setPassword('')
    } catch (error) {
      console.error('Error signing up:', error)
      alert('회원가입에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'signup' : 'login'
    setMode(newMode)
    onModeChange(newMode)
    setEmail('')
    setPassword('')
  }

  return (
    <form onSubmit={mode === 'login' ? handleEmailLogin : handleSignUp} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-3 bg-neutral-900 text-white/90 rounded-lg border border-white/10 focus:outline-none focus:border-white/20"
        required
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-4 py-3 bg-neutral-900 text-white/90 rounded-lg border border-white/10 focus:outline-none focus:border-white/20"
        required
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 px-8 py-3 bg-neutral-900 text-white/90 hover:bg-neutral-800 transition-colors rounded-lg border border-white/10 text-lg font-light tracking-wide"
        >
          {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </Button>
        <Button
          type="button"
          onClick={toggleMode}
          disabled={loading}
          className="flex-1 px-8 py-3 bg-neutral-800 text-white/90 hover:bg-neutral-700 transition-colors rounded-lg border border-white/10 text-lg font-light tracking-wide"
        >
          {mode === 'login' ? '회원가입하기' : '로그인하기'}
        </Button>
      </div>
    </form>
  )
} 