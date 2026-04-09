"use client"

import { useId, useMemo } from "react"
import { cn } from "@/lib/utils"

/**
 * Isometric-cube honeycomb (reference): uniform tessellation, thin grey lines,
 * hex perimeter + three spokes per cell (center → alternating vertices).
 */
export const HEX_BG_DEFAULTS = {
  /** >1 = smaller cells / denser grid */
  density: 1,
  /** 0 = flat (reference); higher adds a very soft bloom behind the mesh */
  glowAmount: 0,
  /** 1 = neutral grey; >1 nudges strokes slightly warmer */
  colorIntensity: 1,
  /** Very slow drift of the whole mesh (off by default, reference is static) */
  enableDrift: false,
} as const

export type HexagonalBackgroundProps = {
  className?: string
  absolute?: boolean
  density?: number
  glowAmount?: number
  colorIntensity?: number
  enableDrift?: boolean
}

const VIEW_W = 1000
const VIEW_H = 640

/** Round SVG coords so Node SSR and browser produce identical markup (avoids hydration mismatches). */
function qCoord(n: number, decimals = 3): number {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}

function axialToPixelFlatTop(q: number, r: number, R: number) {
  const x = R * Math.sqrt(3) * (q + r / 2)
  const y = R * (3 / 2) * r
  return { x: qCoord(x), y: qCoord(y) }
}

function flatTopHexVertices(cx: number, cy: number, R: number): [number, number][] {
  const v: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const rad = (Math.PI / 180) * (-90 + 60 * i)
    v.push([
      qCoord(cx + R * Math.cos(rad)),
      qCoord(cy + R * Math.sin(rad)),
    ])
  }
  return v
}

