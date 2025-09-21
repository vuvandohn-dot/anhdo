
import React, { useState, useCallback } from 'react';
import { AspectRatio, BackgroundStyle, ImageFile } from './types';
import { BACKGROUND_STYLES, ASPECT_RATIOS, MAX_FILE_SIZE_MB, MAX_PROMPT_WORDS } from './constants';
import { generateAdvertisingImage } from './services/geminiService';
import { UploadIcon, DownloadIcon, MagicWandIcon, ResetIcon, ZoomInIcon, CloseIcon, Spinner } from './components/icons';

const Header: React.FC = () => (
  <header className="text-center py-8">
    <h1 className="text-4xl font-bold text-gray-800">
      AI Quảng Cáo Sản Phẩm
    </h1>
    <p className="text-lg text-gray-500 mt-2">
      Ghép ảnh người mẫu và sản phẩm tự động bằng AI
    </p>
  </header>
);

interface FileUploadProps {
  id: string;
  label: string;
  onFileChange: (file: ImageFile | null) => void;
  imageFile: ImageFile | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ id, label, onFileChange, imageFile }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`File size should not exceed ${MAX_FILE_SIZE_MB}MB`);
        return;
      }
      onFileChange({ file, previewUrl: URL.createObjectURL(file) });
    }
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="cursor-pointer w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors">
        <UploadIcon className="w-5 h-5 mr-2" />
        {label}
      </label>
      <input id={id} type="file" className="hidden" accept="image/jpeg, image/png" onChange={handleFileChange} />
    </div>
  );
};

const ImagePreview: React.FC<{ imageFile: ImageFile | null; label: string }> = ({ imageFile, label }) => (
  <div className="w-1/2 p-2">
    <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden relative">
      {imageFile ? (
        <img src={imageFile.previewUrl} alt={label} className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
          {label}
        </div>
      )}
    </div>
  </div>
);

const App: React.FC = () => {
  const [modelImage, setModelImage] = useState<ImageFile | null>(null);
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('Người mẫu mặc váy trắng cầm sản phẩm mỹ phẩm trong studio sang trọng');
  const [background, setBackground] = useState<BackgroundStyle>('Studio');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  
  const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length;

  const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType: file.type });
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleGenerate = async () => {
    if (!modelImage || !productImage) {
      setError('Vui lòng tải lên cả ảnh người mẫu và sản phẩm.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const [modelImageData, productImageData] = await Promise.all([
        fileToBase64(modelImage.file),
        fileToBase64(productImage.file),
      ]);
      const result = await generateAdvertisingImage(modelImageData, productImageData, prompt, background, aspectRatio);
      setGeneratedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setModelImage(null);
    setProductImage(null);
    setPrompt('Người mẫu mặc váy trắng cầm sản phẩm mỹ phẩm trong studio sang trọng');
    setBackground('Studio');
    setAspectRatio('1:1');
    setGeneratedImage(null);
    setError(null);
    setIsLoading(false);
  };
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'ai_quang_cao_4k.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const isGenerateDisabled = !modelImage || !productImage || isLoading || wordCount === 0 || wordCount > MAX_PROMPT_WORDS;

  return (
    <div className="min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Left Panel: Controls */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Tải ảnh lên</h2>
              <div className="flex gap-4">
                <FileUpload id="model-upload" label="Tải ảnh người mẫu" onFileChange={setModelImage} imageFile={modelImage} />
                <FileUpload id="product-upload" label="Tải ảnh sản phẩm" onFileChange={setProductImage} imageFile={productImage} />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Hỗ trợ JPG, PNG, tối đa {MAX_FILE_SIZE_MB}MB</p>
            </div>
            
            <div>
              <label htmlFor="prompt" className="block text-lg font-semibold text-gray-800 mb-2">Mô tả hình ảnh</label>
              <div className="relative">
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  rows={4}
                  placeholder="ví dụ: Người mẫu mặc váy trắng cầm sản phẩm mỹ phẩm trong studio sang trọng"
                />
                <span className={`absolute bottom-2 right-3 text-xs ${wordCount > MAX_PROMPT_WORDS ? 'text-red-500' : 'text-gray-400'}`}>
                  {wordCount}/{MAX_PROMPT_WORDS} từ
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Cài đặt</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="background-style" className="block text-sm font-medium text-gray-700 mb-1">Bối cảnh</label>
                    <select
                      id="background-style"
                      value={background}
                      onChange={(e) => setBackground(e.target.value as BackgroundStyle)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    >
                      {BACKGROUND_STYLES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉ lệ</label>
                    <div className="flex gap-2">
                      {ASPECT_RATIOS.map(ratio => (
                        <button
                          key={ratio.value}
                          onClick={() => setAspectRatio(ratio.value)}
                          className={`flex-1 py-1.5 px-2 text-sm rounded-lg transition-all ${aspectRatio === ratio.value ? 'bg-pink-500 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          {ratio.label} ({ratio.value})
                        </button>
                      ))}
                    </div>
                  </div>
              </div>
            </div>

            <div className="mt-auto pt-6 flex flex-col gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="w-full flex items-center justify-center py-3 px-4 text-white font-bold rounded-lg shadow-md transition-all duration-300 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
              >
                {isLoading ? <Spinner className="w-6 h-6" /> : <MagicWandIcon className="w-6 h-6 mr-2" />}
                {isLoading ? 'Đang xử lý...' : 'Tạo ảnh'}
              </button>
              <div className="flex gap-3">
                 <button
                  onClick={handleReset}
                  className="w-1/2 py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <ResetIcon className="w-5 h-5 mr-2" />
                  Làm lại
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!generatedImage || isLoading}
                  className="w-1/2 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  Tải xuống 4K
                </button>
              </div>
               {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
            </div>
          </div>
          
          {/* Right Panel: Previews */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Xem trước</h2>
              <div className="flex w-full mb-4">
                  <ImagePreview imageFile={modelImage} label="Ảnh người mẫu" />
                  <ImagePreview imageFile={productImage} label="Ảnh sản phẩm" />
              </div>
               <h2 className="text-lg font-semibold text-gray-800 mb-3">Kết quả</h2>
               <div className="flex-grow w-full bg-gray-200 rounded-lg relative overflow-hidden flex items-center justify-center">
                    {isLoading && (
                        <div className="text-center text-gray-500">
                           <Spinner className="w-12 h-12 mx-auto" />
                           <p className="mt-4">AI đang sáng tạo, vui lòng chờ...</p>
                        </div>
                    )}
                    {!isLoading && generatedImage && (
                        <>
                            <img src={generatedImage} alt="Generated advertising" className="w-full h-full object-contain" />
                            <button onClick={() => setIsZoomed(true)} className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity">
                                <ZoomInIcon className="w-6 h-6" />
                            </button>
                        </>
                    )}
                    {!isLoading && !generatedImage && (
                        <div className="text-center text-gray-400 p-4">
                          <p>Kết quả AI sẽ hiển thị ở đây</p>
                        </div>
                    )}
               </div>
          </div>
        </main>
      </div>

      {isZoomed && generatedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setIsZoomed(false)}>
          <button onClick={() => setIsZoomed(false)} className="absolute top-4 right-4 p-2 text-white bg-black bg-opacity-50 rounded-full z-10">
            <CloseIcon className="w-8 h-8"/>
          </button>
          <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
             <img src={generatedImage} alt="Generated result zoomed" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
