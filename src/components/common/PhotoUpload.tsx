import React, { useState, useRef } from 'react';
import { Upload, X, Camera, RefreshCw, Eye, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

interface PhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
];

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  value,
  onChange,
  required = false,
  error,
  label = 'Member Profile Picture',
  helperText = 'Upload a clear headshot or select a profile avatar.',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSampleGallery, setShowSampleGallery] = useState(false);
  const [previewZoomOpen, setPreviewZoomOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">* (Required)</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => setShowSampleGallery(!showSampleGallery)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showSampleGallery ? 'Hide Sample Avatars' : 'Choose Sample Avatar'}
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
        {/* Photo Preview or Placeholder */}
        <div className="relative group shrink-0">
          {value ? (
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md bg-white">
              <img
                src={value}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-2xs">
                <button
                  type="button"
                  onClick={() => setPreviewZoomOpen(true)}
                  className="p-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg shadow-sm transition-all"
                  title="Zoom Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg shadow-sm transition-all"
                  title="Change Photo"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg shadow-sm transition-all"
                  title="Remove Photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/70 scale-105'
                  : error
                  ? 'border-rose-400 bg-rose-50/50'
                  : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50'
              }`}
            >
              <Camera className="w-7 h-7 text-slate-400 mb-1" />
              <span className="text-[11px] font-semibold text-slate-600 text-center px-2">
                Click to Upload
              </span>
            </div>
          )}
        </div>

        {/* Action Controls & Instructions */}
        <div className="flex-1 space-y-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => fileInputRef.current?.click()}
            >
              {value ? 'Change Photo' : 'Upload From Device'}
            </Button>

            {!value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                onClick={() => setShowSampleGallery(true)}
              >
                Pick Sample Avatar
              </Button>
            )}

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                icon={<X className="w-3.5 h-3.5" />}
                onClick={() => onChange('')}
              >
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            {helperText} Supported formats: JPG, PNG, WEBP (Max 5MB).
          </p>

          {error && (
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span>⚠️</span> {error}
            </p>
          )}
        </div>
      </div>

      {/* Sample Avatar Drawer/Gallery */}
      {showSampleGallery && (
        <div className="p-3 bg-white rounded-xl border border-indigo-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              Quick Sample Member Avatars
            </span>
            <button
              type="button"
              onClick={() => setShowSampleGallery(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {SAMPLE_AVATARS.map((avatar, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(avatar);
                  setShowSampleGallery(false);
                }}
                className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-transform hover:scale-105 ${
                  value === avatar ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-slate-200 hover:border-indigo-400'
                }`}
              >
                <img src={avatar} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full Preview Zoom Modal */}
      {previewZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewZoomOpen(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-sm w-full p-4 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Member Photo Preview</h4>
              <button
                type="button"
                onClick={() => setPreviewZoomOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden aspect-square border border-slate-200">
              <img src={value} alt="Zoom" className="w-full h-full object-cover" />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setPreviewZoomOpen(false)}
            >
              Close Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
