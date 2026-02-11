export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
  progress: string;
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface ImageUpload {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}
