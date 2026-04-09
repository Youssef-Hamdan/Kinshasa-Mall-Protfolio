import {
  type HTMLMotionProps,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react"
import type React from "react"
import type { Variants } from "motion/react"

type TriggerMode = "root" | "self"

type TimelineContentProps = {
  children?: React.ReactNode
  animationNum: number
  className?: string
  /** When `trigger` is `"root"`, visibility follows this element (e.g. `<main>`). Ignored for `"self"`. */
  timelineRef?: React.RefObject<HTMLElement | null>
  as?: keyof HTMLElementTagNameMap
  customVariants?: Variants
  once?: boolean
  /**
   * `"root"` — all instances share visibility of `timelineRef` (stagger via `animationNum`).
   * `"self"` — each block animates when it scrolls into view (section-to-section).
   */
  trigger?: TriggerMode
  /** Passed to `whileInView` when `trigger` is `"self"`. */
  viewport?: HTMLMotionProps<"div">["viewport"]
} & HTMLMotionProps<"div">

const defaultSequenceVariants: Variants = {
  visible: (i: number) => ({
    filter: "blur(0px)",
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.5,
      duration: 0.5,
    },
  }),
  hidden: {
    filter: "blur(20px)",
    y: 0,
    opacity: 0,
  },
}

function TimelineAnimationRoot({
  children,
  animationNum,
  timelineRef,
  className,
  as,
  customVariants,
  once = true,
  ...props
}: Omit<TimelineContentProps, "trigger" | "viewport"> & {
  timelineRef: React.RefObject<HTMLElement | null>
}) {
  const sequenceVariants = customVariants ?? defaultSequenceVariants
  const isInView = useInView(timelineRef, { once })
  const reduceMotion = useReducedMotion()
  const MotionComponent = motion[as ?? "div"] as (typeof motion)["div"]

  return (
    <MotionComponent
      initial={reduceMotion ? "visible" : "hidden"}
      animate={reduceMotion || isInView ? "visible" : "hidden"}
      custom={animationNum}
      variants={sequenceVariants}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

function TimelineAnimationSelf({
  children,
  animationNum,
  className,
  as,
  customVariants,
  once = true,
  viewport,
  ...props
}: Omit<TimelineContentProps, "trigger" | "timelineRef">) {
  const sequenceVariants = customVariants ?? defaultSequenceVariants
  const reduceMotion = useReducedMotion()
  const MotionComponent = motion[as ?? "div"] as (typeof motion)["div"]

  /**
   * Use `amount: "some"` (threshold 0), not a numeric threshold like 0.18.
   * A numeric threshold caps intersectionRatio; for very tall sections the ratio
   * may never reach that value, so the observer never fires and content stays hidden.
   */
  const defaultViewport = {
    once,
    amount: "some" as const,
    margin: "0px 0px -8% 0px",
  } as const

  return (
    <MotionComponent
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      animate={reduceMotion ? "visible" : undefined}
      viewport={{ ...defaultViewport, ...viewport }}
      custom={animationNum}
      variants={sequenceVariants}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

export const TimelineAnimation = ({
  trigger = "root",
  timelineRef,
  viewport,
  ...rest
}: TimelineContentProps) => {
  if (trigger === "self") {
    return (
      <TimelineAnimationSelf
        {...(rest as Omit<TimelineContentProps, "trigger" | "timelineRef">)}
        viewport={viewport}
      />
    )
  }

  if (!timelineRef) {
    throw new Error(
      'TimelineAnimation: `timelineRef` is required when `trigger` is "root"'
    )
  }

  return (
    <TimelineAnimationRoot
      {...(rest as Omit<TimelineContentProps, "trigger" | "viewport">)}
      timelineRef={timelineRef}
    />
  )
}
