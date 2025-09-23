import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type OptimizedListParams = [
  /**
   * start index
   */
  number,
  /**
   * end index
   */
  number,
  /**
   * is scrolled to start
   */
  boolean,
  /**
   * is scrolled to end
   */
  boolean,
  /**
   * client width/height of element
   */
  number,
];

const DELTA = 5;

const getStartAndEnd = (
  containerEl: Element | null,
  property: "scrollTop" | "scrollLeft",
  cellSize: number
): OptimizedListParams | null => {
  if (!containerEl) {
    return null;
  }

  const el = containerEl as HTMLElement;
  const scrollValue = property === "scrollLeft" ? el.scrollLeft : el.scrollTop;
  const maxScrollValue =
    property === "scrollLeft" ? el.scrollWidth : el.scrollHeight;
  const fullValue =
    property === "scrollLeft" ? el.clientWidth : el.clientHeight;

  // Compute visible range
  const firstIndex = Math.max(0, Math.floor(scrollValue / cellSize));
  const visibleCount = Math.max(1, Math.ceil(fullValue / cellSize));
  // Dynamic overscan: ~1/2 viewport, clamped
  const overscan = Math.min(100, Math.max(10, Math.ceil(visibleCount * 0.5)));
  const lastIndex = Math.floor((scrollValue + fullValue) / cellSize) + overscan;

  const isStartOfScroll = scrollValue < DELTA;
  const isEndOfScroll = scrollValue + fullValue > maxScrollValue - DELTA;

  return [firstIndex, lastIndex, isStartOfScroll, isEndOfScroll, fullValue];
};

export const useOptimizedList = (
  containerRef: RefObject<Element>,
  property: "scrollTop" | "scrollLeft",
  cellSize: number
) => {
  const [indexes, setIndexes] = useState<OptimizedListParams | null>(() =>
    getStartAndEnd(containerRef.current, property, cellSize)
  );

  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef(false);

  const update = useMemo(() => {
    const fn = () => {
      pendingRef.current = false;
      const next = getStartAndEnd(containerRef.current, property, cellSize);
      setIndexes(prev => {
        const changed =
          !prev || !next || next.some((v, i) => (prev ? prev[i] !== v : true));
        return changed ? next : prev;
      });
      rafRef.current = null;
    };
    return fn;
  }, [cellSize, containerRef, property]);

  useEffect(() => {
    const el = containerRef.current as HTMLElement | null;
    if (!el) {
      return undefined;
    }

    // Initial compute
    setIndexes(getStartAndEnd(el, property, cellSize));

    const onScroll = () => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      rafRef.current = requestAnimationFrame(update);
    };

    // Observe size changes as well (affects visible count)
    const resizeObserver = new ResizeObserver(() => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      rafRef.current = requestAnimationFrame(update);
    });
    resizeObserver.observe(el);

    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      pendingRef.current = false;
    };
  }, [cellSize, containerRef, property, update]);

  return indexes;
};
