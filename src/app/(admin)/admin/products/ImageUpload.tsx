'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

type ImageUploadProps = {
  productId?: string;
  currentImageUrl?: string | null;
  onImageReady?: (file: File) => void;
  onUploaded?: (url: string) => void;
};

function resizeImage(file: File, maxSize: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round(height * (maxSize / width));
          width = maxSize;
        } else {
          width = Math.round(width * (maxSize / height));
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context failed'));

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
}

export default function ImageUpload({
  productId,
  currentImageUrl,
  onImageReady,
  onUploaded,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setInfo(null);

      if (!file.type.startsWith('image/')) {
        setError('Выберите изображение');
        return;
      }

      const originalSize = (file.size / 1024).toFixed(0);

      // Resize on client
      let blob: Blob;
      try {
        blob = await resizeImage(file, 800, 0.85);
        // If still too large, try lower quality
        if (blob.size > 500_000) {
          blob = await resizeImage(file, 600, 0.75);
        }
        if (blob.size > 500_000) {
          blob = await resizeImage(file, 500, 0.6);
        }
      } catch {
        setError('Ошибка обработки изображения');
        return;
      }

      const newSize = (blob.size / 1024).toFixed(0);
      setInfo(`${originalSize} KB → ${newSize} KB`);

      const resizedFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });

      // Preview
      const previewUrl = URL.createObjectURL(blob);
      setPreview(previewUrl);

      // If no productId yet (new product), store file for later upload
      if (!productId) {
        onImageReady?.(resizedFile);
        return;
      }

      // Upload immediately for existing products
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', resizedFile);

        const res = await fetch(`/api/admin/products/${productId}/image`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || `Ошибка загрузки (${res.status})`);
          return;
        }

        const data = await res.json();
        onUploaded?.(data.image_url);
      } catch {
        setError('Ошибка сети');
      } finally {
        setUploading(false);
      }
    },
    [productId, onImageReady, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm text-text-muted">Изображение</label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-48 rounded-xl border-2 border-dashed border-border-subtle hover:border-accent-yellow transition-colors cursor-pointer flex items-center justify-center overflow-hidden bg-bg-secondary"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain p-2"
            sizes="400px"
          />
        ) : (
          <div className="text-center text-text-muted text-sm">
            <p>Перетащите или нажмите</p>
            <p className="text-xs mt-1">JPG/PNG, max 800px</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-bg-primary/80 flex items-center justify-center">
            <p className="text-accent-yellow-text text-sm animate-pulse">Загрузка...</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {info && <p className="text-xs text-text-muted">{info}</p>}
      {error && <p className="text-xs text-accent-magenta">{error}</p>}
    </div>
  );
}
