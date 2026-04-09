"use client"

import * as THREE from "three"
import Image from "next/image"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Environment, MeshTransmissionMaterial, useTexture } from "@react-three/drei"
import { HERO_3D_READY_EVENT } from "@/lib/site-loader-done"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

const BG_TEXTURE_PATH = "/images/background.webp"

/**
 * Sharp photo + soft veil — CSS `.hero-bg-fade` and these planes stay aligned for the glass hero.
 */
/** Dark: scrim over photo — matches brand `--km-night` / `.dark` background. */
const HERO_VEIL_DARK_RGB = "#0D0C0D"
const HERO_VEIL_DARK_OPACITY = 0.52

/** Light: cool cream scrim (pairs with offwhite / page-bg). */
const HERO_VEIL_LIGHT_RGB = "#edf3f0"
const HERO_VEIL_LIGHT_OPACITY = 0.5

/** Brand tint (light). */
const HERO_VEIL_LIGHT_TINT_RGB = "#368393"
const HERO_VEIL_LIGHT_TINT_OPACITY = 0.09

/** Olive warmth (light). */
const HERO_VEIL_LIGHT_OLIVE_RGB = "#7c935d"
const HERO_VEIL_LIGHT_OLIVE_OPACITY = 0.05

/** Stable Canvas props — avoids R3F internal hooks fighting new object identity each render. */
const LOGO_ORTHO_CAMERA = {
  zoom: 110,
  position: [0, 0, 10] as [number, number, number],
}
const LOGO_CANVAS_GL = { alpha: true, antialias: true }
const LOGO_CANVAS_DPR: [number, number] = [1, 2]
/** Mobile hero: single DPR step avoids 2× retina fill-rate on the transmission pass. */
const LOGO_CANVAS_DPR_LITE: [number, number] = [1, 1]

/**
 * Same framing as CSS object-cover: scale-uniform + crop. Must run on the same
 * aspect as the visible ortho frustum (plane size ≈ viewport w/h), not a huge plane.
 */
function applyObjectCoverUV(map: THREE.Texture, viewAspect: number) {
  const img = map.image as HTMLImageElement | undefined
  if (!img?.width || !viewAspect) return

  map.wrapS = THREE.ClampToEdgeWrapping
  map.wrapT = THREE.ClampToEdgeWrapping

  const texAspect = img.width / img.height
  if (texAspect > viewAspect) {
    map.repeat.set(viewAspect / texAspect, 1)
    map.offset.set((1 - map.repeat.x) / 2, 0)
  } else {
    map.repeat.set(1, texAspect / viewAspect)
    map.offset.set(0, (1 - map.repeat.y) / 2)
  }
}

/** Flat honeycomb layout — merged into one mesh so MeshTransmissionMaterial runs once (avoids black FBO bugs). */
const HONEYCOMB_CELL_POSITIONS: [number, number, number][] = [
  [0, 0, 0],
  [0, 1.62, 0],
  [1.4, 0.81, 0],
  [1.4, -0.81, 0],
  [0, -1.62, 0],
  [-1.4, -0.81, 0],
  [-1.4, 0.81, 0],
]

const HEX_EULER = new THREE.Euler(Math.PI / 2, 0.5, Math.PI / 10)

function createBeveledHexPrism(radius: number, height: number) {
  const shape = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6
    const x = Math.cos(a) * radius
    const y = Math.sin(a) * radius
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.048,
    bevelSize: 0.04,
    bevelOffset: 0,
    bevelSegments: 4,
    steps: 1,
    curveSegments: 1,
  })

  geo.center()
  geo.rotateX(Math.PI / 2)
  return geo
}

function useMergedHoneycombGeometry() {
  return useMemo(() => {
    const base = createBeveledHexPrism(0.85, 0.6)
    const rotM = new THREE.Matrix4().makeRotationFromQuaternion(
      new THREE.Quaternion().setFromEuler(HEX_EULER)
    )
    const meshOffset = new THREE.Matrix4().makeTranslation(0, 0, 0.02)
    const parts: THREE.BufferGeometry[] = []

    for (const [px, py, pz] of HONEYCOMB_CELL_POSITIONS) {
      const g = base.clone()
      const cell = new THREE.Matrix4()
        .makeTranslation(px, py, pz)
        .multiply(rotM)
        .multiply(meshOffset)
      g.applyMatrix4(cell)
      parts.push(g)
    }

    const merged = mergeGeometries(parts, false)
    base.dispose()
    for (const p of parts) p.dispose()

    merged.computeVertexNormals()
    return merged
  }, [])
}

