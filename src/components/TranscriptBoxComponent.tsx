import React, { useEffect, useRef, useState } from "react";
import { TranscriptBox } from "@/types/transcript";

interface TranscriptBoxComponentProps {
  box: TranscriptBox;
  onUpdate: (updates: Partial<TranscriptBox>) => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const TranscriptBoxComponent = ({
  box,
  onUpdate,
  onDelete,
  isLoading = false,
}: TranscriptBoxComponentProps) => {
  const frenchTranslation = box.translations
    ?.find((t) => t.language === "fr")
    ?.translationText.replace(/^(\`\`\`|")|("|`\`\`$)/g, "")
    .replace(/\n/g, "<br/>");
  const displayText = frenchTranslation || box.text;
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState("7px");

  useEffect(() => {
    if (!textRef.current || !displayText) return;

    const calculateFontSize = () => {
      const textElement = textRef.current;
      if (!textElement) {
        return;
      }

      const containerWidth = box.width - 4; // Subtract padding
      const containerHeight = box.height - 4; // Subtract padding

      let currentSize = 5; // Start with a reasonable size
      let lastGoodSize = currentSize;
      let iterations = 0;
      const maxIterations = 300;

      const doesTextFit = (size: number) => {
        textElement.style.fontSize = `${size}px`;
        const textWidth = textElement.scrollWidth;
        const textHeight = textElement.scrollHeight;
        return textWidth <= containerWidth && textHeight <= containerHeight;
      };

      // First, find a size that fits
      while (
        !doesTextFit(currentSize) &&
        currentSize > 4 &&
        iterations < maxIterations
      ) {
        currentSize -= 0.1;
        iterations++;
      }

      // Now try to increase the size gradually
      while (iterations < maxIterations) {
        const nextSize = currentSize + 0.1;
        if (doesTextFit(nextSize)) {
          lastGoodSize = currentSize;
          currentSize = nextSize;
        } else {
          // If it doesn't fit, revert to the last good size
          currentSize = lastGoodSize;
          break;
        }
        iterations++;
      }

      setFontSize(`${Math.max(4, currentSize)}px`);
    };

    calculateFontSize();
    // Recalculate on window resize
    window.addEventListener("resize", calculateFontSize);
    return () => window.removeEventListener("resize", calculateFontSize);
  }, [box.width, box.height, displayText]);

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
      <button
        onClick={onDelete}
        className="absolute top-0 right-0 p-1 text-red-500 hover:text-red-700"
        style={{ zIndex: 1 }}
      >
        ×
      </button>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      ) : (
        displayText && (
          <p
            ref={textRef}
            style={{
              fontSize,
              lineHeight: "1.2",
              margin: 0,
              padding: 0,
              wordBreak: "break-word",
              overflow: "hidden",
            }}
            className="leading-tight"
            dangerouslySetInnerHTML={{ __html: displayText }}
          ></p>
        )
      )}
    </div>
  );
};

export default TranscriptBoxComponent;
