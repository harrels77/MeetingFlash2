'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthProvider'
import { supabase } from '@/lib/supabase'

export default function HeroCta({ className }: { className?: string }) {
  const { user, loading } = useAuth()
  const [label, setLabel] = useState('Try with sample notes →')
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.1 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (loading) return
    async function check() {
      if (!user) {
        const guestUsed = localStorage.getItem('mf_guest_used')
        setLabel(guestUsed ? 'Continue Flashing →' : 'Try with sample notes →')
        return
      }
      const { count } = await supabase
        .from('meetings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setLabel(count && count > 0 ? 'Continue →' : 'Try with sample notes →')
    }
    check()
  }, [user, loading])

  return (
    <Link ref={ref} href="/app" className={className}>
      {label}
    </Link>
  )
}