function TransmissionBackdrop() {
  const { resolvedTheme } = useTheme()
  const map = useTexture(BG_TEXTURE_PATH)
  const { width, height } = useThree((s) => s.viewport)
  const vw = width ?? 0
  const vh = height ?? 0
  /* Forced dark site: treat undefined (pre-hydration) as dark so veil matches CSS tokens. */
  const isDark = resolvedTheme !== "light"
  const veilColor = isDark ? HERO_VEIL_DARK_RGB : HERO_VEIL_LIGHT_RGB
  const veilOpacity = isDark ? HERO_VEIL_DARK_OPACITY : HERO_VEIL_LIGHT_OPACITY

  useEffect(() => {
    /* Three.js textures are configured in-place after load (drei useTexture). */
    // eslint-disable-next-line react-hooks/immutability -- THREE.Texture runtime config
    map.colorSpace = THREE.SRGBColorSpace
    if (vw > 0 && vh > 0) {
      applyObjectCoverUV(map, vw / vh)
    }
    map.needsUpdate = true
  }, [map, vw, vh])

  const planeW = Math.max(vw * 1.02, 1e-6)
  const planeH = Math.max(vh * 1.02, 1e-6)

  return (
    <group renderOrder={-10}>
      {/* Sharp photo — same as CSS layer */}
      <mesh position={[0, 0, -14]}>
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      {/* Palette veils — match CSS `.hero-bg-fade` (no blur) */}
      {!isDark && (
        <>
          <mesh position={[0, 0, -13.97]}>
            <planeGeometry args={[planeW, planeH]} />
            <meshBasicMaterial
              color={HERO_VEIL_LIGHT_OLIVE_RGB}
              toneMapped={false}
              transparent
              opacity={HERO_VEIL_LIGHT_OLIVE_OPACITY}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0, -13.94]}>
            <planeGeometry args={[planeW, planeH]} />
            <meshBasicMaterial
              color={HERO_VEIL_LIGHT_TINT_RGB}
              toneMapped={false}
              transparent
              opacity={HERO_VEIL_LIGHT_TINT_OPACITY}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
      <mesh position={[0, 0, -13.92]}>
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial
          color={veilColor}
          toneMapped={false}
          transparent
          opacity={veilOpacity}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export type Hero3DQuality = "full" | "lite"

function HoneycombMark({ quality = "full" }: { quality?: Hero3DQuality }) {
  const groupRef = useRef<THREE.Group>(null)
  const { pointer } = useThree()
  const geometry = useMergedHoneycombGeometry()
  const lite = quality === "lite"

  useFrame((_, delta) => {
    if (!groupRef.current) return

    groupRef.current.rotation.z += delta * (lite ? 0.28 : 0.4)

    const yawTarget = lite ? pointer.x * 0.1 : pointer.x * 0.14
    const pitchTarget = lite ? -pointer.y * 0.07 : -pointer.y * 0.1
    const lerp = lite ? 0.06 : 0.08

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      yawTarget,
      lerp
    )

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pitchTarget,
      lerp
    )
  })

  /** Slightly smaller on mobile (`lite`) so the hero glass mark doesn’t dominate narrow viewports. */
  const markScale = lite ? 0.6 : 0.9

  return (
    <group ref={groupRef} scale={markScale}>
      <mesh geometry={geometry}>
        <MeshTransmissionMaterial
          backside
          backsideThickness={lite ? 0.2 : 0.25}
          backsideEnvMapIntensity={lite ? 1.1 : 1.35}
          thickness={lite ? 0.85 : 1}
          transmission={1}
          roughness={lite ? 0.055 : 0.038}
          ior={1.52}
          chromaticAberration={lite ? 0 : 0.16}
          distortion={lite ? 0.03 : 0.05}
          distortionScale={lite ? 0.65 : 0.8}
          temporalDistortion={0}
          color="#ffffff"
          attenuationColor="#ffffff"
          attenuationDistance={lite ? 10 : 12}
          clearcoat={lite ? 0.85 : 1}
          clearcoatRoughness={lite ? 0.08 : 0.05}
          envMapIntensity={lite ? 1.55 : 2}
          samples={lite ? 4 : 12}
          resolution={lite ? 512 : 1024}
          anisotropicBlur={lite ? 0.03 : 0.07}
          iridescence={lite ? 0 : 0.35}
          iridescenceIOR={lite ? 1.3 : 1.4}
          iridescenceThicknessRange={lite ? [200, 400] : [140, 520]}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

let heroSceneReadyEventDispatched = false

/** Shared with mobile hero fallback — {@link SiteLoader} waits for this before dismissing. */
function signalHeroSceneReady() {
  if (typeof window === "undefined") return
  if (heroSceneReadyEventDispatched) return
  heroSceneReadyEventDispatched = true
  queueMicrotask(() => {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(HERO_3D_READY_EVENT))
    }, 0)
  })
}

