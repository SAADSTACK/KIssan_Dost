import React from 'react';
import { Sprout, Sun, Moon, Settings } from 'lucide-react';
import { LanguageOption, ThemeConfig } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onOpenSettings: () => void;
  currentLanguage: LanguageOption;
  theme: ThemeConfig;
}

const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme, onOpenSettings, currentLanguage, theme }) => {
  const t = translations[currentLanguage];

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-3">
        {/* Dynamic Theme Background */}
        <div className={`p-2 rounded-lg shadow-lg ${theme.accentBg} bg-opacity-90`}>
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-bold leading-none ${theme.primaryText}`}>{t.appTitle}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">{t.aiPlatform}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
        <button 
          onClick={toggleTheme}
          className={`transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:${theme.primaryText}`}
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button 
          onClick={onOpenSettings}
          className={`transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:${theme.primaryText}`}
          title={t.settings.title}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;