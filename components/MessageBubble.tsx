import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, KissanResponse, LanguageOption, ThemeConfig } from '../types';
import { User, Bot, AlertCircle, CheckCircle2, Leaf, TrendingUp, ExternalLink, Volume2, StopCircle, Loader2 } from 'lucide-react';
import { translations } from '../translations';
import { generateSpeech } from '../services/geminiService';

interface MessageBubbleProps {
  message: Message;
  currentLanguage: LanguageOption;
  currentTheme: ThemeConfig;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentLanguage, currentTheme }) => {
  const isUser = message.role === Role.USER;
  const t = translations[currentLanguage].message;
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        // ignore if already stopped
      }
      sourceRef.current = null;
    }
    // Close context to release hardware resources
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
       audioContextRef.current.close().catch(() => {});
       audioContextRef.current = null;
    }
    // Also cancel browser speech if any
    window.speechSynthesis.cancel();
    
    setIsSpeaking(false);
    setIsLoadingAudio(false);
  };

  const playAudio = async (base64Audio: string) => {
    try {
      // Initialize Audio Context WITHOUT forcing sampleRate. 
      // Letting the browser pick the hardware rate (usually 44.1k or 48k) prevents crashes on mobile.
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      // Decode Base64 to Byte Array
      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Manual Little-Endian Decoding of Int16 PCM
      // This is safer than new Int16Array(bytes.buffer) which depends on system endianness
      // and byte alignment. Gemini sends Little-Endian 16-bit PCM.
      const float32Data = new Float32Array(len / 2);
      for (let i = 0; i < len; i += 2) {
        const lo = bytes[i];
        const hi = bytes[i + 1];
        // Combine bytes to get 16-bit integer (Little Endian)
        let val = (hi << 8) | lo;
        // Sign extension for 16-bit signed integer
        if (val & 0x8000) val = val - 65536;
        // Normalize to [-1.0, 1.0]
        float32Data[i / 2] = val / 32768.0;
      }

      // Create Buffer with the source sample rate (Gemini TTS is 24kHz).
      // The AudioContext will automatically resample this to the system rate during playback.
      const audioBuffer = audioCtx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      // Create Source
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
        sourceRef.current = null;
      };
      
      sourceRef.current = source;
      source.start(0);
      setIsSpeaking(true);
      setIsLoadingAudio(false);

    } catch (error) {
      console.error("Audio Playback Error:", error);
      setIsSpeaking(false);
      setIsLoadingAudio(false);
    }
  };

  const handleSpeak = async (textToSpeak: string, language: string) => {
    if (isSpeaking || isLoadingAudio) {
      stopAudio();
      return;
    }

    setIsLoadingAudio(true);
    
    // 1. Try Gemini TTS first (High Quality for Urdu/Punjabi)
    const base64Audio = await generateSpeech(textToSpeak);
    
    if (base64Audio) {
      playAudio(base64Audio);
    } else {
      // 2. Fallback to Browser TTS (Low Quality / Missing Voices)
      setIsLoadingAudio(false);
      console.warn("Falling back to browser TTS");
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      let langCode = 'en-US';
      const lowerLang = language ? language.toLowerCase() : 'english';
      if (lowerLang.includes('urdu')) langCode = 'ur-PK';
      else if (lowerLang.includes('punjabi')) langCode = 'ur-PK'; 
      else if (lowerLang.includes('sindhi')) langCode = 'sd-PK';
      else if (lowerLang.includes('pashto')) langCode = 'ps-PK';
      
      utterance.lang = langCode;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (isUser) {
    const gradientClass = currentTheme.gradient;

    return (
      <div className="flex justify-end mb-14">
        <div className="max-w-[85%] md:max-w-[70%]">
          <div className={`${gradientClass} text-white rounded-2xl rounded-tr-none px-6 py-4 shadow-md transition-all duration-700 ease-in-out`}>
            {message.image && (
              <img 
                src={message.image} 
                alt="Uploaded crop" 
                className="w-full h-48 object-cover rounded-lg mb-3 border border-white/20"
              />
            )}
            <p className="whitespace-pre-wrap leading-relaxed drop-shadow-sm">{message.content as string}</p>
          </div>
        </div>
        <div className="mx-3 flex-shrink-0">
           <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700">
            <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
           </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (message.isLoading) {
    return (
      <div className="flex justify-start mb-14">
        <div className="mx-3 flex-shrink-0">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${currentTheme.iconBg} ${currentTheme.border.replace('500', '200')} transition-colors duration-500`}>
            <Bot className={`w-5 h-5 animate-pulse ${currentTheme.primaryText} transition-colors duration-500`} />
           </div>
        </div>
        <div className="max-w-[85%] md:max-w-[70%]">
           <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm">
             <div className="flex space-x-2">
               <div className={`w-2 h-2 ${currentTheme.accentBg} rounded-full animate-bounce transition-colors duration-500`} style={{ animationDelay: '0ms' }}></div>
               <div className={`w-2 h-2 ${currentTheme.accentBg} rounded-full animate-bounce transition-colors duration-500`} style={{ animationDelay: '150ms' }}></div>
               <div className={`w-2 h-2 ${currentTheme.accentBg} rounded-full animate-bounce transition-colors duration-500`} style={{ animationDelay: '300ms' }}></div>
             </div>
             <p className="text-xs text-slate-500 mt-2 font-medium">{t.analyzing}</p>
           </div>
        </div>
      </div>
    );
  }

  // Error State
  if (typeof message.content === 'string') {
    return (
      <div className="flex justify-start mb-14">
        <div className="mx-3 flex-shrink-0">
           <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center border border-red-200 dark:border-red-900/50">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
           </div>
        </div>
        <div className="max-w-[85%] md:max-w-[70%]">
           <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm">
             <h4 className="font-semibold text-red-600 dark:text-red-400 mb-1">{t.errorTitle}</h4>
             <p className="text-slate-600 dark:text-slate-300">{message.content}</p>
           </div>
        </div>
      </div>
    );
  }

  const data = message.content as KissanResponse;
  // Concatenate all parts for a smooth flow
  const speechText = `${data.summary_heading}. ${data.diagnosis_or_market_finding}. ${data.actionable_steps ? data.actionable_steps.join('. ') : ''}. ${data.long_term_strategy || ''}`;

  return (
    <div className="flex justify-start mb-14 group">
      <div className="mx-3 flex-shrink-0">
         <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${currentTheme.iconBg} ${currentTheme.border.replace('500', '200')} transition-colors duration-500`}>
          <Bot className={`w-6 h-6 ${currentTheme.primaryText} transition-colors duration-500`} />
         </div>
      </div>
      
      <div className="max-w-[95%] md:max-w-[80%]">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none shadow-xl overflow-hidden transition-colors duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
               <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${currentTheme.iconBg} ${currentTheme.iconText} ${currentTheme.border.replace('500', '200')} transition-colors duration-500`}>
                 {data.advice_language || t.advisorResponse}
               </span>
               
               {/* TTS Button */}
               <button
                 onClick={() => handleSpeak(speechText, data.advice_language)}
                 className={`p-2 rounded-full transition-colors ${
                   isSpeaking || isLoadingAudio
                     ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                     : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                 }`}
                 title={isSpeaking ? "Stop Speaking" : "Listen to Advice"}
                 aria-label={isSpeaking ? "Stop Speaking" : "Listen to Advice"}
                 disabled={isLoadingAudio}
               >
                 {isLoadingAudio ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : isSpeaking ? (
                   <StopCircle className="w-5 h-5" />
                 ) : (
                   <Volume2 className="w-5 h-5" />
                 )}
               </button>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {data.summary_heading || t.analysisResult}
            </h3>
          </div>

          <div className="p-6 space-y-8">
            {/* Content Rendering... */}
            <div className="prose prose-invert max-w-none">
              <div className="flex items-start gap-4">
                 <div className={`mt-1 p-1.5 rounded border ${currentTheme.iconBg} ${currentTheme.iconText} ${currentTheme.border.replace('500', '200')} transition-colors duration-500`}>
                    <TrendingUp className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide opacity-80">{t.diagnosis}</h4>
                   <p className="text-slate-600 dark:text-slate-300 leading-loose">{data.diagnosis_or_market_finding}</p>
                 </div>
              </div>
            </div>

            {data.actionable_steps && data.actionable_steps.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800/60">
                <div className="flex items-center gap-3 mb-5">
                  <CheckCircle2 className={`w-5 h-5 ${currentTheme.primaryText} transition-colors duration-500`} />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{t.actionPlan}</h4>
                </div>
                <ul className="space-y-4">
                  {data.actionable_steps.map((step, idx) => (
                    <li key={idx} className="flex gap-4 text-slate-700 dark:text-slate-300 leading-loose">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 shadow-sm mt-1">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.long_term_strategy && (
              <div className="flex items-start gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <div className="mt-1 p-1.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-500">
                   <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-600 dark:text-amber-500 mb-2 uppercase tracking-wide opacity-80">{t.strategicAdvice}</h4>
                  <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed">"{data.long_term_strategy}"</p>
                </div>
              </div>
            )}

            {message.groundingLinks && message.groundingLinks.length > 0 && (
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
                 <p className="text-xs text-slate-500 mb-3 font-medium uppercase">{t.sources}</p>
                 <div className="flex flex-wrap gap-2">
                   {message.groundingLinks.map((link, i) => (
                     <a 
                      key={i} 
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-2 py-1.5 rounded border border-blue-200 dark:border-blue-900/30 transition-colors"
                     >
                       <ExternalLink className="w-3 h-3" />
                       <span className="max-w-[150px] truncate">{link.title}</span>
                     </a>
                   ))}
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;