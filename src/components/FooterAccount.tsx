'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthProvider'

export default function FooterAccount({ className, colTitleClass }: { className: string, colTitleClass: string }) {
  const { user, loading } = useAuth()

  return (
    <div className={className}>
      <div className={colTitleClass}>Account</div>
      { user ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/settings">Settings</Link>
          <Link href="/app">New Flash</Link>
        </>
      ) : (
        <>
          <Link href="/login">Sign in</Link>
          <Link href="/signup">Create account</Link>
          <Link href="/dashboard">Dashboard</Link>
        </>
      )}
    </div>
  )
}