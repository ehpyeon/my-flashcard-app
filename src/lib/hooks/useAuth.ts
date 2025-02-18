'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
    error: null
  });
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setState(prev => ({ ...prev, isAuthenticated: !!session }))
        
        // 인증이 필요한 페이지에서 로그인 체크
        if (!session && pathname !== '/login') {
          router.push('/login')
        }
        // 이미 로그인된 상태에서 로그인 페이지 접근 시 홈으로 리다이렉트
        if (session && pathname === '/login') {
          router.push('/')
        }
      } catch (error) {
        console.error('Auth error:', error)
        setState(prev => ({ ...prev, isAuthenticated: false }))
      } finally {
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setState(prev => ({ ...prev, isAuthenticated: !!session }))
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return { ...state, signOut }
} 