"use client";

import { useEffect, useRef, useState } from "react";
import DraggableNewspaperPage from "./DraggableNewspaperPage";
import TranscriptBoxSelector from "./TranscriptBoxSelector";
import TranscriptBoxComponent from "./TranscriptBoxComponent";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Rnd } from "react-rnd";
import { getFullS3Url } from "@/lib/s3-frontend";
import { TranscriptBox } from "@/types/transcript";

interface NewspaperPageProps {
  page: {
    id: number;
    fileUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
    transcriptBoxes?: TranscriptBox[];
  };
  onTranscriptBoxCreate: (
    x: number,
    y: number,
    width: number,
    height: number
  ) => Promise<void>;
  onTranscriptBoxUpdate: (
    boxId: number,
    updates: Partial<TranscriptBox>
  ) => Promise<void>;
  onTranscriptBoxDelete: (boxId: number) => Promise<void>;
  onTranscriptGenerate: (
    x: number,
    y: number,
    width: number,
    height: number,
    language: string
  ) => Promise<void>;
  onPageMove?: (x: number, y: number) => Promise<void>;
  onPageResize?: (width: number, height: number) => Promise<void>;
  isMoveMode?: boolean;
  isSelectionEnabled?: boolean;
}

const NewspaperPage = ({
  page,
  onTranscriptBoxUpdate,
  onTranscriptBoxDelete,
  onTranscriptGenerate,
  onPageMove,
  onPageResize,
  isMoveMode = false,
  isSelectionEnabled = true,
}: NewspaperPageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingBox, setLoadingBox] = useState<TranscriptBox | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"fr" | "en" | "de">("de");

  const handleSelect = async (
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    // Create a temporary box with a unique ID
    const tempBoxId = Date.now();
    setLoadingBox({
      id: tempBoxId,
      x,
      y,
      width,
      height,
      text: "",
    });

    try {
      await onTranscriptGenerate(x, y, width, height, selectedLanguage);
    } finally {
      setLoadingBox(null);
    }
  };

  const [position, setPosition] = useState({ x: page.x, y: page.y });
  const [size, setSize] = useState({ width: page.width, height: page.height });

  const onPositionChange = ({
    x,
    y,
    persist,
  }: {
    x: number;
    y: number;
    persist?: boolean;
  }) => {
    setPosition({ x, y });
    if (persist) {
      onPageMove?.(x, y);
    }
  };

  const onSizeChange = ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) => {
    setSize({ width, height });
    onPageResize?.(width, height);
  };

  useEffect(() => {
    setPosition({ x: page.x, y: page.y });
  }, [page?.x, page?.y]);

  return (
    <DraggableNewspaperPage
      enabled={isMoveMode}
      position={position}
      setPosition={onPositionChange}
      size={size}
      setSize={onSizeChange}
    >
      <div
        ref={containerRef}
        className="relative selectable border-2 border-blue-500 w-full h-full"
      >
        <div className="absolute top-[-20px] left-0 z-10">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as "fr" | "en" | "de")}
            className="px-2 py-1 border border-gray-300 rounded-md bg-white shadow-sm"
          >
            <option value="de">German</option>
            <option value="fr">French</option>
            <option value="en">English</option>
          </select>
        </div>
        <img
          src={getFullS3Url(page.fileUrl)}
          alt="Newspaper page"
          className="w-full h-full"
          style={{ cursor: isMoveMode ? "move" : "default" }}
        />
        {isSelectionEnabled && !isMoveMode && (
          <TranscriptBoxSelector
            containerRef={containerRef}
            onSelect={(x, y, width, height) =>
              handleSelect(x, y, width, height)
            }
          />
        )}
        {loadingBox && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50"
            style={{
              zIndex: 1000,
              left: loadingBox.x,
              top: loadingBox.y,
              width: loadingBox.width,
              height: loadingBox.height,
            }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {page.transcriptBoxes?.map((box) => (
          <TranscriptBoxComponent
            key={box.id}
            box={box}
            onUpdate={(updates) => onTranscriptBoxUpdate(box.id, updates)}
            onDelete={() => onTranscriptBoxDelete(box.id)}
          />
        ))}
      </div>
    </DraggableNewspaperPage>
  );
};

export default function NewspaperPageWithDnd(props: NewspaperPageProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <NewspaperPage {...props} />
    </DndProvider>
  );
}
