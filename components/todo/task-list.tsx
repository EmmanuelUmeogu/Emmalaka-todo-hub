'use client'

import { AnimatePresence, motion, Reorder } from 'framer-motion'
import { Inbox, SearchX } from 'lucide-react'
import type { TodoActions } from '@/hooks/use-todos'
import type { Task } from '@/lib/todo-types'
import { TaskItem } from './task-item'

export function TaskList({
  tasks,
  totalCount,
  hydrated,
  isFiltered,
  actions,
}: {
  tasks: Task[]
  totalCount: number
  hydrated: boolean
  isFiltered: boolean
  actions: TodoActions
}) {
  if (!hydrated) {
    return (
      <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="Loading tasks">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass h-[76px] animate-pulse rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <section aria-label="Tasks" className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          {isFiltered && ` of ${totalCount}`}
        </span>
        {tasks.length > 1 && <span className="hidden sm:inline">Drag the handle to reorder</span>}
      </div>

      <Reorder.Group
        axis="y"
        values={tasks.map((t) => t.id)}
        onReorder={actions.reorderVisible}
        className="flex flex-col gap-2.5"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} actions={actions} />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <AnimatePresence>
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass flex flex-col items-center gap-2 rounded-3xl px-6 py-14 text-center"
          >
            {isFiltered ? (
              <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
            ) : (
              <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
            )}
            <p className="font-medium">{isFiltered ? 'No matching tasks' : 'Your list is clear'}</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {isFiltered
                ? 'Try a different search term or loosen your filters.'
                : 'Add a task above and let AI break it down into steps.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
