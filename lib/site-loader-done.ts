/** Fired on `window` when {@link SiteLoader} reaches the `gone` phase (overlay removed). */
export const SITE_LOADER_DONE_EVENT = "km:site-loader-done" as const

/** Fired when the hero R3F scene reports assets ready (see `HeroSceneReadySignal` in r3f-blob). */
export const HERO_3D_READY_EVENT = "km:hero-3d-ready" as const

const DATA_ATTR = "data-km-site-loader"

export function notifySiteLoaderDone() {
  if (typeof document === "undefined") return
  document.documentElement.setAttribute(DATA_ATTR, "done")
  window.dispatchEvent(new CustomEvent(SITE_LOADER_DONE_EVENT))
}

export function isSiteLoaderDone() {
  if (typeof document === "undefined") return false
  return document.documentElement.getAttribute(DATA_ATTR) === "done"
}
