import React, { useRef, useState } from 'react';
import { UploadIcon } from './Icons';

interface UploaderProps {
  onImageSelected: (file: File, base64: string) => void;
  disabled?: boolean;
}

export const Uploader: React.FC<UploaderProps> = ({ onImageSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix to get raw base64 for API if needed, 
      // but usually we keep it for preview and strip later.
      // Here we pass the full data URL.
      onImageSelected(file, base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center w-full h-64 
        border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
        ${isDragging 
          ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
          : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <div className={`p-4 rounded-full mb-3 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
          <UploadIcon className="w-8 h-8" />
        </div>
        <p className="mb-2 text-sm text-slate-700 font-medium">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
      </div>
    </div>
  );
};
