'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NewTaskInput, Subtask, Task } from '@/lib/todo-types'

const STORAGE_KEY = 'orbit-tasks:v1'

const uid = () => crypto.randomUUID()

function makeSubtasks(titles: string[]): Subtask[] {
  return titles.map((title) => ({ id: uid(), title, completed: false }))
}

function seedTasks(): Task[] {
  const now = Date.now()
  return [
    {
      id: uid(),
      title: 'Prepare Q4 product launch deck',
      completed: false,
      priority: 'high',
      category: 'work',
      createdAt: now,
      subtasks: [
        { id: uid(), title: 'Outline key launch messages', completed: true },
        { id: uid(), title: 'Pull metrics from dashboard', completed: false },
        { id: uid(), title: 'Design slides and rehearse', completed: false },
      ],
    },
    {
      id: uid(),
      title: 'Book annual health check-up',
      completed: false,
      priority: 'medium',
      category: 'health',
      createdAt: now - 1,
      subtasks: [],
    },
    {
      id: uid(),
      title: 'Read two chapters of Designing Data-Intensive Apps',
      completed: true,
      priority: 'low',
      category: 'learning',
      createdAt: now - 2,
      subtasks: [],
    },
    {
      id: uid(),
      title: 'Restock groceries for the week',
      completed: false,
      priority: 'low',
      category: 'shopping',
      createdAt: now - 3,
      subtasks: makeSubtasks(['Check pantry', 'Write list', 'Order delivery']),
    },
  ]
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return seedTasks()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useTodos() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setTasks(loadTasks())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks, hydrated])

  const updateTask = useCallback((id: string, updater: (task: Task) => Task) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? updater(t) : t)))
  }, [])

  const actions = useMemo(
    () => ({
      addTask(input: NewTaskInput) {
        const task: Task = {
          id: uid(),
          title: input.title,
          priority: input.priority,
          category: input.category,
          completed: false,
          subtasks: [],
          createdAt: Date.now(),
        }
        setTasks((prev) => [task, ...prev])
      },
      editTask(id: string, patch: Partial<Pick<Task, 'title' | 'priority' | 'category'>>) {
        updateTask(id, (t) => ({ ...t, ...patch }))
      },
      deleteTask(id: string) {
        setTasks((prev) => prev.filter((t) => t.id !== id))
      },
      toggleTask(id: string) {
        updateTask(id, (t) => {
          const completed = !t.completed
          return {
            ...t,
            completed,
            subtasks: t.subtasks.map((s) => ({ ...s, completed })),
          }
        })
      },
      addSubtasks(id: string, titles: string[]) {
        updateTask(id, (t) => ({
          ...t,
          completed: false,
          subtasks: [...t.subtasks, ...makeSubtasks(titles)],
        }))
      },
      toggleSubtask(taskId: string, subtaskId: string) {
        updateTask(taskId, (t) => {
          const subtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s,
          )
          return { ...t, subtasks, completed: subtasks.every((s) => s.completed) }
        })
      },
      deleteSubtask(taskId: string, subtaskId: string) {
        updateTask(taskId, (t) => ({
          ...t,
          subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
        }))
      },
      reorderVisible(orderedIds: string[]) {
        setTasks((prev) => {
          const byId = new Map(prev.map((t) => [t.id, t]))
          const visible = new Set(orderedIds)
          let cursor = 0
          return prev.map((t) => (visible.has(t.id) ? byId.get(orderedIds[cursor++])! : t))
        })
      },
      clearCompleted() {
        setTasks((prev) => prev.filter((t) => !t.completed))
      },
    }),
    [updateTask],
  )

  return { tasks, hydrated, actions }
}

export type TodoActions = ReturnType<typeof useTodos>['actions']
