import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PolypIcon from './PolypIcon';
import ThemeToggle from './ThemeToggle';
import { ThemeContext } from '../theme/ThemeContext';

const HomePage: React.FC = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="hidden sm:flex max-w-6xl mx-auto flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start"></div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </div>
        <div className="sm:hidden flex justify-between items-center">
          <div className="flex-shrink-0"></div>
          <div className="flex-1 flex justify-center px-2"></div>
          <div className="flex-shrink-0">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <section className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-8">
            <PolypIcon size={80} className="drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            PolypVision AI
          </h1>
          <p className="mt-6 text-xl font-semibold text-slate-700 dark:text-slate-300 sm:text-2xl">
            Real-Time Deep Dilated Segmentation for Colonoscopy
          </p>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 sm:text-xl">
            Automated polyp segmentation from colonoscopy images using DilatedSegNet architecture with ResNet50 encoder and multi-scale dilated convolution pooling.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              to="/demo"
              className="inline-flex items-center rounded-lg bg-blue-600 dark:bg-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Start Detection
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 dark:bg-slate-800 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Simple, fast, and accurate polyp detection workflow
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
                  <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  Upload Image
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Upload a JPEG or PNG colonoscopy frame from your endoscopy footage.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
                  <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  AI Segmentation
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  DilatedSegNet processes the image at 33.68 FPS producing a pixel-accurate binary mask.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
                  <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  View Overlay
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Inspect the original frame, binary mask, and red-highlighted polyp overlay side by side.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-100 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-400">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    0.90 Dice Score on Kvasir-SEG
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Benchmarked on NVIDIA RTX 3090 at 33.68 FPS inference speed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 dark:bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Technical Lead:{' '}
            <a href="https://debeshjha.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">
              Debesh Jha
            </a>
            {' '}· AI/ML Engineer:{' '}
            <a href="https://harshithreddy01.github.io/My-Web/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">
              Harshith Reddy Nalla
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
