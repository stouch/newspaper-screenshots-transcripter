'use client';

import { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { Rnd } from 'react-rnd';

interface DraggableNewspaperPageProps {
    enabled: boolean;
    children: React.ReactNode;
    position: { x: number, y: number };
    size: { width: number, height: number };
    setPosition: ({ x, y, persist }: { x: number, y: number, persist?: boolean }) => void;
    setSize: ({ width, height }: { width: number, height: number }) => void;
}

interface DragEvent {
    x: number;
    y: number;
}

const DraggableNewspaperPage = ({
    enabled,
    children,
    position,
    setPosition,
    size,
    setSize,
}: DraggableNewspaperPageProps) => {

    const handleDragStop = (_e: any, data: DragEvent) => {
        setPosition({ x: data.x, y: data.y, persist: true });
    };

    const handleResizeStop = (_e: any, direction: any, ref: any, delta: any, position: any) => {
        setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
    };

    return (!enabled ?
        <div style={{ position: 'absolute', top: position.y, left: position.x, width: size.width, height: size.height }}>{children}</div> :
        <Rnd
        default={{
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
        }}
        draggable={false}
        minWidth={100}
        minHeight={100}
        bounds={""}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
      >
          {children}
        </Rnd>
    );
};

export default DraggableNewspaperPage; 