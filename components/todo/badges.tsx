import { CATEGORY_MAP, PRIORITIES } from '@/lib/todo-config'
import type { Category, Priority } from '@/lib/todo-types'
import { cn } from '@/lib/utils'

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITIES[priority]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        config.badge,
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {config.label}
      <span className="sr-only"> priority</span>
    </span>
  )
}

export function CategoryBadge({ category }: { category: Category }) {
  const { label, icon: Icon } = CATEGORY_MAP[category]
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}
