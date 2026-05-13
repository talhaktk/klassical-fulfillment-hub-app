'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PWARedirect() {
  const router = useRouter()
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      router.replace('/auth/login')
    }
  }, [router])
  return null
}
