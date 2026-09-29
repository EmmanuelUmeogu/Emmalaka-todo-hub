'use client'

import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion'
import { Check, ChevronDown, GripVertical, Loader2, Pencil, Trash2, Wand2, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { breakdownTask } from '@/app/actions/ai'
import type { TodoActions } from '@/hooks/use-todos'
import { CATEGORIES, PRIORITIES, PRIORITY_ORDER } from '@/lib/todo-config'
import type { Category, Priority, Task } from '@/lib/todo-types'
import { cn } from '@/lib/utils'
import { CategoryBadge, PriorityBadge } from './badges'
import { GlowCheckbox } from './glow-checkbox'
import { SubtaskList } from './subtask-list'

const iconButton =
  'rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40'

export function TaskItem({ task, actions }: { task: Task; actions: TodoActions }) {
  const controls = useDragControls()
  const [expanded, setExpanded] = useState(task.subtasks.length > 0 && !task.completed)
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title)
  const [draftPriority, setDraftPriority] = useState<Priority>(task.priority)
  const [draftCategory, setDraftCategory] = useState<Category>(task.category)
  const [isBreaking, startBreak] = useTransition()

  const doneCount = task.subtasks.filter((s) => s.completed).length
  const total = task.subtasks.length
  const subProgress = total ? (doneCount / total) * 100 : 0

  function startEdit() {
    setDraftTitle(task.title)
    setDraftPriority(task.priority)
    setDraftCategory(task.category)
    setEditing(true)
  }

  function saveEdit() {
    const title = draftTitle.trim()
    if (title) actions.editTask(task.id, { title, priority: draftPriority, category: draftCategory })
    setEditing(false)
  }

  function handleBreakdown() {
    startBreak(async () => {
      const { subtasks } = await breakdownTask(task.title)
      if (subtasks.length) {
        actions.addSubtasks(task.id, subtasks)
        setExpanded(true)
      }
    })
  }

  return (
    <Reorder.Item
      value={task.id}
      dragListener={false}
      dragControls={controls}
      layout="position"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -32, scale: 0.96, transition: { duration: 0.2 } }}
      whileDrag={{ scale: 1.02, zIndex: 10, boxShadow: '0 24px 60px -20px var(--color-primary)' }}
      className="glass group relative list-none overflow-hidden rounded-2xl"
    >
      <div
        className={cn(
          'absolute inset-y-0 left-0 w-[3px] opacity-80',
          PRIORITIES[task.priority].bar,
          task.completed && 'opacity-20',
        )}
        aria-hidden="true"
      />
      <div className="flex items-start gap-2 p-3 pl-2 md:gap-3 md:p-4 md:pl-3">
        <button
          type="button"
          aria-label={`Drag to reorder ${task.title}`}
          onPointerDown={(e) => controls.start(e)}
          className="mt-0.5 cursor-grab touch-none rounded-md p-0.5 text-muted-foreground/50 hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        <GlowCheckbox
          checked={task.completed}
          onToggle={() => actions.toggleTask(task.id)}
          label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
        />

        <div className="min-w-0 flex-1">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveEdit()
              }}
              className="flex flex-col gap-2.5"
            >
              <label htmlFor={`edit-${task.id}`} className="sr-only">
                Task title
              </label>
              <input
                id={`edit-${task.id}`}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
                maxLength={300}
                autoFocus
                className="w-full rounded-lg border border-input bg-black/20 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/60"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                {PRIORITY_ORDER.map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={draftPriority === p}
                    onClick={() => setDraftPriority(p)}
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                      draftPriority === p ? PRIORITIES[p].badge : 'border-border text-muted-foreground',
                    )}
                  >
                    {PRIORITIES[p].label}
                  </button>
                ))}
                <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
                <label htmlFor={`cat-${task.id}`} className="sr-only">
                  Category
                </label>
                <select
                  id={`cat-${task.id}`}
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value as Category)}
                  className="rounded-full border border-border bg-popover px-2 py-0.5 text-[11px] text-foreground focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="ml-auto flex gap-1">
                  <button type="button" onClick={() => setEditing(false)} className={iconButton} aria-label="Cancel editing">
                    <X className="size-4" />
                  </button>
                  <button type="submit" className={cn(iconButton, 'text-primary')} aria-label="Save changes">
                    <Check className="size-4" />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              <p
                onDoubleClick={startEdit}
                className={cn(
                  'text-pretty text-sm font-medium leading-6 transition-colors md:text-[15px]',
                  task.completed && 'text-muted-foreground line-through decoration-primary/60',
                )}
              >
                {task.title}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <PriorityBadge priority={task.priority} />
                <CategoryBadge category={task.category} />
                {total > 0 && (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    aria-controls={`subtasks-${task.id}`}
                    className="flex items-center gap-1.5 rounded-full px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <span className="relative h-1 w-10 overflow-hidden rounded-full bg-white/10">
                      <motion.span
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent"
                        animate={{ width: `${subProgress}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                      />
                    </span>
                    {doneCount}/{total}
                    <ChevronDown
                      className={cn('size-3 transition-transform', expanded && 'rotate-180')}
                      aria-hidden="true"
                    />
                    <span className="sr-only">subtasks, {expanded ? 'collapse' : 'expand'}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {!editing && (
          <div className="flex shrink-0 items-center opacity-100 transition-opacity md:opacity-60 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <button
              type="button"
              onClick={handleBreakdown}
              disabled={isBreaking || task.completed}
              className={cn(iconButton, 'text-accent hover:text-accent')}
              aria-label="Smart breakdown into subtasks with AI"
              title="Smart breakdown"
            >
              {isBreaking ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
            </button>
            <button type="button" onClick={startEdit} className={iconButton} aria-label="Edit task" title="Edit">
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => actions.deleteTask(task.id)}
              className={cn(iconButton, 'hover:text-destructive')}
              aria-label="Delete task"
              title="Delete"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {(expanded || isBreaking) && (
          <motion.div
            id={`subtasks-${task.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <SubtaskList task={task} actions={actions} isGenerating={isBreaking} />
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  )
}
