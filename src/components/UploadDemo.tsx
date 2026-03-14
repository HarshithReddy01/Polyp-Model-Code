import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../theme/ThemeContext';
import ThemeToggle from './ThemeToggle';

const API_BASE = 'https://harshithreddy01-polyp-detection.hf.space';
const BASE_URL = import.meta.env.BASE_URL;

const SAMPLE_IMAGES = [
  'cju1b0y2e396p08558ois175d.jpg',
  'cju1b3zgj3d8e0801kpolea6c.jpg',
  'cju1b75x63ddl0799sdp0i2j3.jpg',
  'cju1bhnfitmge0835ynls0l6b.jpg',
  'cju1bm8063nmh07996rsjjemq.jpg',
  'cju1brhsj3rls0855a1vgdlen.jpg',
  'cju1c0qb4tzi308355wtsnp0y.jpg',
  'cju1c3218411b08014g9f6gig.jpg',
  'cju1c4fcu40hl07992b8gj0c8.jpg',
  'cju1c6yfz42md08550zgoz3pw.jpg',
  'cju1c8ffau5770835g0g343o8.jpg',
  'cju1cbokpuiw70988j4lq1fpi.jpg',
];

interface ResultData {
  original: string;
  mask: string;
  overlay: string;
}

interface FileInfo {
  file: File;
  preview: string;
  size: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const buildOverlay = (originalSrc: string, maskB64: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maskImg = new Image();
      maskImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;
        const mCtx = maskCanvas.getContext('2d')!;
        mCtx.drawImage(maskImg, 0, 0, img.width, img.height);
        const maskData = mCtx.getImageData(0, 0, img.width, img.height);

        const overlayData = ctx.getImageData(0, 0, img.width, img.height);
        for (let i = 0; i < maskData.data.length; i += 4) {
          if (maskData.data[i] > 127) {
            overlayData.data[i] = Math.min(255, overlayData.data[i] + 120);
            overlayData.data[i + 1] = Math.max(0, overlayData.data[i + 1] - 40);
            overlayData.data[i + 2] = Math.max(0, overlayData.data[i + 2] - 40);
          }
        }
        ctx.putImageData(overlayData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      maskImg.src = `data:image/png;base64,${maskB64}`;
    };
    img.src = originalSrc;
  });
};

