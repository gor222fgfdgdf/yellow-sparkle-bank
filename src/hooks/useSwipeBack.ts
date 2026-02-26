import { useRef, useEffect, useCallback } from "react";

interface UseSwipeBackOptions {
  onBack: () => void;
  threshold?: number;
  edgeWidth?: number;
  enabled?: boolean;
}

export const useSwipeBack = ({ onBack, threshold = 80, edgeWidth = 40, enabled = true }: UseSwipeBackOptions) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    if (touch.clientX <= edgeWidth) {
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      isDragging.current = true;
    }
  }, [enabled, edgeWidth]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !enabled) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX.current;
    const deltaY = Math.abs(touch.clientY - startY.current);
    isDragging.current = false;
    if (deltaX > threshold && deltaY < deltaX * 0.7) {
      onBack();
    }
  }, [enabled, threshold, onBack]);

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchEnd]);
};
