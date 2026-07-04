'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthProvider'
import { ArrowRight } from 'lucide-react'

export default function HeroCta({ className }: { className?: string }) {
  const { user, loading } = useAuth()
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

  // Two-state CTA — explicit and predictable.
  // Signed-out OR still loading → guest-friendly invitation.
  // Signed-in → "Continue" because the user already has an account / context.
  const label = !loading && user ? 'Continue' : 'Try it free'

  return (
    <Link ref={ref} href="/app" className={className}>
      {label} <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
    </Link>
  )
}