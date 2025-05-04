'use client';

import { useState, useEffect } from 'react';
import NewspaperPage from './NewspaperPage';
import { NewspaperPage as NewspaperPageType, TranscriptBox } from '@prisma/client';

interface NewspaperViewerProps {
  pages: NewspaperPageType[];
  onTranscriptBoxCreate: (pageId: number, x: number, y: number, width: number, height: number) => Promise<void>;
  onTranscriptBoxUpdate: (boxId: number, updates: Partial<TranscriptBox>) => Promise<void>;
  onTranscriptGenerate: (pageId: number, x: number, y: number, width: number, height: number) => Promise<void>;
  onPageMove: (pageId: number, x: number, y: number) => Promise<void>;
  onPageResize: (pageId: number, width: number, height: number) => Promise<void>;
}

const NewspaperViewer = ({
  pages,
  onTranscriptBoxCreate,
  onTranscriptBoxUpdate,
  onTranscriptGenerate,
  onPageMove,
  onPageResize,
}: NewspaperViewerProps) => {
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [isSelectionEnabled, setIsSelectionEnabled] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  const handleTranscriptBoxCreate = async (pageId: number, x: number, y: number, width: number, height: number) => {
    console.log('create', pageId, x, y, width, height);
    await onTranscriptBoxCreate(pageId, x, y, width, height);
  };

  const handleTranscriptBoxUpdate = async (boxId: number, updates: Partial<TranscriptBox>) => {
    await onTranscriptBoxUpdate(boxId, updates);
  };

  const handleTranscriptGenerate = async (pageId: number, x: number, y: number, width: number, height: number) => {
    await onTranscriptGenerate(pageId, x, y, width, height);
  };

  const handlePageMove = async (pageId: number, x: number, y: number) => {
    await onPageMove(pageId, x, y);
  };

  const handlePageResize = async (pageId: number, width: number, height: number) => {
    await onPageResize(pageId, width, height);
  };

  return (
    <div>
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button
          className={`px-4 py-2 rounded ${
            isSelectionEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setIsSelectionEnabled(!isSelectionEnabled)}
        >
          {isSelectionEnabled ? 'Disable Transcript Box' : 'Enable Transcript Box'}
        </button>
        <button
          className={`px-4 py-2 rounded ${
            isMoveMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setIsMoveMode(!isMoveMode)}
        >
          {isMoveMode ? 'Move Mode : ON' : 'Move Mode : OFF'}
        </button>
      </div>
      <div className="absolute z-5 left-0 top-0 h-[95vh] w-screen overflow-y-auto overflow-x-auto">
      {pages.map((page) => (
        <NewspaperPage
          key={page.id}
          page={page}
          onTranscriptBoxCreate={(x, y, width, height) =>
            handleTranscriptBoxCreate(page.id, x, y, width, height)
          }
          onTranscriptBoxUpdate={handleTranscriptBoxUpdate}
          onTranscriptGenerate={(x, y, width, height) =>
            handleTranscriptGenerate(page.id, x, y, width, height)
          }
          onPageMove={(x, y) => handlePageMove(page.id, x, y)}
          onPageResize={(width, height) => handlePageResize(page.id, width, height)}
          isMoveMode={isMoveMode}
          isSelectionEnabled={isSelectionEnabled}
        />
      ))}</div>
    </div>
  );
};

export default NewspaperViewer; 