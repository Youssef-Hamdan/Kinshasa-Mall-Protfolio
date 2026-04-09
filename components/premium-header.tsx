"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { LanguageToggle } from "@/components/language-toggle"
import { useKmLocale, type LocaleCode } from "@/hooks/use-km-locale"
import { scrollToHashId } from "@/lib/hash-scroll"
import { cn } from "@/lib/utils"

/** Section anchors on the home page (hash navigation). IDs are stable; labels follow locale. */
export const PREMIUM_NAV_SECTIONS = [
  { id: "categories" },
  { id: "projects" },
  { id: "about-us" },
  { id: "feedback" },
] as const

type NavSectionId = (typeof PREMIUM_NAV_SECTIONS)[number]["id"]

const COPY: Record<
  LocaleCode,
  {
    navbar: {
      menuOpen: string
      menuClosed: string
      nav: Record<NavSectionId, string>
    }
  }
> = {
  en: {
    navbar: {
      menuOpen: "Close menu",
      menuClosed: "Open menu",
      nav: {
        categories: "Categories",
        projects: "Projects",
        "about-us": "About Us",
        feedback: "Feedback",
      },
    },
  },
  fr: {
    navbar: {
      menuOpen: "Fermer le menu",
      menuClosed: "Ouvrir le menu",
      nav: {
        categories: "Catégories",
        projects: "Projets",
        "about-us": "À propos",
        feedback: "Avis",
      },
    },
  },
}

const LOGO_LIGHT = "/images/logo2.webp"
const LOGO_DARK = "/images/logo1.webp"

export default function PremiumHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const locale = useKmLocale()
  const t = COPY[locale]
  const scrollRaf = useRef<number | null>(null)

  const navItems = PREMIUM_NAV_SECTIONS.map((s) => ({
    label: t.navbar.nav[s.id],
    href: `#${s.id}`,
  }))

  const desktopNavLinkClass = cn(
    "text-sm font-semibold tracking-wide transition-colors dark:font-medium",
    isScrolled
      ? "text-foreground/88 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
      : "text-foreground/95 [text-shadow:0_1px_2px_rgba(250,252,251,0.95),0_0_20px_rgba(250,252,251,0.75)] hover:text-foreground dark:text-muted-foreground dark:[text-shadow:none] dark:hover:text-foreground"
  )

  const handleHashNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (!href.startsWith("#")) return
    setMobileMenuOpen(false)
    if (pathname !== "/") return
    e.preventDefault()
    const id = href.slice(1)
    scrollToHashId(id)
    window.history.replaceState(null, "", href)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRaf.current != null) return
      scrollRaf.current = requestAnimationFrame(() => {
        scrollRaf.current = null
        setIsScrolled(window.scrollY > 50)
      })
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollRaf.current != null) cancelAnimationFrame(scrollRaf.current)
    }
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileMenuOpen(false))
    return () => cancelAnimationFrame(id)
  }, [pathname])

  // Deep link to /#section after hydration (Next does not always scroll to hash on its own).
  useEffect(() => {
    if (pathname !== "/") return
    const id = window.location.hash.slice(1)
    if (!id) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToHashId(id))
    })
  }, [pathname])

  return (
    <header
      data-premium-header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled
          ? "border-b border-border/25 bg-white/88 pb-4 pt-[max(1rem,env(safe-area-inset-top))] shadow-[0_1px_0_0_color-mix(in_srgb,var(--km-teal)_12%,transparent),0_8px_32px_-12px_color-mix(in_srgb,var(--foreground)_8%,transparent)] backdrop-blur-xl backdrop-saturate-150 dark:border-border/10 dark:bg-background/90 dark:shadow-none max-md:bg-white/92 max-md:backdrop-blur-lg dark:max-md:bg-background/95 dark:max-md:backdrop-blur-sm md:dark:backdrop-blur-2xl md:dark:bg-background/70"
          : "bg-transparent pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] md:pb-8 md:pt-[max(2rem,env(safe-area-inset-top))]"
      }`}
    >
      <div className="container relative mx-auto flex w-full items-center justify-between pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] md:pl-[max(3rem,env(safe-area-inset-left))] md:pr-[max(3rem,env(safe-area-inset-right))]">
        <div className="relative z-[60] flex min-w-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label={mobileMenuOpen ? t.navbar.menuOpen : t.navbar.menuClosed}
            aria-expanded={mobileMenuOpen}
            className="-ml-1 inline-flex size-10 shrink-0 items-center justify-center rounded-md text-foreground [filter:drop-shadow(0_1px_8px_rgba(250,252,251,0.95))] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:[filter:none] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="size-6" strokeWidth={2} aria-hidden />
            ) : (
              <Menu className="size-6" strokeWidth={2} aria-hidden />
            )}
          </button>
          <Link
            href="/"
            className="relative shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={(e) => {
              setMobileMenuOpen(false)
              if (pathname === "/") {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
                window.history.replaceState(null, "", "/")
              }
            }}
          >
            <Image
              src={LOGO_LIGHT}
              alt="Kinshasa Mall"
              width={200}
              height={52}
              className="h-12 w-auto md:h-20 dark:hidden"
              priority
            />
            <Image
              src={LOGO_DARK}
              alt="Kinshasa Mall"
              width={200}
              height={52}
              className="hidden h-12 w-auto md:h-20 dark:block"
              priority
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item: { label: string; href: string }) =>
            item.href.startsWith("#") ? (
              <a
                key={item.label}
                href={pathname === "/" ? item.href : `/${item.href}`}
                onClick={(e) => handleHashNavClick(e, item.href)}
                className={desktopNavLinkClass}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={desktopNavLinkClass}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LanguageToggle />
        </div>

        <div className="relative z-[60] md:hidden">
          <LanguageToggle />
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 left-0 z-40 flex h-[100svh] min-h-[100svh] w-full flex-col items-center justify-center gap-8 bg-background pt-[env(safe-area-inset-top)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
            >
              {navItems.map(
                (item: { label: string; href: string }, i: number) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.1,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {item.href.startsWith("#") ? (
                      <a
                        href={
                          pathname === "/" ? item.href : `/${item.href}`
                        }
                        className="text-foreground text-3xl font-light tracking-tight transition-colors hover:text-muted-foreground sm:text-4xl"
                        onClick={(e) => handleHashNavClick(e, item.href)}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-foreground text-3xl font-light tracking-tight transition-colors hover:text-muted-foreground sm:text-4xl"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </motion.div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
