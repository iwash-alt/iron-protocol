import React, { useRef, useState, useCallback, useEffect } from 'react';
import { colors, spacing } from '@/shared/theme/tokens';
import { S } from '@/shared/theme/styles';

interface ChartCarouselProps {
  children: React.ReactNode[];
  titles: string[];
}

export function ChartCarousel({ children, titles }: ChartCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const childWidth = el.scrollWidth / children.length;
    const idx = Math.round(scrollLeft / childWidth);
    setActiveIndex(Math.min(idx, children.length - 1));
  }, [children.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (children.length === 0) return null;

  return (
    <div style={S.chartBox}>
      {/* Scrollable chart container */}
      <div ref={scrollRef} style={styles.scrollContainer}>
        {children.map((child, i) => (
          <div key={titles[i] ?? i} style={styles.slide}>
            {child}
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {children.length > 1 && (
        <div style={styles.dots}>
          {children.map((_, i) => (
            <span
              key={i}
              style={{
                ...styles.dot,
                ...(i === activeIndex ? styles.dotActive : {}),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  scrollContainer: {
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    gap: 0,
  },
  slide: {
    flex: '0 0 100%',
    scrollSnapAlign: 'start',
    minWidth: 0,
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    transition: 'all 0.2s',
  },
  dotActive: {
    background: colors.primary,
    transform: 'scale(1.3)',
  },
};