function edgeKey(x1: number, y1: number, x2: number, y2: number) {
  const r = (n: number) => Math.round(n * 1000) / 1000
  const a = `${r(x1)},${r(y1)}`
  const b = `${r(x2)},${r(y2)}`
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

function honeycombGridBounds(R: number) {
  const margin = R * 2.5
  return {
    margin,
    qMin: Math.floor((-margin) / (R * Math.sqrt(3))) - 2,
    qMax: Math.ceil((VIEW_W + margin) / (R * Math.sqrt(3))) + 3,
    rMin: Math.floor((-margin) / (R * 1.5)) - 2,
    rMax: Math.ceil((VIEW_H + margin) / (R * 1.5)) + 3,
  }
}

/** ~1 in 9 cells — stable pattern from axial indices */
function isGoldenHexCell(qq: number, r: number): boolean {
  const a = Math.round(qq * 2)
  const b = r
  return ((a * 19 + b * 37 + (a ^ b) * 3) & 127) < 14
}

type GoldenHexCell = {
  points: string
  cx: number
  cy: number
  r: number
}

function buildGoldenHexCells(R: number): GoldenHexCell[] {
  const { margin, qMin, qMax, rMin, rMax } = honeycombGridBounds(R)
  const cells: GoldenHexCell[] = []

  for (let r = rMin; r <= rMax; r++) {
    const qOffset = r % 2 === 0 ? 0 : 0.5
    for (let q = qMin; q <= qMax; q++) {
      const qq = q + qOffset
      const { x: cx, y: cy } = axialToPixelFlatTop(qq, r, R)
      if (
        cx < -margin ||
        cx > VIEW_W + margin ||
        cy < -margin ||
        cy > VIEW_H + margin
      ) {
        continue
      }
      if (!isGoldenHexCell(qq, r)) continue

      const verts = flatTopHexVertices(cx, cy, R)
      cells.push({
        points: verts.map(([x, y]) => `${x},${y}`).join(" "),
        cx: qCoord(cx),
        cy: qCoord(cy),
        r: qCoord(R, 4),
      })
    }
  }

  return cells
}

function buildIsometricHoneycomb(R: number): { combinedD: string } {
  const edgeMap = new Map<string, [number, number, number, number]>()
  let combinedD = ""

  const { margin, qMin, qMax, rMin, rMax } = honeycombGridBounds(R)

  for (let r = rMin; r <= rMax; r++) {
    const qOffset = r % 2 === 0 ? 0 : 0.5
    for (let q = qMin; q <= qMax; q++) {
      const qq = q + qOffset
      const { x: cx, y: cy } = axialToPixelFlatTop(qq, r, R)
      if (
        cx < -margin ||
        cx > VIEW_W + margin ||
        cy < -margin ||
        cy > VIEW_H + margin
      ) {
        continue
      }

      const verts = flatTopHexVertices(cx, cy, R)
      for (let i = 0; i < 6; i++) {
        const a = verts[i]
        const b = verts[(i + 1) % 6]
        const k = edgeKey(a[0], a[1], b[0], b[1])
        if (!edgeMap.has(k)) {
          edgeMap.set(k, [a[0], a[1], b[0], b[1]])
        }
      }
      for (const vi of [0, 2, 4] as const) {
        combinedD += `M${cx},${cy}L${verts[vi][0]},${verts[vi][1]}`
      }
    }
  }

  for (const [, e] of edgeMap) {
    combinedD += `M${e[0]},${e[1]}L${e[2]},${e[3]}`
  }

  return { combinedD }
}

function lineColor(colorIntensity: number): string {
  if (colorIntensity <= 1.01) {
    return "#555555"
  }
  const t = Math.min(1, (colorIntensity - 1) * 2)
  const r = Math.round(88 + t * 52)
  const g = Math.round(84 + t * 40)
  const b = Math.round(78 + t * 30)
  return `rgb(${r},${g},${b})`
}

export function HexagonalBackground({
  className,
  absolute = true,
  density = HEX_BG_DEFAULTS.density,
  glowAmount = HEX_BG_DEFAULTS.glowAmount,
  colorIntensity = HEX_BG_DEFAULTS.colorIntensity,
  enableDrift = HEX_BG_DEFAULTS.enableDrift,
}: HexagonalBackgroundProps) {
  const reactId = useId()
  /** Valid in CSS @keyframes / class names and SVG ids (useId can contain chars unsafe in CSS) */
  const cssSafeId = `h${reactId.replace(/[^a-zA-Z0-9_-]/g, "_")}`

  const R = useMemo(() => {
    const d = Math.min(1.45, Math.max(0.55, density))
    return qCoord(15.5 / d, 4)
  }, [density])

  const { combinedD } = useMemo(() => buildIsometricHoneycomb(R), [R])
  const goldenHexCells = useMemo(() => buildGoldenHexCells(R), [R])

  const stroke = lineColor(colorIntensity)
  const strokeOpacity = 0.38 * Math.min(1.12, colorIntensity)
  const strokeW = qCoord(0.5 / (R / 15.5), 4)

  const showGlow = glowAmount > 0.02

  return (
    <div
      className={cn(
        "pointer-events-none overflow-hidden bg-[#141414]",
        absolute && "absolute inset-0",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#121212]" style={{ zIndex: 0 }} />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_45%,#1a1a1a_0%,#121212_55%,#101010_100%)]"
        style={{ zIndex: 1 }}
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_50%,transparent_50%,rgba(0,0,0,0.18)_100%)]"
        style={{ zIndex: 2 }}
      />

      {enableDrift ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `
@keyframes ${cssSafeId}-drift {
  0%, 100% { transform: translate3d(0, 0, 0); }
  25% { transform: translate3d(1px, -0.5px, 0); }
  50% { transform: translate3d(-0.5px, 0.75px, 0); }
  75% { transform: translate3d(0.5px, 0.25px, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .hex-bg-anim-${cssSafeId} { animation: none !important; }
}
`,
          }}
        />
      ) : null}
      <div
        className={cn(
          "absolute inset-0",
          enableDrift && "will-change-transform [transform:translateZ(0)]",
          enableDrift && `hex-bg-anim-${cssSafeId}`
        )}
        style={{
          zIndex: 3,
          animation: enableDrift
            ? `${cssSafeId}-drift 64s ease-in-out infinite`
            : undefined,
        }}
      >
        <svg
          className="h-full w-full min-h-full min-w-full [image-rendering:auto]"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid slice"
          shapeRendering="geometricPrecision"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {showGlow && (
              <filter
                id={`${cssSafeId}-lineglow`}
                x="-35%"
                y="-35%"
                width="170%"
                height="170%"
              >
                <feGaussianBlur
                  stdDeviation={0.85 + glowAmount * 6}
                  result="blur"
                />
                <feColorMatrix
                  type="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.4 0"
                  in="blur"
                  result="cm"
                />
                <feMerge>
                  <feMergeNode in="cm" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}

            {goldenHexCells.map((cell, i) => (
              <radialGradient
                key={`gold-grad-${i}`}
                id={`${cssSafeId}-gold-rad-${i}`}
                gradientUnits="userSpaceOnUse"
                cx={cell.cx}
                cy={cell.cy}
                r={qCoord(cell.r * 1.22)}
              >
                <stop offset="0%" stopColor="#fff6dc" stopOpacity="0.88" />
                <stop offset="38%" stopColor="#f7d84a" stopOpacity="0.62" />
                <stop offset="72%" stopColor="#e0b020" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#9a7208" stopOpacity="0.18" />
              </radialGradient>
            ))}
          </defs>

          {/*
            Paint the grey mesh FIRST, then gold on top. Previously the main <path> was last,
            so grid lines drew over the bright hex fills (lines looked “on top” of gold).
          */}
          {showGlow && (
            <path
              d={combinedD}
              fill="none"
              stroke={stroke}
              strokeOpacity={strokeOpacity * 0.45}
              strokeWidth={qCoord(strokeW * 1.2, 4)}
              strokeLinecap="butt"
              strokeLinejoin="miter"
              filter={`url(#${cssSafeId}-lineglow)`}
            />
          )}

          <path
            d={combinedD}
            fill="none"
            stroke={stroke}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeW}
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />

          {/* Gold layers above the mesh so spokes/edges don’t cover the highlight cells */}
          <g strokeLinejoin="round" fill="none">
            {goldenHexCells.map((cell, i) => (
              <polygon
                key={`gold-h2-${i}`}
                points={cell.points}
                stroke="rgba(255, 220, 130, 0.32)"
                strokeWidth={qCoord(strokeW * 5.5, 4)}
              />
            ))}
            {goldenHexCells.map((cell, i) => (
              <polygon
                key={`gold-h1-${i}`}
                points={cell.points}
                stroke="rgba(255, 235, 170, 0.48)"
                strokeWidth={qCoord(strokeW * 2.8, 4)}
              />
            ))}
          </g>
          <g strokeLinejoin="miter">
            {goldenHexCells.map((cell, i) => (
              <polygon
                key={i}
                points={cell.points}
                fill={`url(#${cssSafeId}-gold-rad-${i})`}
                stroke="rgba(255, 248, 200, 0.92)"
                strokeWidth={qCoord(strokeW * 1.35, 4)}
              />
            ))}
          </g>
        </svg>
      </div>

      <div
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0a0a0a]/45 to-transparent md:h-28"
        style={{ zIndex: 4 }}
      />
    </div>
  )
}
