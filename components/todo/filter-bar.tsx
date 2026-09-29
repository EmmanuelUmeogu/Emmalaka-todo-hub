'use client'

import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { CATEGORIES, PRIORITIES, PRIORITY_ORDER } from '@/lib/todo-config'
import type { Filters, StatusFilter } from '@/lib/todo-types'
import { cn } from '@/lib/utils'

const STATUSES: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
]

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  layoutId,
}: {
  label: string
  options: { id: T; label: string; dot?: string }[]
  value: T
  onChange: (value: T) => void
  layoutId: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full border border-border bg-secondary p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className="relative rounded-full px-3 py-1 text-xs font-medium"
        >
          {value === o.id && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-full bg-primary/20 ring-1 ring-primary/40"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span
            className={cn(
              'relative flex items-center gap-1.5',
              value === o.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o.dot && <span className={cn('size-1.5 rounded-full', o.dot)} aria-hidden="true" />}
            {o.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export function FilterBar({
  filters,
  onChange,
  onReset,
  isFiltered,
}: {
  filters: Filters
  onChange: (filters: Filters) => void
  onReset: () => void
  isFiltered: boolean
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value })

  return (
    <motion.section
      aria-label="Search and filters"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col gap-3"
    >
      <div className="glass flex items-center gap-2 rounded-2xl px-3.5 py-2.5 focus-within:ring-1 focus-within:ring-primary/50">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="task-search" className="sr-only">
          Search tasks
        </label>
        <input
          id="task-search"
          type="search"
          value={filters.query}
          onChange={(e) => set('query', e.target.value)}
          placeholder="Search tasks and subtasks..."
          className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {filters.query && (
          <button
            type="button"
            onClick={() => set('query', '')}
            className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          label="Status"
          layoutId="filter-status"
          options={STATUSES}
          value={filters.status}
          onChange={(v) => set('status', v)}
        />
        <Segmented
          label="Priority"
          layoutId="filter-priority"
          options={[
            { id: 'all' as const, label: 'Any' },
            ...PRIORITY_ORDER.map((p) => ({ id: p, label: PRIORITIES[p].label, dot: PRIORITIES[p].bar })),
          ]}
          value={filters.priority}
          onChange={(v) => set('priority', v)}
        />
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      <div role="radiogroup" aria-label="Category" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {[{ id: 'all' as const, label: 'All categories', icon: null }, ...CATEGORIES].map(
          ({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={filters.category === id}
              onClick={() => set('category', id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                filters.category === id
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {Icon && <Icon className="size-3.5" aria-hidden="true" />}
              {label}
            </button>
          ),
        )}
      </div>
    </motion.section>
  )
}
