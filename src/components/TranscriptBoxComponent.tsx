import React from 'react';
import { TranscriptBox } from '@/types/transcript';

interface TranscriptBoxComponentProps {
  box: TranscriptBox;
  onUpdate: (updates: Partial<TranscriptBox>) => void;
  isLoading?: boolean;
}

const TranscriptBoxComponent = ({ box, onUpdate, isLoading = false }: TranscriptBoxComponentProps) => {
  const frenchTranslation = box.translations?.find(t => t.language === 'fr')?.translationText;
  const displayText = frenchTranslation || box.text;

  return (
    <div
      className="absolute border-2 border-blue-500 bg-white bg-opacity-80 p-1 overflow-y-auto"
      style={{
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
      }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      ) : (
        displayText && <p style={{ fontSize: '7px' }} className='leading-tight'>{displayText}</p>
      )}
    </div>
  );
};

export default TranscriptBoxComponent; 