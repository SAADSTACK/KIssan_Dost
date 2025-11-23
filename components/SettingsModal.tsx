import React from 'react';
import { X, Languages, Palette, Check, Type } from 'lucide-react';
import { LanguageOption, FontSizeOption, ThemeId, ThemeConfig } from '../types';
import { translations, getDirection } from '../translations';
import { APP_THEMES } from '../themeConfig';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: LanguageOption;
  onLanguageChange: (lang: LanguageOption) => void;
  selectedThemeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  fontSize: FontSizeOption;
  onFontSizeChange: (size: FontSizeOption) => void;
  themeConfig: ThemeConfig;
}

const languages: LanguageOption[] = ['Urdu', 'Punjabi (Pakistani)', 'English', 'Sindhi', 'Pashto'];

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onLanguageChange,
  selectedThemeId,
  onThemeChange,
  themeMode,
  toggleTheme,
  fontSize,
  onFontSizeChange,
  themeConfig
}) => {
  if (!isOpen) return null;

  const t = translations[selectedLanguage].settings;
  const direction = getDirection(selectedLanguage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        dir={direction}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-10">
          
          {/* Language Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Languages className={`w-5 h-5 ${themeConfig.primaryText}`} />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t.language}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-between ${
                    selectedLanguage === lang
                      ? `${themeConfig.lightBg} ${themeConfig.primaryText} ${themeConfig.border.replace('500', '200')}`
                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {lang}
                  {selectedLanguage === lang && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </section>

          {/* Appearance Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Palette className={`w-5 h-5 ${themeConfig.primaryText}`} />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t.appearance}</h3>
            </div>
            
            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="font-medium text-slate-700 dark:text-slate-300">{t.darkMode}</span>
                {/* Force LTR for the button to keep switch mechanics consistent */}
                <button
                  dir="ltr"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${themeConfig.ring} ${
                    themeMode === 'dark' ? themeConfig.accentBg : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      themeMode === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

               {/* Font Size Selector */}
               <div>
                <div className="flex items-center gap-2 mb-3">
                    <Type className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block">{t.fontSize}</label>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(['small', 'normal', 'large'] as FontSizeOption[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => onFontSizeChange(size)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        fontSize === size
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {t.fontSizeOptions[size]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient Picker */}
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 block">{t.bubbleStyle}</label>
                <div className="flex gap-4">
                  {(Object.values(APP_THEMES) as ThemeConfig[]).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => onThemeChange(theme.id)}
                      className={`w-9 h-9 rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${theme.gradient} ${
                        selectedThemeId === theme.id 
                          ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' 
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className={`w-full py-3.5 rounded-xl text-white font-bold hover:opacity-90 transition-opacity shadow-lg ${themeConfig.accentBg}`}
          >
            {t.done}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;