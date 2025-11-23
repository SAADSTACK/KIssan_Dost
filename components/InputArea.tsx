import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2, Mic, MicOff, AlertCircle } from 'lucide-react';
import { LanguageOption, ThemeConfig } from '../types';
import { translations } from '../translations';

interface InputAreaProps {
  onSend: (text: string, image: File | null) => void;
  isLoading: boolean;
  currentLanguage: LanguageOption;
  theme: ThemeConfig;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, currentLanguage, theme }) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[currentLanguage];

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check for browser support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) {
      setIsSpeechSupported(true);
    }
  }, []);

  const getSpeechLanguage = (lang: LanguageOption): string => {
    switch (lang) {
      case 'Urdu': return 'ur-PK';
      case 'Punjabi (Pakistani)': return 'ur-PK'; 
      case 'Sindhi': return 'sd-PK'; 
      case 'Pashto': return 'ps-PK';
      case 'English': return 'en-US';
      default: return 'en-US';
    }
  };

  const handleVoiceInput = () => {
    // Clear previous errors
    setErrorMessage(null);

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLanguage(currentLanguage);
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setInputText((prev) => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${finalTranscript}` : finalTranscript;
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      
      let msg = '';
      if (event.error === 'not-allowed') {
        msg = currentLanguage === 'English' ? 'Microphone access denied. Please enable permissions.' : 'مائیکروفون کی اجازت نہیں دی گئی۔';
      } else if (event.error === 'no-speech') {
        return; // Ignore no-speech errors to avoid spamming
      } else if (event.error === 'network') {
        msg = 'Network error.';
      } else {
        msg = 'Error: ' + event.error;
      }
      
      setErrorMessage(msg);
      // Auto hide error after 4 seconds
      setTimeout(() => setErrorMessage(null), 4000);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition", e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isLoading) return;
    
    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onSend(inputText, selectedImage);
    setInputText('');
    removeImage();
    setErrorMessage(null);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-4 z-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {imagePreview && (
          <div className="relative inline-block mb-3 animate-in fade-in zoom-in duration-200">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-24 w-24 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
           <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:${theme.primaryText} hover:${theme.border} transition-colors flex-shrink-0`}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <div className="flex-grow relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.inputPlaceholder}
              className={`w-full bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 ${theme.ring} focus:ring-1 pl-4 pr-4 py-3.5 resize-none min-h-[52px] max-h-32 shadow-inner text-base placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-transparent`}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {/* Voice Input Button */}
          {isSpeechSupported && (
            <div className="relative">
              {errorMessage && (
                <div className="absolute bottom-full mb-2 right-0 w-max max-w-[200px] bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs px-2 py-1.5 rounded shadow-lg border border-red-200 dark:border-red-800 z-50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-red-100 dark:bg-red-900 border-r border-b border-red-200 dark:border-red-800 rotate-45"></div>
                </div>
              )}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-3.5 rounded-xl flex-shrink-0 transition-all flex items-center justify-center shadow-lg border ${
                  isListening 
                    ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-red-500/30' 
                    : `bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:${theme.primaryText} hover:${theme.border}`
                }`}
                title={t.voiceInput}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
            className={`p-3.5 rounded-xl flex-shrink-0 font-medium transition-all flex items-center gap-2 shadow-lg ${
              (!inputText.trim() && !selectedImage) || isLoading
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                : `${theme.accentBg} ${theme.accentBgHover} text-white border ${theme.border} hover:shadow-lg`
            }`}
          >
             {isLoading ? (
               <Loader2 className="w-5 h-5 animate-spin" />
             ) : (
               <Send className="w-5 h-5" />
             )}
             <span className="hidden md:inline">{t.askButton}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputArea;