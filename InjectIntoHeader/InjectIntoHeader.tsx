import { useMFContext } from "components/MFHelpers"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useWindowSize } from "usehooks-ts"
import {
  fetchInjectionInstructions,
  findTargetElement,
  createInjectionContainer,
  injectContainer,
} from "./ElementSelector"
import { InjectionInstruction } from "./ElementSelectorTypes"

const InjectIntoHeader = ({
  desktop,
  mobile,
  dm_desktop,
  dm_mobile,
  imageStyles,
}: {
  desktop: string
  mobile: string
  dm_desktop: string
  dm_mobile: string
  imageStyles: React.CSSProperties
}) => {
  const { width } = useWindowSize()
  const { colorMode } = useMFContext()
  const [headerimage, setHeaderimage] = useState<string>(
    colorMode === "dark" ? dm_desktop : desktop
  )
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    const newIsMobile = width < 768
    const newIsDarkMode = colorMode === "dark"

    let newHeaderImage: string
    if (newIsDarkMode) {
      newHeaderImage = newIsMobile ? dm_mobile : dm_desktop
    } else {
      newHeaderImage = newIsMobile ? mobile : desktop
    }

    // Only update if breakpoint or color mode actually changed
    if (newIsMobile !== isMobile || newIsDarkMode !== isDarkMode) {
      setIsMobile(newIsMobile)
      setIsDarkMode(newIsDarkMode)
      setHeaderimage(newHeaderImage)
    }
  }, [width, colorMode, mobile, desktop, dm_mobile, dm_desktop])

  return (
    <Injector
      content={
        <img
          src={headerimage + "?v=" + new Date().getTime()}
          style={imageStyles}
        />
      }
      instructionUrl={
        // If injection fails because frontend was changed adjust the instructions in this file
        "https://interaktiv.tagesanzeiger.ch/HeaderInjection/injection-instructions.json"
      }
    />
  )
}

const Injector = ({
  content,
  instructionUrl,
  centerText = true,
}: {
  content?: React.ReactNode
  instructionUrl?: string
  centerText?: boolean
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerReady, setContainerReady] = useState(false)
  const [instructions, setInstructions] = useState<InjectionInstruction | null>(
    null
  )

  useEffect(() => {
    const setupInjection = async () => {
      console.log("InjectIntoHeader - Loading injection instructions")

      // Load instructions from URL - fail gracefully if not available
      if (!instructionUrl) {
        console.log("No instruction URL provided, skipping injection")
        return
      }

      const loadedInstructions = await fetchInjectionInstructions(
        instructionUrl
      )

      if (!loadedInstructions) {
        console.log("Failed to load instructions, skipping injection")
        return
      }

      setInstructions(loadedInstructions)

      // Find target element using loaded instructions
      const { element: targetElement, strategy } =
        findTargetElement(loadedInstructions)

      if (!targetElement || !strategy) {
        console.error("Failed to find target element with any strategy")
        return
      }

      console.log(
        `Successfully found target element using strategy: ${strategy.name}`
      )

      // Create and configure container
      const container = createInjectionContainer()

      // Apply default container styles
      container.style.gridColumn = "1 / -1"

      // Apply text centering if configured
      if (centerText) {
        // Get element to center from instructions or default to h2
        const elementToCenter = strategy.injection.elementToCenter || "h2"
        const spansInElementToCenter = targetElement.querySelectorAll("span")
        console.log(spansInElementToCenter)
        if (spansInElementToCenter.length > 0) {
          spansInElementToCenter[0].style.display = "inline-block"
        }

        // Find the element to center within the target element
        const titleElement = targetElement.querySelector(elementToCenter)
        if (titleElement) {
          // Center the title element
          ;(titleElement as HTMLElement).style.textAlign = "center"
          ;(titleElement as HTMLElement).style.display = "flex"
          ;(titleElement as HTMLElement).style.justifyContent = "center"
          ;(titleElement as HTMLElement).style.flexWrap = "wrap"
        }

        // Center any p tags in the header element
        targetElement.querySelectorAll("p").forEach((p) => {
          p.style.textAlign = "center"
        })
      }

      // Inject container into DOM
      const injectionSuccess = injectContainer(
        container,
        targetElement,
        strategy
      )

      if (injectionSuccess) {
        containerRef.current = container
        setContainerReady(true)
        console.log("Container injected and ready")
      } else {
        console.error("Failed to inject container")
      }
    }

    setupInjection()

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.remove()
        containerRef.current = null
      }
      setContainerReady(false)
    }
  }, [instructionUrl, centerText])

  // Use portal to render React content into the injected container
  return containerReady && containerRef.current && content
    ? createPortal(content, containerRef.current)
    : null
}

export default InjectIntoHeader
