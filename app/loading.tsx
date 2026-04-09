import { LiquidGlassSurface } from "@/components/ui/liquid-glass-surface"

export default function Loading() {
  return (
    <LiquidGlassSurface
      borderRadius="0"
      className="min-h-screen w-full bg-white/88 dark:bg-background/80"
      blurIntensity="lg"
      glowIntensity="none"
      shadowIntensity="sm"
      contentClassName="flex min-h-screen flex-col items-center justify-center gap-6 px-6"
    >
      <div className="text-center">
        <p className="font-heading text-foreground text-2xl font-bold uppercase tracking-[0.04em] md:text-3xl">
          Kinshasa Mall
        </p>
        <p className="text-muted-foreground mt-2 text-sm">Loading…</p>
      </div>
      <div
        className="border-muted border-t-primary size-10 rounded-full border-2 animate-spin"
        aria-hidden
      />
    </LiquidGlassSurface>
  )
}
