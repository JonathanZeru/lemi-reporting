"use client"

import { ThemeProvider } from "@/utils/providers/theme-provider"
import { PrimeReactProvider } from "primereact/api"
import { AnimatePresence } from "framer-motion"
import { ModalProvider } from "@/utils/providers/modalProvider"
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from "react"
import AOS from "aos"
import "aos/dist/aos.css"
import "primereact/resources/themes/lara-light-cyan/theme.css"
import "bear-react-carousel/dist/index.css"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({
      disable: false,
      startEvent: "DOMContentLoaded",
      initClassName: "aos-init",
      animatedClassName: "aos-animate",
      useClassNames: false,
      disableMutationObserver: false,
      debounceDelay: 50,
      throttleDelay: 99,
      offset: 120,
      delay: 0,
      duration: 400,
      easing: "ease",
      once: false,
      mirror: false,
      anchorPlacement: "top-bottom",
    })
  }, [])

  return (
    <AnimatePresence mode="wait">
      <PrimeReactProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <ModalProvider>
            {children}
            <Toaster />
            {/* <FloatingLanguageButton /> */}
          </ModalProvider>
        </ThemeProvider>
      </PrimeReactProvider>
    </AnimatePresence>
  )
}

