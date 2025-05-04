'use client';

import React, { useRef, useEffect, useState } from 'react';

interface TranscriptBoxSelectorProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onSelect: (x: number, y: number, width: number, height: number) => void;
}

const TranscriptBoxSelector = ({ containerRef, onSelect }: TranscriptBoxSelectorProps) => {
  const [selecting, setSelecting] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      const rect = container.getBoundingClientRect();
      setStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setSelecting(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!selecting || !start) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRect({
        x: Math.min(start.x, x),
        y: Math.min(start.y, y),
        width: Math.abs(x - start.x),
        height: Math.abs(y - start.y),
      });
    };

    const handleMouseUp = () => {
      if (selecting && rect) {
        onSelect(rect.x, rect.y, rect.width, rect.height);
      }
      setSelecting(false);
      setStart(null);
      setRect(null);
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef, selecting, start, rect, onSelect]);

  return (
    <>
      {rect && (
        <div
          style={{
            position: 'absolute',
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            border: '2px dashed #007bff',
            background: 'rgba(0, 123, 255, 0.1)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      )}
    </>
  );
};

export default TranscriptBoxSelector; 