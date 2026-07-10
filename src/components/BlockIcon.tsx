import { ClipboardList, Target, HelpCircle, AlertTriangle, Mail, MessageSquare, Calendar, type LucideIcon } from 'lucide-react'

// Lucide icon per pack block — replaces the old emoji map (📋🎯💭🚨✉️💬📅)
// so the product surface matches the marketing D.A. (DESIGN-SYSTEM.md §5).
// Server-component compatible. Used by /app, /share/[token] and the pack page.
const MAP: Record<string, LucideIcon> = {
  decisions: ClipboardList,
  actions:   Target,
  questions: HelpCircle,
  risks:     AlertTriangle,
  email:     Mail,
  slack:     MessageSquare,
  agenda:    Calendar,
}

export default function BlockIcon({ id, size = 15 }: { id: string; size?: number }) {
  const Icon = MAP[id]
  if (!Icon) return <>•</>
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />
}
