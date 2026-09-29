'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function GlowCheckbox({
  checked,
  onToggle,
  label,
  size = 'md',
}: {
  checked: boolean
  onToggle: () => void
  label: string
  size?: 'sm' | 'md'
}) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        size === 'md' ? 'size-6' : 'size-[18px]',
        checked
          ? 'border-transparent bg-gradient-to-br from-primary to-accent shadow-[0_0_16px_-2px_var(--color-primary)]'
          : 'border-white/25 hover:border-primary/70',
      )}
    >
      <svg viewBox="0 0 24 24" className={size === 'md' ? 'size-3.5' : 'size-2.5'} aria-hidden="true">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-foreground"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </svg>
    </motion.button>
  )
}
