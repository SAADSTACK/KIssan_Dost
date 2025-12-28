import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import MessageBubble from './components/MessageBubble';
import SettingsModal from './components/SettingsModal';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import { Message, Role, LanguageOption, FontSizeOption, ThemeId, KissanResponse, User, ChatSession } from './types';
import { APP_THEMES } from './themeConfig';
import { sendMessageToGemini } from './services/geminiService';
import { Sprout, SearchX } from 'lucide-react';
import { translations, getDirection } from './translations';

const App: React.FC = () => {
  // --- Global State ---
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // --- Chat & Session State ---
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- UI/Config State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('English');
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>('green');
  const [fontSize, setFontSize] = useState<FontSizeOption>('normal');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Theme Initialization ---
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

  // --- Lifecycle: Theme & Auth & Sessions ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('kissan-theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    // Restore User
    const savedUser = localStorage.getItem('kissan-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Restore Sessions
    const savedSessions = localStorage.getItem('kissan-sessions');
    if (savedSessions) {
      setChatSessions(JSON.parse(savedSessions));
    }

    setIsAuthChecking(false);
  }, []);

  // Save Sessions on change
  useEffect(() => {
    if (!isAuthChecking) {
      localStorage.setItem('kissan-sessions', JSON.stringify(chatSessions));
    }
  }, [chatSessions, isAuthChecking]);

  // Update current messages when session ID changes
  useEffect(() => {
    if (currentSessionId) {
      const session = chatSessions.find(s => s.id === currentSessionId);
      if (session) {
        setMessages(session.messages);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [currentSessionId, chatSessions]);

  useEffect(() => {
    const langCode = selectedLanguage === 'English' ? 'en' 
      : selectedLanguage === 'Urdu' ? 'ur' 
      : selectedLanguage === 'Punjabi (Pakistani)' ? 'pa'
      : selectedLanguage === 'Sindhi' ? 'sd'
      : 'ps';
    document.documentElement.lang = langCode;
  }, [selectedLanguage]);

  // --- Handlers ---
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('kissan-user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kissan-user');
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const handleDeleteSession = (id: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== id);
    setChatSessions(updatedSessions);
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  const toggleThemeMode = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!searchQuery) {
      scrollToBottom();
    }
  }, [messages, searchQuery]);

  const currentTheme = APP_THEMES[selectedThemeId];

  // Helper to check if a message matches the search query
  const messageMatchesSearch = (msg: Message, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();

    if (typeof msg.content === 'string') {
      return msg.content.toLowerCase().includes(lowerQuery);
    }

    const data = msg.content as KissanResponse;
    const searchableText = [
      data.summary_heading,
      data.diagnosis_or_market_finding,
      data.long_term_strategy,
      ...(data.actionable_steps || [])
    ].join(' ').toLowerCase();

    return searchableText.includes(lowerQuery);
  };

  const filteredMessages = messages.filter(msg => messageMatchesSearch(msg, searchQuery));

  const handleSend = async (text: string, image: File | null) => {
    // Generate IDs
    const userMessageId = Date.now().toString();
    const botMessageId = (Date.now() + 1).toString();

    // 1. Process Image
    let imageBase64: string | undefined = undefined;
    if (image) {
      imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(image);
      });
    }

    // 2. Create User Message Object
    const userMessage: Message = {
      id: userMessageId,
      role: Role.USER,
      content: text,
      image: imageBase64,
      gradient: currentTheme.gradient
    };

    // 3. Create Placeholder Bot Message
    const loadingMessage: Message = {
      id: botMessageId,
      role: Role.MODEL,
      content: '',
      isLoading: true
    };

    // 4. Update or Create Session
    let activeSessionId = currentSessionId;
    let newMessages = [...messages, userMessage, loadingMessage];

    if (!activeSessionId) {
      activeSessionId = Date.now().toString();
      const newSession: ChatSession = {
        id: activeSessionId,
        title: text.slice(0, 30) + (text.length > 30 ? '...' : ''), // Simple title generation
        messages: newMessages,
        timestamp: Date.now()
      };
      setChatSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(activeSessionId);
    } else {
      // Update existing session
      setChatSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: newMessages, timestamp: Date.now() };
        }
        return s;
      }));
    }

    // Update local messages state immediately for UI response
    setMessages(newMessages);
    setIsLoading(true);
    
    // Clear search
    if (searchQuery) {
      setSearchQuery('');
      setIsSearchOpen(false);
    }

    try {
      // 5. Call API
      const { data, links } = await sendMessageToGemini(text, imageBase64, selectedLanguage);

      // 6. Update Bot Message with Response in Session
      setChatSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          const updatedMsgs = s.messages.map(msg => {
            if (msg.id === botMessageId) {
              return {
                ...msg,
                content: data,
                isLoading: false,
                groundingLinks: links
              };
            }
            return msg;
          });
          return { ...s, messages: updatedMsgs };
        }
        return s;
      }));

    } catch (error) {
      console.error("Failed to get response", error);
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      
      if (error instanceof Error && error.message.includes("API Key")) {
        errorMessage = "System Error: API Key is missing or invalid.";
      }

      setChatSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          const updatedMsgs = s.messages.map(msg => {
            if (msg.id === botMessageId) {
              return {
                ...msg,
                content: errorMessage,
                isLoading: false
              };
            }
            return msg;
          });
          return { ...s, messages: updatedMsgs };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const t = translations[selectedLanguage];
  const direction = getDirection(selectedLanguage);
  const fontClass = selectedLanguage === 'English' ? 'font-sans' : 'font-nastaliq';
  const fontSizeClass = fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base';
  const welcomeTitleLeading = selectedLanguage === 'English' ? 'leading-tight' : 'leading-[1.8]';

  // --- Auth Render ---
  if (!user && !isAuthChecking) {
    return <AuthScreen onLogin={handleLogin} theme={currentTheme} />;
  }

  // --- Main App Render ---
  return (
    <div 
      className={`h-screen flex bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 transition-colors duration-300 ${fontClass} ${fontSizeClass}`}
      dir={direction}
    >
      {/* Sidebar */}
      {user && (
        <Sidebar 
          sessions={chatSessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          user={user}
          onLogout={handleLogout}
          theme={currentTheme}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          isDark={themeMode === 'dark'} 
          toggleTheme={toggleThemeMode} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentLanguage={selectedLanguage}
          theme={currentTheme}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Chat Area */}
        <main className="flex-grow w-full max-w-4xl mx-auto p-4 pb-48 overflow-y-auto">
          
          {messages.length === 0 && !searchQuery ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-700">
               <div className={`w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-900/10 mb-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden group`} aria-hidden="true">
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
              {filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    currentLanguage={selectedLanguage}
                    currentTheme={currentTheme}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <SearchX className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">{t.noResults}</p>
                </div>
              )}
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
      </div>

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