const UploadDemo: React.FC = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('polypvision-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('polypvision-theme', 'light');
    }
  }, [isDark]);

  const validateFile = (file: File): boolean => {
    const ext = file.name.toLowerCase();
    return (ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png')) && file.size <= 20 * 1024 * 1024;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!validateFile(file)) {
      alert('Please upload a JPEG or PNG colonoscopy image under 20MB.');
      return;
    }
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 1000);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileInfo({
        file,
        preview: e.target?.result as string,
        size: formatFileSize(file.size),
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev - 1);
    if (dragCounter <= 1) setIsDragOver(false);
  }, [dragCounter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  const handleAnalyze = async () => {
    if (!fileInfo || !hasConsent) return;
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', fileInfo.file);
      const response = await fetch(`${API_BASE}/predict?model=Kvasir-Seg`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `HTTP ${response.status}`);
      }
      const data = await response.json();
      const overlayDataUrl = await buildOverlay(fileInfo.preview, data.mask);
      setResult({
        original: fileInfo.preview,
        mask: `data:image/png;base64,${data.mask}`,
        overlay: overlayDataUrl,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Analysis failed. Please try again.';
      alert(`Error: ${msg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFileInfo(null);
    setHasConsent(false);
    setIsAnalyzing(false);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canAnalyze = fileInfo && hasConsent && !isAnalyzing;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-all duration-500">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="group inline-flex items-center px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-full text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-blue-800 dark:from-white dark:via-blue-200 dark:to-blue-200 bg-clip-text text-transparent sm:text-5xl lg:text-6xl mb-6">
            Polyp Detection
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">
              Upload a colonoscopy JPEG or PNG frame for automatic polyp segmentation using DilatedSegNet AI
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm text-blue-700 dark:text-blue-300">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                JPEG / PNG
              </div>
              <div className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm text-blue-700 dark:text-blue-300">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI Segmentation
              </div>
              <div className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm text-blue-700 dark:text-blue-300">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                33.68 FPS
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/30 border border-blue-200/50 dark:border-blue-700/50 rounded-2xl backdrop-blur-sm shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Upload Guidelines
              </h3>
              <p className="mt-2 text-blue-700 dark:text-blue-300">
                Upload colonoscopy frames only. The model works best with endoscopic images showing the colon interior. Non-colonoscopy images will not produce meaningful results. Only JPEG and PNG files are accepted.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
            Sample colonoscopy images
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Download a sample below, then upload it to try the model.
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_IMAGES.map((name, i) => (
              <a
                key={name}
                href={`${BASE_URL}test-images/${name}`}
                download={name}
                className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-150"
              >
                Sample {i + 1}
              </a>
            ))}
          </div>
        </div>

        <div className={`grid gap-8 ${fileInfo ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
          <div className={`space-y-6 ${fileInfo ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
            <div
              className={`relative border-2 border-dashed rounded-2xl text-center transition-all duration-500 ${
                isDragOver
                  ? 'p-8 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 shadow-2xl scale-105'
                  : 'p-8 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-lg'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="mb-6">
                <div className={`mx-auto bg-gradient-to-r from-blue-500 via-blue-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                  isPulsing ? 'animate-ping' : 'animate-pulse'
                } w-20 h-20`}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-xl">
                  {isDragOver ? 'Drop your image here' : 'Drag & drop your colonoscopy image'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-base">
                  or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors duration-200 underline decoration-2 underline-offset-4"
                  >
                    browse files
                  </button>
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-500 mt-4">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">.jpg</span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">.jpeg</span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">.png</span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">max 20MB</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200/50 dark:border-amber-700/50 rounded-2xl backdrop-blur-sm shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    Medical Disclaimer
                  </h3>
                  <p className="mt-2 text-amber-700 dark:text-amber-300">
                    This tool is for research and educational purposes only. It is not a replacement for professional medical diagnosis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`space-y-6 ${fileInfo ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
            {fileInfo && (
              <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-200/50 dark:border-slate-600/50">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Selected Image
                </h3>
                <div className="space-y-3">
                  <div className="w-full rounded-xl overflow-hidden border-2 border-blue-200 dark:border-blue-700 shadow-lg">
                    <img
                      src={fileInfo.preview}
                      alt="Selected colonoscopy image"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Name:</span>
                      <span className="text-xs text-slate-900 dark:text-white font-semibold truncate ml-2 max-w-32">
                        {fileInfo.file.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Size:</span>
                      <span className="text-xs text-slate-900 dark:text-white font-semibold">{fileInfo.size}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Type:</span>
                      <span className="text-xs text-slate-900 dark:text-white font-semibold">
                        {fileInfo.file.name.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-200/50 dark:border-slate-600/50">
              <div className="flex items-start">
                <input
                  id="consent"
                  type="checkbox"
                  checked={hasConsent}
                  onChange={(e) => setHasConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 dark:text-blue-500 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 transition-all duration-200"
                />
                <label htmlFor="consent" className="ml-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  I confirm this is a colonoscopy image and I consent to analyze it with PolypVision AI. I understand this is for research and educational purposes only.
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  canAnalyze
                    ? 'bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing with AI...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Detect Polyps
                  </div>
                )}
              </button>
              <button
                onClick={handleReset}
                className="w-full py-4 px-6 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              Segmentation Results
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-200/50 dark:border-slate-600/50">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">Original</h3>
                <img src={result.original} alt="Original" className="w-full rounded-xl" />
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-200/50 dark:border-slate-600/50">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">Binary Mask</h3>
                <img src={result.mask} alt="Binary mask" className="w-full rounded-xl" />
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-200/50 dark:border-slate-600/50">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">Polyp Overlay</h3>
                <img src={result.overlay} alt="Polyp overlay" className="w-full rounded-xl" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadDemo;
