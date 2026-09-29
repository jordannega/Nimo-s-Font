import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (canvas: HTMLCanvasElement) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1440 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Camera access denied or unavailable. Please check permissions or upload a file instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      onCapture(canvas);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Live Camera Paper Scanner</h3>
              <p className="text-[11px] text-slate-400">Position your template or handwriting sheet inside the frame</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
          {error ? (
            <div className="p-6 text-center space-y-3 max-w-sm">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-200">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Grid alignment overlay */}
              <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-indigo-400/80 rounded-2xl flex flex-col justify-between p-4 shadow-[0_0_50px_rgba(99,102,241,0.25)_inset]">
                <div className="flex justify-between items-start text-[10px] text-indigo-300 font-mono bg-black/60 px-2 py-1 rounded backdrop-blur self-start">
                  ALIGN SHEET CORNERS INSIDE FRAME
                </div>
                <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full my-2 opacity-30 border border-indigo-500/40">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-indigo-500/30" />
                  ))}
                </div>
                <div className="text-[10px] text-indigo-300 font-mono bg-black/60 px-2 py-1 rounded backdrop-blur self-end">
                  HOLD STILL FOR OPTIMAL OCR
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <button
            onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch Lens</span>
          </button>

          <button
            onClick={capturePhoto}
            disabled={!!error}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/30 flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>Capture & Scan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
