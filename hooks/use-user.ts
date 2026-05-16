'use client'

import { useAuth } from '@/components/providers/auth-provider'

export function useUser() {
  const { user, session, isLoading } = useAuth()
  
  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
  }
}
