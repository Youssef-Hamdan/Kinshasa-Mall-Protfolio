/** Instant jump to top; bypasses CSS `scroll-behavior` and fights scroll anchoring. */
export function forceWindowScrollTop(): void {
  if (typeof window === "undefined") return
  const html = document.documentElement
  const body = document.body
  const htmlPrev = html.style.scrollBehavior
  const bodyPrev = body.style.scrollBehavior
  html.style.scrollBehavior = "auto"
  body.style.scrollBehavior = "auto"
  html.scrollTop = 0
  body.scrollTop = 0
  window.scrollTo(0, 0)
  requestAnimationFrame(() => {
    html.scrollTop = 0
    body.scrollTop = 0
    window.scrollTo(0, 0)
    html.style.scrollBehavior = htmlPrev
    body.style.scrollBehavior = bodyPrev
  })
}
