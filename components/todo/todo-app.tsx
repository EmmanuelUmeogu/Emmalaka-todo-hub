'use client'

import { useMemo, useState } from 'react'
import { useTodos } from '@/hooks/use-todos'
import type { Filters } from '@/lib/todo-types'
import { AmbientBackground } from './ambient-background'
import { AppHeader } from './app-header'
import { FilterBar } from './filter-bar'
import { StatsDashboard } from './stats-dashboard'
import { TaskComposer } from './task-composer'
import { TaskList } from './task-list'

const DEFAULT_FILTERS: Filters = {
  query: '',
  status: 'all',
  category: 'all',
  priority: 'all',
}

export function TodoApp() {
  const { tasks, hydrated, actions } = useTodos()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const visibleTasks = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    return tasks.filter((t) => {
      if (filters.status === 'active' && t.completed) return false
      if (filters.status === 'completed' && !t.completed) return false
      if (filters.category !== 'all' && t.category !== filters.category) return false
      if (filters.priority !== 'all' && t.priority !== filters.priority) return false
      if (
        query &&
        !t.title.toLowerCase().includes(query) &&
        !t.subtasks.some((s) => s.title.toLowerCase().includes(query))
      ) {
        return false
      }
      return true
    })
  }, [tasks, filters])

  const isFiltered =
    filters.query !== '' ||
    filters.status !== 'all' ||
    filters.category !== 'all' ||
    filters.priority !== 'all'

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <AmbientBackground />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        <AppHeader />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="flex min-w-0 flex-col gap-4">
            <TaskComposer onAdd={actions.addTask} />
            <FilterBar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
              isFiltered={isFiltered}
            />
            <TaskList
              tasks={visibleTasks}
              totalCount={tasks.length}
              hydrated={hydrated}
              isFiltered={isFiltered}
              actions={actions}
            />
          </div>
          <aside aria-label="Progress dashboard">
            <div className="lg:sticky lg:top-8">
              <StatsDashboard tasks={tasks} onClearCompleted={actions.clearCompleted} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
