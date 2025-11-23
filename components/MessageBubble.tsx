import React from 'react';
import { Message, Role, KissanResponse, LanguageOption, ThemeConfig } from '../types';
import { User, Bot, AlertCircle, CheckCircle2, Leaf, TrendingUp, ExternalLink } from 'lucide-react';
import { translations } from '../translations';

interface MessageBubbleProps {
  message: Message;
  currentLanguage: LanguageOption;
  currentTheme: ThemeConfig;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentLanguage, currentTheme }) => {
  const isUser = message.role === Role.USER;
  const t = translations[currentLanguage].message;

  if (isUser) {
    // Use the global theme gradient preference instead of message-specific if preferred
    // or fallback to message.gradient if present for history
    const gradientClass = currentTheme.gradient;

    return (
      <div className="flex justify-end mb-14">
        <div className="max-w-[85%] md:max-w-[70%]">
          <div className={`${gradientClass} text-white rounded-2xl rounded-tr-none px-6 py-4 shadow-md transition-all duration-300`}>
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
           <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${currentTheme.iconBg} ${currentTheme.border.replace('500', '200')}`}>
            <Bot className={`w-5 h-5 animate-pulse ${currentTheme.primaryText}`} />
           </div>
        </div>
        <div className="max-w-[85%] md:max-w-[70%]">
           <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm">
             <div className="flex space-x-2">
               <div className={`w-2 h-2 ${currentTheme.accentBg} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
               <div className={`w-2 h-2 ${currentTheme.accentBg} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
               <div className={`w-2 h-2 ${currentTheme.accentBg} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
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

  // Structured Response
  const data = message.content as KissanResponse;

  return (
    <div className="flex justify-start mb-14 group">
      <div className="mx-3 flex-shrink-0">
         <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${currentTheme.iconBg} ${currentTheme.border.replace('500', '200')}`}>
          <Bot className={`w-6 h-6 ${currentTheme.primaryText}`} />
         </div>
      </div>
      
      <div className="max-w-[95%] md:max-w-[80%]">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none shadow-xl overflow-hidden transition-colors duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
               <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${currentTheme.iconBg} ${currentTheme.iconText} ${currentTheme.border.replace('500', '200')}`}>
                 {data.advice_language || t.advisorResponse}
               </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {data.summary_heading || t.analysisResult}
            </h3>
          </div>

          <div className="p-6 space-y-8">
            
            {/* Diagnosis */}
            <div className="prose prose-invert max-w-none">
              <div className="flex items-start gap-4">
                 <div className={`mt-1 p-1.5 rounded border ${currentTheme.iconBg} ${currentTheme.iconText} ${currentTheme.border.replace('500', '200')}`}>
                    <TrendingUp className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide opacity-80">{t.diagnosis}</h4>
                   <p className="text-slate-600 dark:text-slate-300 leading-loose">{data.diagnosis_or_market_finding}</p>
                 </div>
              </div>
            </div>

            {/* Actionable Steps */}
            {data.actionable_steps && data.actionable_steps.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800/60">
                <div className="flex items-center gap-3 mb-5">
                  <CheckCircle2 className={`w-5 h-5 ${currentTheme.primaryText}`} />
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

            {/* Long Term Strategy */}
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

            {/* Grounding Links */}
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