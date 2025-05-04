export interface TranscriptBoxTranslation {
  id: number;
  language: string;
  translationText: string;
  transcriptBoxId: number;
}

export interface TranscriptBox {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string | null;
  translations?: TranscriptBoxTranslation[];
} 