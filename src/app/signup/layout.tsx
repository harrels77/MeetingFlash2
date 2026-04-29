import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create your free account — MeetingFlash',
  description: 'Create a free MeetingFlash account. 5 Execution Packs per month, no credit card needed.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/signup' },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
