import { useI18n, type Language } from '../utils/i18n';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    // No reload needed - updateCounter will trigger re-render
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30 h-9 px-2 sm:px-3 text-sm font-medium"
          title="Change Language"
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <Languages className="w-4 h-4" />
            <span className="text-xs uppercase font-medium">{language}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        key={language}
        align="end" 
        className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-700 min-w-[160px]"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer ${
              language === lang.code 
                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                : 'hover:bg-blue-50 dark:hover:bg-blue-950/50'
            }`}
          >
            <span className="mr-2 text-lg">{lang.flag}</span>
            <span className="flex-1">{lang.label}</span>
            {language === lang.code && (
              <span className="ml-auto text-blue-600 font-bold">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}