'use client'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useStore } from '@/store'

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const { loadAll, subscribeRealtime, initialized } = useStore()

  useEffect(() => {
    if (!initialized) loadAll()
    const unsub = subscribeRealtime()
    return unsub
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
