'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, CircleDashed, Flame, ListChecks } from 'lucide-react'
import { useMemo } from 'react'
import { CATEGORIES, PRIORITIES } from '@/lib/todo-config'
import type { Priority, Task } from '@/lib/todo-types'
import { cn } from '@/lib/utils'

function ProgressRing({ value }: { value: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative size-28 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          style={{ filter: 'drop-shadow(0 0 6px var(--color-primary))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-semibold tabular-nums">{Math.round(value)}%</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">done</span>
      </div>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ListChecks
  label: string
  value: number
  tone: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-white/[0.02] p-3">
      <Icon className={cn('size-4', tone)} aria-hidden="true" />
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono text-xl font-semibold tabular-nums"
      >
        {value}
      </motion.span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function StatsDashboard({
  tasks,
  onClearCompleted,
}: {
  tasks: Task[]
  onClearCompleted: () => void
}) {
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const subtasks = tasks.flatMap((t) => t.subtasks)
    const byPriority = (['high', 'medium', 'low'] as Priority[]).map((p) => {
      const inPriority = tasks.filter((t) => t.priority === p)
      return {
        priority: p,
        total: inPriority.length,
        open: inPriority.filter((t) => !t.completed).length,
      }
    })
    const byCategory = CATEGORIES.map((c) => ({
      ...c,
      count: tasks.filter((t) => t.category === c.id && !t.completed).length,
    })).filter((c) => c.count > 0)

    return {
      total,
      completed,
      active: total - completed,
      rate: total ? (completed / total) * 100 : 0,
      subDone: subtasks.filter((s) => s.completed).length,
      subTotal: subtasks.length,
      urgent: byPriority[0].open,
      byPriority,
      byCategory,
    }
  }, [tasks])

  const maxPriority = Math.max(1, ...stats.byPriority.map((p) => p.total))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass flex flex-col gap-5 rounded-3xl p-5"
    >
      <div className="flex items-center gap-5">
        <ProgressRing value={stats.rate} />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-sm font-medium text-muted-foreground">Completion rate</h2>
          <p className="text-pretty text-sm leading-relaxed">
            <span className="font-semibold text-foreground">{stats.completed}</span> of{' '}
            <span className="font-semibold text-foreground">{stats.total}</span> tasks finished
          </p>
          {stats.subTotal > 0 && (
            <p className="text-xs text-muted-foreground">
              {stats.subDone}/{stats.subTotal} subtasks complete
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span>Overall progress</span>
          <span className="font-mono tabular-nums">{Math.round(stats.rate)}%</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-white/[0.06]"
          role="progressbar"
          aria-label="Overall progress"
          aria-valuenow={Math.round(stats.rate)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent shadow-[0_0_12px_var(--color-primary)]"
            initial={{ width: 0 }}
            animate={{ width: `${stats.rate}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatTile icon={CircleDashed} label="Active" value={stats.active} tone="text-accent" />
        <StatTile icon={CheckCircle2} label="Done" value={stats.completed} tone="text-primary" />
        <StatTile icon={Flame} label="Urgent" value={stats.urgent} tone="text-rose-400" />
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">By priority</h3>
        {stats.byPriority.map(({ priority, total, open }) => (
          <div key={priority} className="flex items-center gap-3 text-xs">
            <span className="w-14 text-muted-foreground">{PRIORITIES[priority].label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className={cn('h-full rounded-full', PRIORITIES[priority].bar)}
                animate={{ width: `${(total / maxPriority) * 100}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
            <span className="w-12 text-right font-mono tabular-nums text-muted-foreground">
              {open} open
            </span>
          </div>
        ))}
      </div>

      {stats.byCategory.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Open by category</h3>
          <div className="flex flex-wrap gap-1.5">
            {stats.byCategory.map(({ id, label, icon: Icon, count }) => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
                <span className="font-mono text-foreground">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.completed > 0 && (
        <button
          type="button"
          onClick={onClearCompleted}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
        >
          <ListChecks className="size-3.5" aria-hidden="true" />
          Clear {stats.completed} completed
        </button>
      )}
    </motion.div>
  )
}
