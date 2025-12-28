import React from 'react';
import { Sprout, Sun, Moon, Settings, Search, X, Menu } from 'lucide-react';
import { LanguageOption, ThemeConfig } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onOpenSettings: () => void;
  currentLanguage: LanguageOption;
  theme: ThemeConfig;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isDark, 
  toggleTheme, 
  onOpenSettings, 
  currentLanguage, 
  theme,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  setIsSearchOpen,
  onToggleSidebar
}) => {
  const t = translations[currentLanguage];

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    onSearchChange('');
  };

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 py-4 lg:py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10 transition-colors duration-300">
      
      {isSearchOpen ? (
        <div className="flex-1 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative flex-grow">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.secondaryText}`} />
            <input 
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent`}
            />
          </div>
          <button 
            onClick={handleCloseSearch}
            className={`p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={onToggleSidebar}
              className={`lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Dynamic Theme Background */}
            <div className={`p-3 rounded-xl shadow-lg ${theme.accentBg} bg-opacity-90`} aria-hidden="true">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              {/* Relaxed leading helps accommodate tall Nastaliq characters */}
              <h1 className={`text-2xl lg:text-3xl font-bold leading-relaxed ${theme.primaryText}`}>{t.appTitle}</h1>
              {/* Margin top pushes the subtitle down to clear descenders */}
              <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-2 lg:mt-3 hidden sm:block">{t.aiPlatform}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3 text-slate-500 dark:text-slate-400">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className={`transition-colors p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:${theme.primaryText} focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ring} dark:focus:ring-offset-slate-950`}
              title="Search"
              aria-label="Search"
            >
              <Search className="w-6 h-6" aria-hidden="true" />
            </button>
            <button 
              onClick={toggleTheme}
              className={`hidden sm:block transition-colors p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:${theme.primaryText} focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ring} dark:focus:ring-offset-slate-950`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-6 h-6" aria-hidden="true" /> : <Moon className="w-6 h-6" aria-hidden="true" />}
            </button>
            <button 
              onClick={onOpenSettings}
              className={`transition-colors p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:${theme.primaryText} focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ring} dark:focus:ring-offset-slate-950`}
              title={t.settings.title}
              aria-label={t.settings.title}
            >
              <Settings className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;