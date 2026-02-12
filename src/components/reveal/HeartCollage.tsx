'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface ImageData {
  id: number;
  src: string;
  fullSrc: string;
  alt: string;
}

interface HeartCollageProps {
  images: ImageData[];
  onImageClick: (image: ImageData, rect: DOMRect) => void;
}

interface GridCell {
  col: number;
  row: number;
  dist: number;
}

/**
 * Heart shape via the parametric curve:
 *   x(t) = 16·sin³(t)
 *   y(t) = 13·cos(t) − 5·cos(2t) − 2·cos(3t) − cos(4t)
 *
 * We sample the boundary densely, then use ray-casting to test
 * whether each grid cell center is inside the heart.
 *
 * This produces a classic heart with clear bumps at the top
 * and a sharp point at the bottom.
 */

// Pre-compute the heart boundary once
function buildHeartBoundary(): [number, number][] {
  const pts: [number, number][] = [];
  for (let t = 0; t < Math.PI * 2; t += 0.005) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([x, y]);
  }
  return pts;
}

const HEART_BOUNDARY = buildHeartBoundary();

function isInsideHeart(px: number, py: number): boolean {
  let inside = false;
  const pts = HEART_BOUNDARY;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1];
    const xj = pts[j][0], yj = pts[j][1];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Find the optimal grid size so the number of cells inside
 * the heart is closest to the target image count.
 * Then trim outermost cells if there are too many.
 */
function computeHeartGrid(targetCount: number): {
  cells: GridCell[];
  cols: number;
  rows: number;
} {
  // Heart bounding box (parametric heart is roughly x:-16..16, y:-17..15)
  const xMin = -17, xMax = 17;
  const yMin = -18, yMax = 16;
  const hW = xMax - xMin;
  const hH = yMax - yMin;

  let bestCols = 14,
    bestRows = 14,
    bestDiff = Infinity;
  let bestCells: GridCell[] = [];

  for (let size = 10; size <= 22; size++) {
    const cols = size;
    const rows = Math.round(size * (hH / hW));
    const stepX = hW / cols;
    const stepY = hH / rows;

    const cells: GridCell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = xMin + (c + 0.5) * stepX;
        const ny = yMax - (r + 0.5) * stepY;
        if (isInsideHeart(nx, ny)) {
          const dist = Math.sqrt(nx * nx + (ny - 2) * (ny - 2));
          cells.push({ col: c, row: r, dist });
        }
      }
    }

    const diff = Math.abs(cells.length - targetCount);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestCols = cols;
      bestRows = rows;
      bestCells = cells;
    }
  }

  // If too many cells, trim outermost (farthest from center)
  if (bestCells.length > targetCount) {
    bestCells.sort((a, b) => b.dist - a.dist); // farthest first
    bestCells = bestCells.slice(bestCells.length - targetCount);
  }

  return { cells: bestCells, cols: bestCols, rows: bestRows };
}

export default function HeartCollage({ images, onImageClick }: HeartCollageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());

  const { cells, cols, rows } = useMemo(
    () => computeHeartGrid(images.length),
    [images.length]
  );

  // Set of occupied positions for quick lookup
  const occupiedSet = useMemo(() => {
    const set = new Set<string>();
    cells.forEach((c) => set.add(`${c.col}-${c.row}`));
    return set;
  }, [cells]);

  // Animation order: center → outward
  const animationMap = useMemo(() => {
    const sorted = [...cells].sort((a, b) => a.dist - b.dist);
    const map = new Map<string, number>();
    sorted.forEach((c, i) => map.set(`${c.col}-${c.row}`, i));
    return map;
  }, [cells]);

  // Image assignment: top-to-bottom, left-to-right
  const cellToImageIndex = useMemo(() => {
    const sorted = [...cells].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });
    const map = new Map<string, number>();
    sorted.forEach((c, i) => map.set(`${c.col}-${c.row}`, i));
    return map;
  }, [cells]);

  const handleImageLoad = useCallback((id: number) => {
    setLoaded((prev) => new Set(prev).add(id));
  }, []);

  const handleClick = useCallback(
    (image: ImageData, e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      onImageClick(image, rect);
    },
    [onImageClick]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[520px] mx-auto"
      style={{ aspectRatio: `${cols} / ${rows}` }}
    >
      {/* Soft glow behind the heart */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[85%] h-[85%] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse, rgba(236,72,153,0.12) 0%, transparent 65%)',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Beating animation */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          scale: [1, 1.025, 1, 1.015, 1],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.15, 0.35, 0.5, 0.7],
        }}
      >
        {/* CSS Grid — every cell exists; only heart cells have images */}
        <div
          className="w-full h-full"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: '3px',
          }}
        >
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const key = `${c}-${r}`;
              const isHeart = occupiedSet.has(key);

              if (!isHeart) {
                return <div key={key} aria-hidden />;
              }

              const imgIdx = cellToImageIndex.get(key) ?? 0;
              const image = images[imgIdx % images.length];
              const animIdx = animationMap.get(key) ?? 0;
              const isLoaded = loaded.has(image.id);

              return (
                <motion.div
                  key={key}
                  className="relative cursor-pointer overflow-hidden"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: isLoaded ? 1 : 0,
                    scale: isLoaded ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + animIdx * 0.02,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  whileHover={{ scale: 1.12, zIndex: 20 }}
                  onClick={(e) => handleClick(image, e)}
                  role="button"
                  tabIndex={0}
                  aria-label={image.alt}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      const rect = e.currentTarget.getBoundingClientRect();
                      onImageClick(image, rect);
                    }
                  }}
                >
                  <div className="w-full h-full rounded-[3px] overflow-hidden shadow-md shadow-black/40 ring-1 ring-white/10">
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      decoding="async"
                      onLoad={() => handleImageLoad(image.id)}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
