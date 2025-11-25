import { Link } from 'react-router-dom';
import { WaveLogo } from './WaveLogo';
import { useTranslation } from '../utils/i18n';

export function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="border-t border-blue-200 dark:border-blue-800 bg-gradient-to-b from-background to-blue-50/20 dark:to-blue-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WaveLogo className="w-6 h-6" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              TethysMind
            </span>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            © 2025 TethysMind. {t('unlimitedGrowth')}.
          </p>
        </div>
      </div>
    </footer>
  );
}