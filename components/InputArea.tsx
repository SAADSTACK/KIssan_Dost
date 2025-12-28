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
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
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

  const handleVoiceInput = async () => {
    setErrorMessage(null);

    // If already listening, stop it
    if (isListening) {
      if (recognitionRef.current) {
        try {
           recognitionRef.current.stop();
        } catch (e) {
           console.warn("Could not stop recognition", e);
        }
      }
      setIsListening(false);
      return;
    }

    // 1. Explicitly request permission to trigger the browser prompt
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Permission granted, stop the stream immediately as we just needed the permission
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Microphone permission denied", err);
      const msg = currentLanguage === 'English'
        ? 'Microphone access denied. Please allow permission.'
        : 'مائیکروفون کی اجازت نہیں دی گئی۔';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    // 2. Start Speech Recognition
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
        msg = currentLanguage === 'English' 
            ? 'Microphone blocked. Check browser settings.' 
            : 'مائیکروفون بلاک ہے۔';
      } else if (event.error === 'no-speech') {
        return; 
      } else if (event.error === 'network') {
        msg = 'Network error.';
      } else {
        msg = 'Error: ' + event.error;
      }
      
      if (msg) {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(null), 5000);
      }
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition", e);
      setErrorMessage("Failed to start microphone.");
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
    
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch(e) { /* ignore */ }
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
              aria-label="Remove image"
              className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ring} dark:focus:ring-offset-slate-900`}
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
           <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload Image"
            className={`w-[52px] h-[52px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:${theme.primaryText} hover:${theme.border} transition-colors flex-shrink-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ring} dark:focus:ring-offset-slate-950`}
          >
            <ImageIcon className="w-5 h-5" aria-hidden="true" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            aria-hidden="true"
          />

          <div className="flex-grow relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.inputPlaceholder}
              aria-label="Message input"
              className={`w-full bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 ${theme.ring} focus:ring-1 pl-4 pr-4 py-3.5 resize-none min-h-[52px] max-h-32 shadow-inner text-base placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-transparent focus:outline-none`}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {/* Voice Input Button - Inline */}
          {isSpeechSupported && (
            <div className="relative flex-shrink-0">
              {errorMessage && (
                <div 
                  role="alert" 
                  className="absolute bottom-full mb-2 right-0 w-max max-w-[200px] bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs px-3 py-2 rounded-lg shadow-xl border border-red-200 dark:border-red-800 z-50 animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="leading-snug">{errorMessage}</span>
                  </div>
                  <div className="absolute top-full right-4 -mt-1.5 w-3 h-3 bg-red-100 dark:bg-red-900 border-r border-b border-red-200 dark:border-red-800 rotate-45"></div>
                </div>
              )}
              <button
                type="button"
                onClick={handleVoiceInput}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                className={`w-[52px] h-[52px] flex items-center justify-center rounded-xl transition-all shadow-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ring} dark:focus:ring-offset-slate-950 ${
                  isListening 
                    ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-red-500/30' 
                    : `bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:${theme.primaryText} hover:${theme.border}`
                }`}
                title={t.voiceInput}
              >
                {isListening ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
            aria-label={t.askButton}
            className={`h-[52px] px-5 rounded-xl flex-shrink-0 font-medium transition-all flex items-center justify-center gap-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ring} dark:focus:ring-offset-slate-950 ${
              (!inputText.trim() && !selectedImage) || isLoading
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                : `${theme.accentBg} ${theme.accentBgHover} text-white border ${theme.border} hover:shadow-lg`
            }`}
          >
             {isLoading ? (
               <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
             ) : (
               <Send className="w-5 h-5" aria-hidden="true" />
             )}
             <span className="hidden md:inline">{t.askButton}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputArea;