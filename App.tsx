import React, { useState, useCallback } from 'react';
import { Uploader } from './components/Uploader';
import { generateVerticalImage } from './services/geminiService';
import { MagicIcon, DownloadIcon, TrashIcon, RefreshIcon } from './components/Icons';
import { ImageUpload, ProcessingState } from './types';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageUpload | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Convert this landscape image to a 9:16 portrait composition, expanding the background naturally.");
  
  const [processing, setProcessing] = useState<ProcessingState>({
    isLoading: false,
    error: null,
    progress: '',
  });

  const handleImageSelected = useCallback((file: File, base64: string) => {
    // Extract mime type from base64 string
    const match = base64.match(/^data:(.*);base64,/);
    const mimeType = match ? match[1] : file.type;
    
    setSourceImage({
      file,
      previewUrl: base64,
      base64: base64.split(',')[1], // Raw base64 for API
      mimeType,
    });
    setGeneratedImage(null);
    setProcessing({ isLoading: false, error: null, progress: '' });
  }, []);

  const handleClear = () => {
    setSourceImage(null);
    setGeneratedImage(null);
    setProcessing({ isLoading: false, error: null, progress: '' });
  };

  const handleGenerate = async () => {
    if (!sourceImage) return;

    setProcessing({ isLoading: true, error: null, progress: 'Analyzing image...' });
    
    try {
      // Small delay to show state change
      await new Promise(r => setTimeout(r, 500));
      setProcessing(prev => ({ ...prev, progress: 'Generating new aspect ratio...' }));
      
      const resultUrl = await generateVerticalImage(
        sourceImage.base64,
        sourceImage.mimeType,
        prompt
      );

      setGeneratedImage(resultUrl);
    } catch (err: any) {
      setProcessing(prev => ({ ...prev, error: err.message || "Something went wrong" }));
    } finally {
      setProcessing(prev => ({ ...prev, isLoading: false, progress: '' }));
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `ratioflip-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <MagicIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              RatioFlip AI
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Gemini 2.5 Flash Image Edition
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Transform 16:9 to 9:16 Instantly
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your landscape photos and let our AI expand and reimagine them into full-screen portrait masterpieces perfect for mobile.
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Source Image</h3>
                {sourceImage && (
                  <button 
                    onClick={handleClear}
                    disabled={processing.isLoading}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {!sourceImage ? (
                <Uploader onImageSelected={handleImageSelected} disabled={processing.isLoading} />
              ) : (
                <div className="relative group rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img 
                    src={sourceImage.previewUrl} 
                    alt="Source" 
                    className="w-full h-auto object-cover max-h-[400px]"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={handleClear}
                      className="bg-white/90 hover:bg-white text-slate-900 px-4 py-2 rounded-full font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                    >
                      Change Image
                    </button>
                  </div>
                  {/* Aspect Ratio Badge */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-mono">
                    16:9 (Assumed)
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-2">
                  Edit Instructions (Optional)
                </label>
                <textarea
                  id="prompt"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-slate-700 bg-slate-50 focus:bg-white transition-all"
                  placeholder="e.g. Add a cyberpunk neon aesthetic..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={processing.isLoading}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!sourceImage || processing.isLoading}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform
                  flex items-center justify-center gap-3
                  ${!sourceImage || processing.isLoading
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/25 active:scale-[0.98]'
                  }
                `}
              >
                {processing.isLoading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <MagicIcon className="w-6 h-6" />
                    <span>Generate Portrait 9:16</span>
                  </>
                )}
              </button>
              
              {processing.isLoading && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-indigo-600 font-medium animate-pulse">
                    {processing.progress}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">This may take a few seconds</p>
                </div>
              )}
              
              {processing.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  <span className="font-bold">Error:</span> {processing.error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="space-y-6">
            <div className={`
              h-full min-h-[500px] bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col
              ${generatedImage ? '' : 'justify-center items-center text-center'}
            `}>
              <div className="flex justify-between items-center mb-4 w-full">
                <h3 className="text-lg font-semibold text-slate-800">Generated Result</h3>
                {generatedImage && (
                  <div className="flex gap-2">
                     <button 
                      onClick={handleGenerate}
                      disabled={processing.isLoading}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg"
                      title="Regenerate"
                    >
                      <RefreshIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                )}
              </div>

              {generatedImage ? (
                <div className="relative flex-1 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                  <img 
                    src={generatedImage} 
                    alt="Generated Portrait" 
                    className="w-full h-auto max-h-[700px] object-contain"
                  />
                  {/* Result Badge */}
                  <div className="absolute bottom-4 right-4 bg-indigo-600/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                    9:16 Portrait
                  </div>
                </div>
              ) : (
                <div className="max-w-sm text-slate-400">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                  </div>
                  <p className="text-lg font-medium text-slate-500">No Image Generated Yet</p>
                  <p className="text-sm mt-2">Upload a landscape image and click generate to see the 9:16 transformation here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
