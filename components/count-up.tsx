"use client"

import { useEffect, useRef, useState } from "react"

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Animates an integer from 0 to `to` when the element enters the viewport once.
 */
export function CountUpInteger({
  to,
  suffix = "",
  className,
  durationMs = 2200,
}: {
  to: number
  suffix?: string
  className?: string
  durationMs?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return
        startedRef.current = true
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs)
          setValue(Math.round(to * easeOutCubic(t)))
          if (t < 1) requestAnimationFrame(tick)
          else setValue(to)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to, durationMs])

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  )
}
