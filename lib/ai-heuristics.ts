import type { Priority } from './todo-types'

const HIGH_SIGNALS = [
  'urgent', 'asap', 'today', 'tonight', 'deadline', 'critical', 'bug', 'fix',
  'broken', 'pay', 'bill', 'tax', 'interview', 'exam', 'due', 'overdue',
  'emergency', 'client', 'launch', 'submit', 'renew', 'doctor',
]

const LOW_SIGNALS = [
  'someday', 'maybe', 'idea', 'read', 'watch', 'browse', 'eventually',
  'explore', 'consider', 'look into', 'organize', 'tidy', 'hobby', 'wishlist',
]

export function heuristicPriority(title: string): { priority: Priority; reason: string } {
  const text = title.toLowerCase()
  const high = HIGH_SIGNALS.find((w) => text.includes(w))
  if (high) return { priority: 'high', reason: `Mentions "${high}", which signals urgency.` }
  const low = LOW_SIGNALS.find((w) => text.includes(w))
  if (low) return { priority: 'low', reason: `"${low}" suggests this can wait.` }
  return { priority: 'medium', reason: 'No strong urgency cues, so a balanced priority fits.' }
}

export function heuristicBreakdown(title: string): string[] {
  const parts = title
    .split(/,|\band\b|\bthen\b|;/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 2)

  if (parts.length >= 2) {
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
  }

  const subject = title.trim().replace(/[.!?]+$/, '')
  return [
    `Define what "done" looks like for: ${subject}`,
    'Gather the info, tools, or people you need',
    'Block a focused session to do the core work',
    'Review the result and tie up loose ends',
  ]
}
