'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import type { TodoActions } from '@/hooks/use-todos'
import type { Task } from '@/lib/todo-types'
import { cn } from '@/lib/utils'
import { GlowCheckbox } from './glow-checkbox'

export function SubtaskList({
  task,
  actions,
  isGenerating,
}: {
  task: Task
  actions: TodoActions
  isGenerating: boolean
}) {
  const [draft, setDraft] = useState('')

  function addSubtask() {
    const title = draft.trim()
    if (!title) return
    actions.addSubtasks(task.id, [title])
    setDraft('')
  }

  return (
    <div className="border-t border-border bg-black/10 px-3 py-3 md:pl-[4.25rem] md:pr-4">
      <ul className="flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {task.subtasks.map((sub, i) => (
            <motion.li
              key={sub.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0, transition: { delay: Math.min(i * 0.04, 0.3) } }}
              exit={{ opacity: 0, x: 8, transition: { duration: 0.15 } }}
              className="group/sub flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-white/[0.03]"
            >
              <GlowCheckbox
                size="sm"
                checked={sub.completed}
                onToggle={() => actions.toggleSubtask(task.id, sub.id)}
                label={`Mark subtask ${sub.title} as ${sub.completed ? 'incomplete' : 'complete'}`}
              />
              <span
                className={cn(
                  'min-w-0 flex-1 text-sm',
                  sub.completed ? 'text-muted-foreground line-through' : 'text-foreground/90',
                )}
              >
                {sub.title}
              </span>
              <button
                type="button"
                onClick={() => actions.deleteSubtask(task.id, sub.id)}
                aria-label={`Delete subtask ${sub.title}`}
                className="rounded p-1 text-muted-foreground opacity-100 hover:text-destructive md:opacity-0 md:group-hover/sub:opacity-100 md:focus-visible:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {isGenerating && (
        <p role="status" className="flex items-center gap-2 px-1.5 py-1.5 text-xs text-accent">
          <Sparkles className="size-3.5 animate-pulse" aria-hidden="true" />
          Breaking this task into steps...
        </p>
      )}

      <div className="mt-1 flex items-center gap-2.5 px-1.5">
        <Plus className="size-[18px] text-muted-foreground" aria-hidden="true" />
        <label htmlFor={`add-sub-${task.id}`} className="sr-only">
          Add subtask
        </label>
        <input
          id={`add-sub-${task.id}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
            e.preventDefault()
            addSubtask()
          }}
          maxLength={200}
          placeholder="Add a subtask and press Enter"
          className="min-w-0 flex-1 bg-transparent py-1 text-sm placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </div>
    </div>
  )
}