/**
 * Renders only after the parent `<Suspense>` boundary resolves (textures, env HDR, etc.).
 * Dispatches {@link HERO_3D_READY_EVENT} in a macrotask so we never update during another
 * component’s render (avoids useProgress + Environment `setState` cross-talk).
 */
function HeroSceneReadySignal() {
  useEffect(() => {
    signalHeroSceneReady()
  }, [])
  return null
}

/** Tailwind `lg` — `full` quality above; below uses cheaper transmission + DPR. */
const HERO_WEBGL_MIN_WIDTH = "(min-width: 1024px)"

function Logo3DCanvas({ quality }: { quality: Hero3DQuality }) {
  const lite = quality === "lite"
  return (
    <Canvas
      orthographic
      camera={LOGO_ORTHO_CAMERA}
      dpr={lite ? LOGO_CANVAS_DPR_LITE : LOGO_CANVAS_DPR}
      gl={{
        ...LOGO_CANVAS_GL,
        powerPreference: lite ? ("low-power" as const) : ("default" as const),
      }}
      resize={{ debounce: CANVAS_RESIZE }}
      className="!h-full !w-full"
    >
      <Suspense fallback={null}>
        <TransmissionBackdrop />
        <ambientLight intensity={lite ? 0.6 : 0.55} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={lite ? 1.05 : 1.2}
          color="#ffffff"
        />
        <directionalLight
          position={[-10, -5, 5]}
          intensity={lite ? 0.65 : 0.75}
          color="#368393"
        />
        <directionalLight
          position={[0, 0, 10]}
          intensity={lite ? 0.5 : 0.55}
          color="#7c935d"
        />
        <Environment preset="city" />
        <HoneycombMark quality={quality} />
        <HeroSceneReadySignal />
      </Suspense>
    </Canvas>
  )
}

/** Debounce canvas size updates — iOS Safari fires noisy resize when the URL bar shows/hides. */
const CANVAS_RESIZE: { scroll: number; resize: number } = {
  scroll: 0,
  resize: 120,
}

export function Logo3DOverlay() {
  const [tier, setTier] = useState<"desktop" | "mobile" | null>(null)

  useLayoutEffect(() => {
    const mq = window.matchMedia(HERO_WEBGL_MIN_WIDTH)
    const apply = () => {
      setTier(mq.matches ? "desktop" : "mobile")
    }
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  if (tier === null) {
    return null
  }
  return (
    <Logo3DCanvas quality={tier === "mobile" ? "lite" : "full"} />
  )
}

export default function ImageWith3DLogo() {
  return (
    <section className="relative h-[100lvh] min-h-[100lvh] w-screen overflow-hidden lg:h-screen lg:min-h-0">
      {/* Sharp photo — detail stays crisp; “glass” comes from the veil, not blur */}
      <div className="absolute inset-0 bg-surface-2">
        <Image
          src={BG_TEXTURE_PATH}
          alt="Kinshasa Mall"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Brand palette fade — tune `.hero-bg-fade` in globals.css + HERO_VEIL_* constants */}
      <div
        className="hero-bg-fade pointer-events-none absolute inset-0 dark:bg-background/52"
        aria-hidden
      />

      {/* 3D WebGL Layer (transparent where no geometry — reveals background) */}
      <div className="absolute inset-0 z-10">
        <Logo3DOverlay />
      </div>

      {/* Headline + supporting line: above the canvas so type sits on top of the 3D object */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 pt-[max(4.5rem,10lvh)] lg:pt-[max(4.5rem,10svh)]">
        <h1 className="font-heading relative z-10 max-w-5xl text-center text-[clamp(3rem,8vw,6rem)] font-bold uppercase leading-[1.05] tracking-[0.04em] text-balance">
          <span className="block text-[var(--km-teal-deep)] dark:text-[var(--km-offwhite)] [text-shadow:0_4px_24px_rgba(255,255,255,0.8)] dark:[text-shadow:0_4px_32px_rgba(0,0,0,0.5)]">
            Kinshasa Mall
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-center text-sm md:text-base font-medium uppercase tracking-[0.15em] text-[var(--km-teal)] dark:text-[var(--km-soft)] text-balance opacity-90 [text-shadow:0_1px_4px_rgba(255,255,255,0.8)] dark:[text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
          Destination for dining, entertainment & shopping
        </p>
      </div>
    </section>
  )
}