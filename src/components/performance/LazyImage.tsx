import { useState, useEffect, useRef, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  blur?: boolean;
  className?: string;
}

export function LazyImage({
  src,
  alt,
  placeholderSrc,
  threshold = 0.1,
  rootMargin = "50px",
  onLoad,
  onError,
  blur = true,
  className,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(placeholderSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [src, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        "transition-opacity duration-300",
        !isLoaded && blur && "blur-sm",
        isLoaded ? "opacity-100" : "opacity-50",
        className
      )}
      loading="lazy"
      {...props}
    />
  );
}

interface ProgressiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  placeholderSrc: string;
  alt: string;
  className?: string;
}

export function ProgressiveImage({
  src,
  placeholderSrc,
  alt,
  className,
  ...props
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
  }, [src]);

  return (
    <div className="relative">
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-all duration-500",
          isLoading && "blur-sm scale-105",
          className
        )}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
    </div>
  );
}

interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  className?: string;
}

export function ResponsiveImage({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  lazy = true,
  className,
  ...props
}: ResponsiveImageProps) {
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      className={className}
      {...props}
    />
  );
}

interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
  className?: string;
}

export function AvatarImage({
  src,
  alt,
  size = "md",
  fallback,
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground",
          sizeClasses[size],
          className
        )}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn("rounded-full object-cover", sizeClasses[size], className)}
    />
  );
}

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
      {...props}
    />
  );
}

interface BackgroundImageProps {
  src: string;
  children?: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export function BackgroundImage({
  src,
  children,
  className,
  overlay = false,
  overlayOpacity = 0.5,
}: BackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoaded && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
            style={{ backgroundImage: `url(${src})` }}
          />
          {overlay && (
            <div
              className="absolute inset-0 bg-background"
              style={{ opacity: overlayOpacity }}
            />
          )}
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface ImageGalleryProps {
  images: Array<{ src: string; alt: string; thumbnail?: string }>;
  columns?: number;
  gap?: number;
  onImageClick?: (index: number) => void;
  className?: string;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 16,
  onImageClick,
  className,
}: ImageGalleryProps) {
  return (
    <div
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onImageClick?.(index)}
          className="relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
        >
          <LazyImage
            src={image.thumbnail || image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}

export function useImagePreload(sources: string[]) {
  useEffect(() => {
    sources.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [sources]);
}

export function useImageCache() {
  const cache = useRef(new Map<string, string>());

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (cache.current.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        cache.current.set(src, src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const preloadImages = (sources: string[]): Promise<void[]> => {
    return Promise.all(sources.map((src) => preloadImage(src)));
  };

  const isCached = (src: string): boolean => {
    return cache.current.has(src);
  };

  const clearCache = () => {
    cache.current.clear();
  };

  return {
    preloadImage,
    preloadImages,
    isCached,
    clearCache,
  };
}

export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpeg" | "png";
  } = {}
): string {
  const { width, height, quality = 80, format = "webp" } = options;

  const params = new URLSearchParams();
  if (width) params.set("w", width.toString());
  if (height) params.set("h", height.toString());
  params.set("q", quality.toString());
  params.set("f", format);

  return `${url}?${params.toString()}`;
}
