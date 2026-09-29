export type Priority = 'low' | 'medium' | 'high'

export type Category =
  | 'work'
  | 'personal'
  | 'health'
  | 'learning'
  | 'shopping'
  | 'ideas'

export type StatusFilter = 'all' | 'active' | 'completed'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  completed: boolean
  priority: Priority
  category: Category
  subtasks: Subtask[]
  createdAt: number
}

export interface NewTaskInput {
  title: string
  priority: Priority
  category: Category
}

export interface Filters {
  query: string
  status: StatusFilter
  category: Category | 'all'
  priority: Priority | 'all'
}
