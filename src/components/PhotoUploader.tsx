import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, Eye, AlertCircle, Sparkles, Lock, Globe, Shield } from 'lucide-react';
import { LocalPhoto } from '../types/charger';

interface PhotoUploaderProps {
  photos: LocalPhoto[];
  onPhotosChange: (photos: LocalPhoto[]) => void;
  maxPhotos?: number;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 6,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<{ url: string; name: string } | null>(null);

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const newPhotos: LocalPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!validTypes.includes(file.type)) {
        setErrorMessage(`"${file.name}" is not a supported format. Please upload JPG, PNG, or WEBP.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" is too large. Max file size is 10MB.`);
        continue;
      }

      if (photos.length + newPhotos.length >= maxPhotos) {
        setErrorMessage(`Maximum limit of ${maxPhotos} photos reached.`);
        break;
      }

      // Generate local object URL for preview
      const previewUrl = URL.createObjectURL(file);
      newPhotos.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        previewUrl,
        size: file.size,
        file,
      });
    }

    if (newPhotos.length > 0) {
      onPhotosChange([...photos, ...newPhotos]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset file input value so same file can be re-selected if deleted
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (id: string, previewUrl: string) => {
    // Revoke object URL
    URL.revokeObjectURL(previewUrl);
    const updated = photos.filter((p) => p.id !== id);
    onPhotosChange(updated);
  };

  const togglePhotoPrivacy = (id: string) => {
    const updated = photos.map((p, idx) => {
      if (idx === 0) return p; // Cover photo is always public
      if (p.id === id) {
        return { ...p, isPrivate: !p.isPrivate };
      }
      return p;
    });
    onPhotosChange(updated);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-brand-500 bg-brand-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-brand-400 bg-slate-50/60 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Click to select photos or drag & drop here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Add photos of your parking slot, charger socket, and entrance landmark (JPG, PNG, WEBP up to 10MB)
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span>{photos.length} of {maxPhotos} photos uploaded</span>
          </div>
        </div>
      </div>

      {/* Privacy Shield Guidance */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
        <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-900">Residential Privacy Shield: </span>
          Mark sensitive photos (gate code, personal driveway, private meter) as <span className="font-semibold text-amber-800">Private</span>. Private photos are isolated in protected storage and hidden from public explore cards.
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Photo Previews Grid */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Photo Previews ({photos.length})
            </span>
            <span className="text-xs text-slate-400">Click photo privacy badge to toggle</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3 shadow-sm hover:shadow-md transition"
              >
                <img
                  src={photo.previewUrl}
                  alt={photo.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Privacy Badge / Toggle */}
                {index === 0 ? (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-forest-700/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-md shadow-xs flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Cover (Public)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhotoPrivacy(photo.id);
                    }}
                    title="Click to toggle Public / Private"
                    className={`absolute top-2 left-2 px-2 py-0.5 backdrop-blur-xs text-[10px] font-bold rounded-md shadow-xs flex items-center gap-1 transition cursor-pointer ${
                      photo.isPrivate
                        ? 'bg-amber-800/90 text-amber-100 hover:bg-amber-900 border border-amber-600'
                        : 'bg-forest-700/90 text-white hover:bg-forest-800 border border-forest-600'
                    }`}
                  >
                    {photo.isPrivate ? (
                      <>
                        <Lock className="w-3 h-3 text-amber-300" /> Private
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 text-emerald-300" /> Public
                      </>
                    )}
                  </button>
                )}

                {/* Hover overlay with Actions */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewModalUrl({ url: photo.previewUrl, name: photo.name });
                    }}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 transition hover:scale-110"
                    title="Enlarge preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(photo.id, photo.previewUrl);
                    }}
                    className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition hover:scale-110 shadow-sm"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* File info footer */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent p-1.5 text-white text-[11px] truncate flex items-center justify-between">
                  <span className="truncate max-w-[70%]">{photo.name}</span>
                  <span className="text-[10px] text-slate-300 shrink-0 font-mono">
                    {formatFileSize(photo.size)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal / Lightbox */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-sm font-medium truncate flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-400" />
                {previewModalUrl.name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-950 p-2 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={previewModalUrl.url}
                alt={previewModalUrl.name}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
