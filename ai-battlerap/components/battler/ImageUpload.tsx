'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { ImageType } from '@/lib/services/imageUploadService';

type Props = {
  type: ImageType;
  currentImageUrl: string | null;
  onUploadSuccess: (url: string) => void;
  onDeleteSuccess: () => void;
};

export default function ImageUpload({
  type,
  currentImageUrl,
  onUploadSuccess,
  onDeleteSuccess,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSize = type === 'avatar' ? 5 : 10;
  const dimensions = type === 'avatar' ? '400x400px' : '1200x300px';
  const aspectClass = type === 'avatar' ? 'aspect-square' : 'aspect-[4/1]';

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', type);

      const response = await fetch('/api/battler/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Success
      setPreview(null);
      setSelectedFile(null);
      onUploadSuccess(data.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/battler/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: currentImageUrl,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      // Success
      onDeleteSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Image or Upload Zone */}
      {!preview && (
        <>
          {currentImageUrl ? (
            <div className="space-y-4">
              <div className={`w-full ${aspectClass} relative rounded-lg overflow-hidden border-2 border-[#3a3d44]`}>
                <img
                  src={currentImageUrl}
                  alt={`Current ${type}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full px-4 py-2 bg-red-500/20 text-red-500 border-2 border-red-500/30 rounded font-display font-black uppercase tracking-wider text-sm hover:bg-red-500/30 disabled:opacity-50"
              >
                {deleting ? 'DELETING...' : `DELETE ${type.toUpperCase()}`}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-[#ff8c42]/20 text-[#ff8c42] border-2 border-[#ff8c42]/30 rounded font-display font-black uppercase tracking-wider text-sm hover:bg-[#ff8c42]/30"
              >
                REPLACE {type.toUpperCase()}
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full ${aspectClass} border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-[#ff8c42] bg-[#ff8c42]/10'
                  : 'border-[#3a3d44] bg-[#2d2f35] hover:border-zinc-600'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                className="w-12 h-12 text-zinc-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-zinc-400 font-display font-black uppercase tracking-wide text-sm mb-2">
                DRAG AND DROP OR CLICK TO UPLOAD
              </p>
              <p className="text-zinc-600 uppercase tracking-wide text-xs">
                JPEG, PNG, OR WEBP • MAX {maxSize}MB • RECOMMENDED: {dimensions}
              </p>
            </div>
          )}
        </>
      )}

      {/* Preview and Upload */}
      {preview && (
        <div className="space-y-4">
          <div className={`w-full ${aspectClass} relative rounded-lg overflow-hidden border-2 border-[#ff8c42]`}>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-[#ff8c42] text-zinc-950 rounded font-black uppercase tracking-wider text-sm hover:bg-[#ff9d5c] disabled:opacity-50"
            >
              {uploading ? 'UPLOADING...' : `UPLOAD ${type.toUpperCase()}`}
            </button>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-400 rounded font-display font-black uppercase tracking-wider text-sm hover:bg-zinc-700 disabled:opacity-50"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border-2 border-red-500/30 rounded">
          <p className="text-red-500 text-sm font-display font-black uppercase tracking-wide">
            {error}
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
