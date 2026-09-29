'use server'

import { generateText, Output } from 'ai'
import { z } from 'zod'
import { heuristicBreakdown, heuristicPriority } from '@/lib/ai-heuristics'
import type { Priority } from '@/lib/todo-types'

const MODEL = 'google/gemini-3.5-flash-lite'
const MAX_TITLE_LENGTH = 300

type Source = 'ai' | 'heuristic'

function sanitize(title: string) {
  return String(title ?? '').trim().slice(0, MAX_TITLE_LENGTH)
}

export async function suggestPriority(
  rawTitle: string,
): Promise<{ priority: Priority; reason: string; source: Source }> {
  const title = sanitize(rawTitle)
  if (!title) return { ...heuristicPriority(''), source: 'heuristic' }

  try {
    const { output } = await generateText({
      model: MODEL,
      instructions:
        'You triage personal and work to-do items. Choose a priority based on urgency, consequences of delay, and deadlines. Keep the reason under 15 words.',
      prompt: `Task: ${title}`,
      output: Output.object({
        schema: z.object({
          priority: z.enum(['low', 'medium', 'high']),
          reason: z.string(),
        }),
      }),
    })
    return { ...output, source: 'ai' }
  } catch (error) {
    console.error('[ai] suggestPriority failed, using heuristic:', error)
    return { ...heuristicPriority(title), source: 'heuristic' }
  }
}

export async function breakdownTask(
  rawTitle: string,
): Promise<{ subtasks: string[]; source: Source }> {
  const title = sanitize(rawTitle)
  if (!title) return { subtasks: [], source: 'heuristic' }

  try {
    const { output } = await generateText({
      model: MODEL,
      instructions:
        'You break tasks into 3 to 6 concrete, actionable subtasks. Each subtask starts with a verb and is under 10 words. Do not number them.',
      prompt: `Task: ${title}`,
      output: Output.object({
        schema: z.object({
          subtasks: z.array(z.string()).min(1).max(6),
        }),
      }),
    })
    return {
      subtasks: output.subtasks.map((s) => s.trim().slice(0, 120)).filter(Boolean),
      source: 'ai',
    }
  } catch (error) {
    console.error('[ai] breakdownTask failed, using heuristic:', error)
    return { subtasks: heuristicBreakdown(title), source: 'heuristic' }
  }
}
