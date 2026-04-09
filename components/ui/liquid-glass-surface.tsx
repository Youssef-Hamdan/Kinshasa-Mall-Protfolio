import React from "react"
import { cn } from "@/lib/utils"

export type LiquidBlurIntensity = "sm" | "md" | "lg" | "xl"
export type LiquidShadowIntensity =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
export type LiquidGlowIntensity =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"

export const liquidGlassBlurClasses: Record<LiquidBlurIntensity, string> = {
  sm: "backdrop-blur-xs",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
}

export const liquidGlassShadowStyles: Record<LiquidShadowIntensity, string> = {
  none: "inset 0 0 0 0 rgba(255, 255, 255, 0)",
  xs: "inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3), inset -1px -1px 1px 0 rgba(255, 255, 255, 0.3)",
  sm: "inset 2px 2px 2px 0 rgba(255, 255, 255, 0.35), inset -2px -2px 2px 0 rgba(255, 255, 255, 0.35)",
  md: "inset 3px 3px 3px 0 rgba(255, 255, 255, 0.45), inset -3px -3px 3px 0 rgba(255, 255, 255, 0.45)",
  lg: "inset 4px 4px 4px 0 rgba(255, 255, 255, 0.5), inset -4px -4px 4px 0 rgba(255, 255, 255, 0.5)",
  xl: "inset 6px 6px 6px 0 rgba(255, 255, 255, 0.55), inset -6px -6px 6px 0 rgba(255, 255, 255, 0.55)",
}

export const liquidGlassGlowStyles: Record<LiquidGlowIntensity, string> = {
  none: "0 4px 4px rgba(0, 0, 0, 0.05), 0 0 12px rgba(0, 0, 0, 0.05)",
  xs: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 16px rgba(255, 255, 255, 0.05)",
  sm: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 24px rgba(255, 255, 255, 0.1)",
  md: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 32px rgba(255, 255, 255, 0.15)",
  lg: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 40px rgba(255, 255, 255, 0.2)",
  xl: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 48px rgba(255, 255, 255, 0.25)",
}

export interface LiquidGlassSurfaceProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  /** Merged into the backdrop blur layer (e.g. `backdrop-saturate-[1.15]` to match transmission glass). */
  blurClassName?: string
  blurIntensity?: LiquidBlurIntensity
  shadowIntensity?: LiquidShadowIntensity
  glowIntensity?: LiquidGlowIntensity
  borderRadius?: string
}

/**
 * Static liquid-glass stack (blur + displacement + edge highlights).
 * Use for headers, loaders, and any panel that should match the mall glass theme.
 */
export function LiquidGlassSurface({
  children,
  className = "",
  contentClassName = "",
  blurClassName = "",
  blurIntensity = "xl",
  shadowIntensity = "md",
  glowIntensity = "sm",
  borderRadius = "32px",
}: LiquidGlassSurfaceProps) {
  const br = borderRadius

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      style={{ borderRadius: br }}
    >
      <div
        className={cn(
          "absolute inset-0 z-0",
          liquidGlassBlurClasses[blurIntensity],
          blurClassName
        )}
        style={{
          borderRadius: br,
          filter: "url(#glass-blur)",
        }}
      />
      <div
        className="absolute inset-0 z-10"
        style={{
          borderRadius: br,
          boxShadow: liquidGlassGlowStyles[glowIntensity],
        }}
      />
      <div
        className="absolute inset-0 z-20"
        style={{
          borderRadius: br,
          boxShadow: liquidGlassShadowStyles[shadowIntensity],
        }}
      />
      <div className={cn("relative z-30", contentClassName)}>{children}</div>
    </div>
  )
}
