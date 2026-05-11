'use client'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const { loadAll, subscribeRealtime, initialized, setCurrentUser, setRole } = useStore()

  useEffect(() => {
    const supabase = getSupabaseClient()

    async function loadUserAndData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setCurrentUser({
            id:        session.user.id,
            name:      profile.name,
            email:     session.user.email ?? '',
            role:      profile.role,
            seller_id: profile.seller_id ?? null,
          })
          setRole(profile.role)
        }
      }

      if (!initialized) loadAll()
    }

    loadUserAndData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setCurrentUser(null)
      }
    })

    const unsub = subscribeRealtime()
    return () => {
      unsub()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            borderRadius: 10,
            border: '1px solid #E8ECF2',
          },
          success: { iconTheme: { primary: '#1A7A48', secondary: 'white' } },
          error:   { iconTheme: { primary: '#C0321E', secondary: 'white' } },
        }}
      />
    </>
  )
}
