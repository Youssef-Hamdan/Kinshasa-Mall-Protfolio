"use client"

import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as const

export type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Seconds — staggered children can pass incremental delays */
  delay?: number
  /** Initial vertical offset (px) */
  y?: number
}

/**
 * Scroll-triggered fade + slight rise. Respects `prefers-reduced-motion`.
 */
export function Reveal({ children, className, delay = 0, y = 20 }: RevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={cn(className)}
      initial={
        reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-56px 0px -32px 0px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  )
}
