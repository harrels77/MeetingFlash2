// Time-of-day greeting + first-name helper — shared by the post-login
// welcome toast and the dashboard header greeting.

export function timeGreeting(date = new Date()): string {
  const h = date.getHours()
  if (h < 5) return 'Working late'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function firstNameOf(fullName?: string | null): string {
  if (!fullName) return ''
  return fullName.trim().split(/\s+/)[0] || ''
}
