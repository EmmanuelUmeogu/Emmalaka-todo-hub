'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function AppHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-wrap items-end justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <Image
          src="/images/emma.jpg"
          alt="Emma"
          width={56}
          height={56}
          priority
          className="size-12 rounded-2xl object-cover object-top ring-2 ring-primary/60 shadow-[0_0_30px_-4px_var(--color-primary)] md:size-14"
        />
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Emmalaka To-Do Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Plan clearly. Break it down. Get it done.
          </p>
        </div>
      </div>
      <p className="glass hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted-foreground sm:flex">
        <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
        AI breakdown and priority suggestions built in
      </p>
    </motion.header>
  )
}
