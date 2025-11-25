import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, BookOpen, Brain, User, MapIcon, Mountain, Trophy, LogOut, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { WaveLogo } from './WaveLogo';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../utils/i18n';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    toast.success(t('logoutSuccess'));
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Made smaller and more compact */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="transform group-hover:scale-110 transition-transform duration-300">
              <WaveLogo className="w-7 h-7" />
            </div>
            <span className="text-sm bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              TethysMind
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/portfolio" className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors relative">
              <User className="w-4 h-4" />
              <span>{t('portfolio')}</span>
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/library" className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors relative">
              <BookOpen className="w-4 h-4" />
              <span>{t('library')}</span>
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/assistant" className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors relative">
              <Brain className="w-4 h-4" />
              <span>{t('aiMentor')}</span>
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/iceberg" className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors relative">
              <Mountain className="w-4 h-4" />
              <span>{t('iceberg')}</span>
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/leaderboard" className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors relative">
              <Trophy className="w-4 h-4" />
              <span>{t('leaderboard')}</span>
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/skills-map" className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors relative">
              <MapIcon className="w-4 h-4" />
              <span>{t('skills')}</span>
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/marketplace" className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors relative">
              <ShoppingCart className="w-4 h-4" />
              <span>{t('marketplace')}</span>
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Desktop CTA - More compact */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="hover:bg-accent/50">
                <User className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-accent/50" 
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border/50">
            <Link
              to="/portfolio"
              className="flex items-center gap-2 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="w-4 h-4" />
              <span>{t('portfolio')}</span>
            </Link>
            <Link
              to="/library"
              className="flex items-center gap-2 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('library')}</span>
            </Link>
            <Link
              to="/assistant"
              className="flex items-center gap-2 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Brain className="w-4 h-4" />
              <span>{t('aiMentor')}</span>
            </Link>
            <Link
              to="/iceberg"
              className="flex items-center gap-2 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Mountain className="w-4 h-4" />
              <span>{t('iceberg')}</span>
            </Link>
            <Link
              to="/leaderboard"
              className="flex items-center gap-2 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Trophy className="w-4 h-4" />
              <span>{t('leaderboard')}</span>
            </Link>
            <Link
              to="/skills-map"
              className="flex items-center gap-2 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <MapIcon className="w-4 h-4" />
              <span>{t('skills')}</span>
            </Link>
            <Link
              to="/marketplace"
              className="flex items-center gap-2 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('marketplace')}</span>
            </Link>
            <div className="flex flex-col gap-2 px-4 pt-2">
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  {t('profile')}
                </Button>
              </Link>
              <Link to="/portfolio" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500">
                  {t('startJourney')}
                </Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}