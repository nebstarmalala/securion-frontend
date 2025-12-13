import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import { X, Check } from "lucide-react";

interface SwipeAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "destructive" | "success";
}

interface SwipeableItemProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
}

export function SwipeableItem({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
}: SwipeableItemProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = offset;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - startXRef.current;
    const newOffset = currentXRef.current + deltaX;

    // Limit swipe distance
    const maxLeftSwipe = leftActions.length > 0 ? -threshold * leftActions.length : 0;
    const maxRightSwipe = rightActions.length > 0 ? threshold * rightActions.length : 0;

    setOffset(Math.max(maxLeftSwipe, Math.min(maxRightSwipe, newOffset)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Snap to action positions or reset
    if (Math.abs(offset) < threshold / 2) {
      setOffset(0);
    } else if (offset > 0 && rightActions.length > 0) {
      setOffset(threshold * rightActions.length);
    } else if (offset < 0 && leftActions.length > 0) {
      setOffset(-threshold * leftActions.length);
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    setOffset(0);
  };

  const getVariantClasses = (variant?: SwipeAction["variant"]) => {
    switch (variant) {
      case "destructive":
        return "bg-red-500 text-white";
      case "success":
        return "bg-green-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex">
          {leftActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4",
                  getVariantClasses(action.variant)
                )}
                style={{ width: threshold }}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex">
          {rightActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4",
                  getVariantClasses(action.variant)
                )}
                style={{ width: threshold }}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div
        className={cn("bg-background transition-transform", isDragging && "transition-none")}
        style={{
          transform: `translateX(${offset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      setCanPull(true);
      startYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canPull || isRefreshing) return;

    const deltaY = e.touches[0].clientY - startYRef.current;
    if (deltaY > 0) {
      setPullDistance(Math.min(deltaY, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (!canPull) return;

    setCanPull(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const rotation = (pullDistance / threshold) * 360;
  const opacity = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto h-full", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center transition-opacity"
        style={{
          opacity,
          transform: `translateX(-50%) translateY(${Math.min(pullDistance - 40, 20)}px)`,
        }}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full bg-primary flex items-center justify-center",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <svg
            className="w-5 h-5 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: isRefreshing ? `translateY(${threshold}px)` : `translateY(${pullDistance}px)`,
          transition: isRefreshing || !canPull ? "transform 0.3s" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface LongPressProps {
  onLongPress: () => void;
  onPress?: () => void;
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

export function LongPress({
  onLongPress,
  onPress,
  delay = 500,
  children,
  className,
}: LongPressProps) {
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const longPressTriggeredRef = useRef(false);

  const start = useCallback(() => {
    setPressing(true);
    longPressTriggeredRef.current = false;

    timerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      onLongPress();
      // Haptic feedback on mobile
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(() => {
    setPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const handleClick = useCallback(() => {
    clear();
    if (!longPressTriggeredRef.current && onPress) {
      onPress();
    }
  }, [onPress, clear]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "touch-none select-none transition-transform active:scale-95",
        pressing && "scale-95",
        className
      )}
      onTouchStart={start}
      onTouchEnd={handleClick}
      onTouchCancel={clear}
      onMouseDown={start}
      onMouseUp={handleClick}
      onMouseLeave={clear}
    >
      {children}
    </div>
  );
}

interface TouchableOpacityProps {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  activeOpacity?: number;
}

export function TouchableOpacity({
  onPress,
  disabled = false,
  children,
  className,
  activeOpacity = 0.6,
}: TouchableOpacityProps) {
  const [pressing, setPressing] = useState(false);

  const handleTouchStart = () => {
    if (!disabled) setPressing(true);
  };

  const handleTouchEnd = () => {
    setPressing(false);
    if (!disabled) onPress();
  };

  return (
    <div
      className={cn(
        "touch-none select-none transition-opacity",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        opacity: pressing ? activeOpacity : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => setPressing(false)}
    >
      {children}
    </div>
  );
}

interface TouchFeedbackProps {
  children: React.ReactNode;
  className?: string;
}

export function TouchFeedback({ children, className }: TouchFeedbackProps) {
  const [pressing, setPressing] = useState(false);

  return (
    <div
      className={cn(
        "touch-none select-none transition-all active:scale-95",
        pressing && "bg-muted scale-95",
        className
      )}
      onTouchStart={() => setPressing(true)}
      onTouchEnd={() => setPressing(false)}
      onTouchCancel={() => setPressing(false)}
    >
      {children}
    </div>
  );
}

interface TouchDragProps {
  onDragEnd: (deltaX: number, deltaY: number) => void;
  children: React.ReactNode;
  className?: string;
}

export function TouchDrag({ onDragEnd, children, className }: TouchDragProps) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    startPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;

    const deltaX = e.touches[0].clientX - startPos.current.x;
    const deltaY = e.touches[0].clientY - startPos.current.y;

    setOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    setDragging(false);
    onDragEnd(offset.x, offset.y);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      className={cn("touch-none", className)}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: dragging ? "none" : "transform 0.2s",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </div>
  );
}

export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const light = useCallback(() => vibrate(10), [vibrate]);
  const medium = useCallback(() => vibrate(50), [vibrate]);
  const heavy = useCallback(() => vibrate(100), [vibrate]);
  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate]);
  const error = useCallback(() => vibrate([50, 100, 50]), [vibrate]);

  return {
    vibrate,
    light,
    medium,
    heavy,
    success,
    error,
  };
}
