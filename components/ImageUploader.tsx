'use client';

import { useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export default function ImageUploader({
  onImageSelect,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى رفع صورة فقط');
      return;
    }

    if (file.size > maxSize) {
      alert(`حجم الصورة يجب أن يكون أقل من ${maxSize / 1024 / 1024}MB`);
      return;
    }

    onImageSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-4 border-dashed border-gray-300 rounded-xl p-16 text-center cursor-pointer hover:border-primary-500 transition-colors"
    >
      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-2xl font-semibold text-gray-700 mb-2">
        اضغط لرفع صورة
      </h3>
      <p className="text-gray-500">أو اسحب الصورة وأفلتها هنا</p>
      <p className="text-sm text-gray-400 mt-4">
        PNG, JPG, WEBP (حد أقصى {maxSize / 1024 / 1024}MB)
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
