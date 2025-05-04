'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import NewspaperViewer from '@/components/NewspaperViewer';
import { NewspaperPage as PrismaNewspaperPage, TranscriptBox } from '@prisma/client';

interface NewspaperPage extends PrismaNewspaperPage {
  transcriptBoxes?: TranscriptBox[];
}

export default function Home() {
  const [pages, setPages] = useState<NewspaperPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('fetching pages');
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[], dropEvent: any) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Get coordinates from the drop event
    const x = dropEvent.pageX || 0;
    const y = dropEvent.pageY || 0;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('x', x.toString());
    formData.append('y', y.toString());
    formData.append('name', file.name);

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const newPage = await response.json();
      setPages((prev) => [...prev, newPage]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    noClick: true,
  });

  const handleTranscriptBoxCreate = async (pageId: number, x: number, y: number, width: number, height: number) => {
    try {
      const response = await fetch('/api/transcript-boxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          x,
          y,
          width,
          height,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transcript box');
      }

      const newBox = await response.json();
      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === pageId
            ? {
                ...page,
                transcriptBoxes: [...(page.transcriptBoxes || []), newBox],
              }
            : page
        )
      );
    } catch (error) {
      console.error('Error creating transcript box:', error);
    }
  };

  const handleTranscriptBoxUpdate = async (boxId: number, updates: Partial<TranscriptBox>) => {
    try {
      const response = await fetch(`/api/transcript-boxes/${boxId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update transcript box');
      }

      const updatedBox = await response.json();
      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === updatedBox.pageId
            ? {
                ...page,
                transcriptBoxes: page.transcriptBoxes?.map((box: TranscriptBox) =>
                  box.id === boxId ? updatedBox : box
                ),
              }
            : page
        )
      );
    } catch (error) {
      console.error('Error updating transcript box:', error);
    }
  };

  const handleTranscriptGenerate = async (pageId: number, x: number, y: number, width: number, height: number) => {
    try {
      const response = await fetch('/api/transcript-boxes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          x,
          y,
          width,
          height,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate transcript');
      }

      const newBox = await response.json();
      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === pageId
            ? {
                ...page,
                transcriptBoxes: [...(page.transcriptBoxes || []), newBox],
              }
            : page
        )
      );
    } catch (error) {
      console.error('Error generating transcript:', error);
    }
  };

  const handlePageMove = async (pageId: number, x: number, y: number) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x, y }),
      });

      if (!response.ok) {
        throw new Error('Failed to move page');
      }

      const updatedPage = await response.json();
      setPages((prevPages) =>
        prevPages.map((page) => (page.id === pageId ? updatedPage : page))
      );
    } catch (error) {
      console.error('Error moving page:', error);
    }
  };

  const handlePageResize = async (pageId: number, width: number, height: number) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/size`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ width, height }),
      });

      if (!response.ok) {
        throw new Error('Failed to resize page');
      }

      const updatedPage = await response.json();
      setPages((prevPages) =>
        prevPages.map((page) => (page.id === pageId ? updatedPage : page))
      );
    } catch (error) {
      console.error('Error resizing page:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main {...getRootProps()} className="min-h-screen p-8 relative">
      <input {...getInputProps()} />
      {isDragActive && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-10">
          <p className="text-2xl font-bold text-blue-600">Drop the image here</p>
        </div>
      )}
      <NewspaperViewer
        pages={pages}
        onTranscriptBoxCreate={handleTranscriptBoxCreate}
        onTranscriptBoxUpdate={handleTranscriptBoxUpdate}
        onTranscriptGenerate={handleTranscriptGenerate}
        onPageMove={handlePageMove}
        onPageResize={handlePageResize}
      />
    </main>
  );
}
