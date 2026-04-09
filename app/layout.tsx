import type { Metadata } from "next";
import { JetBrains_Mono, Inter, Space_Grotesk, Syne } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import PremiumHeader from "@/components/premium-header";
import { SiteLoader } from "@/components/site-loader";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollRestoration } from "@/components/scroll-restoration";
import { LiquidGlassFilter } from "@/components/ui/liquid-glass-filter";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";

/** Bold display — modern retail / mall branding. */
const fontDisplay = Space_Grotesk({
  variable: "--font-mall-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

/** Hero wordmark — editorial, high-impact (Syne). */
const fontHeroWordmark = Syne({
  variable: "--font-mall-wordmark",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

/** Geometric sans — body, navigation, UI. */
const fontSans = Inter({
  variable: "--font-mall-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mall-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kinshasa Mall",
  description: "Shopping, dining & experiences — Kinshasa Mall",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontHeroWordmark.variable} ${fontMono.variable} h-full antialiased dark`}
    >
      <head>
        <Script
          id="scroll-restoration-inline"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if('scrollRestoration'in history)history.scrollRestoration='manual';var h=location.hash.slice(1);if(h)return;var r=document.documentElement,b=document.body;r.style.scrollBehavior='auto';b.style.scrollBehavior='auto';r.scrollTop=0;b.scrollTop=0;window.scrollTo(0,0);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${fontSans.className} min-h-full flex flex-col bg-background`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <ScrollRestoration />
          <LiquidGlassFilter />
          <PremiumHeader />
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
          <SiteLoader />
        </ThemeProvider>
      </body>
    </html>
  );
}
