import {
  Briefcase,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  ShoppingBag,
  User,
  type LucideIcon,
} from 'lucide-react'
import type { Category, Priority } from './todo-types'

export const PRIORITIES: Record<
  Priority,
  { label: string; badge: string; dot: string; bar: string }
> = {
  high: {
    label: 'High',
    badge: 'text-rose-300 bg-rose-400/10 border-rose-400/25',
    dot: 'bg-rose-400 shadow-[0_0_10px_var(--color-rose-400)]',
    bar: 'bg-rose-400',
  },
  medium: {
    label: 'Medium',
    badge: 'text-amber-200 bg-amber-300/10 border-amber-300/25',
    dot: 'bg-amber-300 shadow-[0_0_10px_var(--color-amber-300)]',
    bar: 'bg-amber-300',
  },
  low: {
    label: 'Low',
    badge: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/25',
    dot: 'bg-emerald-400 shadow-[0_0_10px_var(--color-emerald-400)]',
    bar: 'bg-emerald-400',
  },
}

export const PRIORITY_ORDER: Priority[] = ['low', 'medium', 'high']

export const CATEGORIES: { id: Category; label: string; icon: LucideIcon }[] = [
  { id: 'work', label: 'Work', icon: Briefcase },
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'health', label: 'Health', icon: HeartPulse },
  { id: 'learning', label: 'Learning', icon: GraduationCap },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<Category, (typeof CATEGORIES)[number]>
