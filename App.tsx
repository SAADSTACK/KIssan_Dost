import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import MessageBubble from './components/MessageBubble';
import SettingsModal from './components/SettingsModal';
import { Message, Role, LanguageOption, FontSizeOption, ThemeId } from './types';
import { APP_THEMES } from './themeConfig';
import { sendMessageToGemini } from './services/geminiService';
import { Sprout } from 'lucide-react';
import { translations, getDirection } from './translations';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('Urdu');
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>('green');
  const [fontSize, setFontSize] = useState<FontSizeOption>('normal');

  // Initialize theme from localStorage or system preference
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kissan-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('kissan-theme', themeMode);
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const currentTheme = APP_THEMES[selectedThemeId];

  const handleSend = async (text: string, image: File | null) => {
    // 1. Prepare User Message
    const userMessageId = Date.now().toString();
    let imageBase64: string | undefined = undefined;

    if (image) {
      imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(image);
      });
    }

    const userMessage: Message = {
      id: userMessageId,
      role: Role.USER,
      content: text,
      image: imageBase64,
      gradient: currentTheme.gradient // Store current gradient for history, but UI can override
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // 2. Create Placeholder AI Message
    const botMessageId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: botMessageId,
      role: Role.MODEL,
      content: '', // Placeholder
      isLoading: true
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // 3. Call API
      const { data, links } = await sendMessageToGemini(text, imageBase64, selectedLanguage);

      // 4. Update AI Message with Response
      setMessages((prev) => prev.map(msg => {
        if (msg.id === botMessageId) {
          return {
            ...msg,
            content: data, // This is the structured object
            isLoading: false,
            groundingLinks: links
          };
        }
        return msg;
      }));

    } catch (error) {
      console.error("Failed to get response", error);
      // Handle Error State
      let errorMessage = "Maaf kijiye, mujhe response hasil karne mein dushwari ho rahi hai. Baraye meharbani dobara koshish karein. (Sorry, I encountered an error. Please try again.)";
      
      if (error instanceof Error && error.message.includes("API Key")) {
        errorMessage = "System Error: API Key is missing or invalid. Please check your configuration.";
      }

      setMessages((prev) => prev.map(msg => {
        if (msg.id === botMessageId) {
          return {
            ...msg,
            content: errorMessage,
            isLoading: false
          };
        }
        return msg;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const t = translations[selectedLanguage];
  const direction = getDirection(selectedLanguage);
  
  // Apply Nastaliq font for Urdu/Punjabi/Sindhi/Pashto
  const fontClass = selectedLanguage === 'English' ? 'font-sans' : 'font-nastaliq';

  // Map settings to Tailwind classes
  const fontSizeClass = fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base';
  
  // Special leading for the Welcome Title to prevent overlap in Nastaliq
  const welcomeTitleLeading = selectedLanguage === 'English' ? 'leading-tight' : 'leading-[1.8]';

  return (
    <div 
      className={`min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 transition-colors duration-300 ${fontClass} ${fontSizeClass}`}
      dir={direction}
    >
      <Header 
        isDark={themeMode === 'dark'} 
        toggleTheme={toggleThemeMode} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentLanguage={selectedLanguage}
        theme={currentTheme}
      />

      {/* Main Chat Area */}
      <main className="flex-grow w-full max-w-4xl mx-auto p-4 pb-48 overflow-y-auto">
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-700">
             <div className={`w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-900/10 mb-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden group`}>
               <div className={`absolute inset-0 bg-gradient-to-tr ${currentTheme.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
               <Sprout className={`w-10 h-10 ${currentTheme.primaryText}`} />
             </div>
             <h1 className={`text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight ${welcomeTitleLeading}`}>
               {t.welcomeTitle} <br />
               <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.welcomeGradient} py-1`}>
                 {t.welcomeTitleHighlight}
               </span>
             </h1>
             <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg leading-relaxed">
               {t.welcomeSubtitle}
             </p>
          </div>
        ) : (
          <div className="flex flex-col pt-4">
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                currentLanguage={selectedLanguage}
                currentTheme={currentTheme}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

      </main>

      <InputArea 
        onSend={handleSend} 
        isLoading={isLoading} 
        currentLanguage={selectedLanguage}
        theme={currentTheme}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        selectedThemeId={selectedThemeId}
        onThemeChange={setSelectedThemeId}
        themeMode={themeMode}
        toggleTheme={toggleThemeMode}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        themeConfig={currentTheme}
      />
    </div>
  );
};

export default App;