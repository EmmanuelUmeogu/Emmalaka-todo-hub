'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Plus, Sparkles } from 'lucide-react'
import { useState, useTransition } from 'react'
import { suggestPriority } from '@/app/actions/ai'
import { CATEGORIES, PRIORITIES, PRIORITY_ORDER } from '@/lib/todo-config'
import type { Category, NewTaskInput, Priority } from '@/lib/todo-types'
import { cn } from '@/lib/utils'

export function TaskComposer({ onAdd }: { onAdd: (input: NewTaskInput) => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('work')
  const [priority, setPriority] = useState<Priority>('medium')
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [isSuggesting, startSuggest] = useTransition()

  const trimmed = title.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!trimmed) return
    onAdd({ title: trimmed, category, priority })
    setTitle('')
    setSuggestion(null)
  }

  function handleSuggest() {
    if (!trimmed) return
    startSuggest(async () => {
      const result = await suggestPriority(trimmed)
      setPriority(result.priority)
      setSuggestion(
        result.source === 'ai' ? result.reason : `${result.reason} (offline suggestion)`,
      )
    })
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="glass flex flex-col gap-4 rounded-3xl p-4 md:p-5"
    >
      <div className="flex items-center gap-2">
        <label htmlFor="new-task" className="sr-only">
          New task
        </label>
        <input
          id="new-task"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (suggestion) setSuggestion(null)
          }}
          placeholder="What needs to get done?"
          maxLength={300}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-1 text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none md:text-lg"
        />
        <motion.button
          type="submit"
          disabled={!trimmed}
          whileTap={{ scale: 0.94 }}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-[0_0_24px_-6px_var(--color-primary)] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Add task</span>
          <span className="sr-only sm:hidden">Add task</span>
        </motion.button>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <fieldset className="min-w-0">
          <legend className="sr-only">Category</legend>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={category === id}
                onClick={() => setCategory(id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  category === id
                    ? 'border-primary/50 bg-primary/15 text-foreground'
                    : 'border-border bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="Priority" className="flex rounded-full border border-border bg-secondary p-0.5">
            {PRIORITY_ORDER.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={priority === p}
                onClick={() => setPriority(p)}
                className="relative rounded-full px-2.5 py-1 text-xs font-medium"
              >
                {priority === p && (
                  <motion.span
                    layoutId="composer-priority"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={cn('relative flex items-center gap-1.5', priority === p ? 'text-foreground' : 'text-muted-foreground')}>
                  <span className={cn('size-1.5 rounded-full', PRIORITIES[p].bar)} aria-hidden="true" />
                  {PRIORITIES[p].label}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSuggest}
            disabled={!trimmed || isSuggesting}
            className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-40"
          >
            {isSuggesting ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="size-3.5" aria-hidden="true" />
            )}
            Suggest
            <span className="sr-only"> priority with AI</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {suggestion && (
          <motion.p
            role="status"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 overflow-hidden text-xs text-muted-foreground"
          >
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden="true" />
            <span>
              <span className="font-medium text-foreground">Suggested {PRIORITIES[priority].label.toLowerCase()}:</span>{' '}
              {suggestion}
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </motion.form>
  )
}
