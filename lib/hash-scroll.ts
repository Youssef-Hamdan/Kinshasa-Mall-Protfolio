/**
 * Scrolls to an element by id, offsetting for the fixed premium header.
 */
export function scrollToHashId(id: string) {
  const el = document.getElementById(id)
  if (!el) return

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth"

  const header = document.querySelector<HTMLElement>("[data-premium-header]")
  const offset = header ? header.getBoundingClientRect().height + 12 : 80
  const top =
    el.getBoundingClientRect().top + window.scrollY - offset

  window.scrollTo({ top: Math.max(0, top), behavior })
}
