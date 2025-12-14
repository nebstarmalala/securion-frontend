import { useState, useEffect, useRef, ImgHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  alt: string
  fallback?: string
  aspectRatio?: "square" | "video" | "portrait" | "auto"
  className?: string
  containerClassName?: string
  skeletonClassName?: string
}

/**
 * Lazy loading image component with intersection observer
 * Only loads images when they enter the viewport
 */
export function LazyImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  aspectRatio = "auto",
  className,
  containerClassName,
  skeletonClassName,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src)
            observer.disconnect()
          }
        })
      },
      {
        threshold: 0.01,
        rootMargin: "50px", // Start loading 50px before entering viewport
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [src])

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        aspectRatio !== "auto" && aspectRatioClass[aspectRatio],
        containerClassName
      )}
    >
      {isLoading && (
        <Skeleton className={cn("absolute inset-0", skeletonClassName)} />
      )}
      <img
        ref={imgRef}
        src={hasError ? fallback : imageSrc || fallback}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          aspectRatio === "auto" && "w-full h-auto",
          className
        )}
        {...props}
      />
    </div>
  )
}

interface LazyBackgroundImageProps {
  src: string
  fallback?: string
  className?: string
  children?: React.ReactNode
}

/**
 * Lazy loading background image component
 */
export function LazyBackgroundImage({
  src,
  fallback = "/placeholder.svg",
  className,
  children,
}: LazyBackgroundImageProps) {
  const [backgroundSrc, setBackgroundSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Preload the image
            const img = new Image()
            img.src = src
            img.onload = () => {
              setBackgroundSrc(src)
              setIsLoading(false)
            }
            img.onerror = () => {
              setHasError(true)
              setBackgroundSrc(fallback)
              setIsLoading(false)
            }
            observer.disconnect()
          }
        })
      },
      {
        threshold: 0.01,
        rootMargin: "50px",
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [src, fallback])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        className
      )}
      style={{
        backgroundImage: backgroundSrc ? `url(${backgroundSrc})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      {children}
    </div>
  )
}
