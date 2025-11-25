import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { BookOpen, Brain, User, ArrowRight, Waves, Compass, TrendingUp } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export function HomePage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section with Wave Animation */}
      <section className="relative overflow-hidden min-h-screen">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
          <div className="absolute inset-0 opacity-30">
            <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 800">
              <defs>
                <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                fill="url(#wave1)"
                d="M0,160 Q360,80 720,160 T1440,160 L1440,800 L0,800 Z"
              >
                <animate
                  attributeName="d"
                  dur="15s"
                  repeatCount="indefinite"
                  values="
                    M0,160 Q360,80 720,160 T1440,160 L1440,800 L0,800 Z;
                    M0,160 Q360,240 720,160 T1440,160 L1440,800 L0,800 Z;
                    M0,160 Q360,80 720,160 T1440,160 L1440,800 L0,800 Z
                  "
                />
              </path>
              <path
                fill="url(#wave1)"
                d="M0,240 Q360,160 720,240 T1440,240 L1440,800 L0,800 Z"
                opacity="0.5"
              >
                <animate
                  attributeName="d"
                  dur="20s"
                  repeatCount="indefinite"
                  values="
                    M0,240 Q360,160 720,240 T1440,240 L1440,800 L0,800 Z;
                    M0,240 Q360,320 720,240 T1440,240 L1440,800 L0,800 Z;
                    M0,240 Q360,160 720,240 T1440,240 L1440,800 L0,800 Z
                  "
                />
              </path>
              <path
                fill="url(#wave1)"
                d="M0,320 Q360,240 720,320 T1440,320 L1440,800 L0,800 Z"
                opacity="0.3"
              >
                <animate
                  attributeName="d"
                  dur="25s"
                  repeatCount="indefinite"
                  values="
                    M0,320 Q360,240 720,320 T1440,320 L1440,800 L0,800 Z;
                    M0,320 Q360,400 720,320 T1440,320 L1440,800 L0,800 Z;
                    M0,320 Q360,240 720,320 T1440,320 L1440,800 L0,800 Z
                  "
                />
              </path>
            </svg>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-full border border-blue-200/50 dark:border-blue-800/50">
              <Waves className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <span className="text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {t('unlimitedGrowth')}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight max-w-5xl mx-auto px-4">
              {t('homeTitle')}{' '}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                TethysMind
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              {t('homeSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4 px-4">
              <Link to="/portfolio" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 text-base sm:text-lg px-6 sm:px-8 h-11 sm:h-12">
                  {t('startToday')}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/library" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-950 text-base sm:text-lg px-6 sm:px-8 h-11 sm:h-12">
                  {t('exploreFeatures')}
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {t('whyChoose')}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
              {t('comprehensivePlatformDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Portfolio Card */}
            <Link to="/portfolio" className="group">
              <Card className="h-full p-6 sm:p-8 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/30">
                <div className="space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                    <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl">{t('portfolioTitle')}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {t('portfolioDesc')}
                  </p>
                  <div className="flex items-center text-blue-600 group-hover:gap-2 transition-all">
                    <span className="text-sm">{t('startJourney')}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>

            {/* Library Card */}
            <Link to="/library" className="group">
              <Card className="h-full p-6 sm:p-8 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-900 dark:to-cyan-950/30">
                <div className="space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/30">
                    <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl">{t('libraryTitle')}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {t('libraryDesc')}
                  </p>
                  <div className="flex items-center text-cyan-600 group-hover:gap-2 transition-all">
                    <span className="text-sm">{t('library')}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>

            {/* Assistant Card */}
            <Link to="/assistant" className="group">
              <Card className="h-full p-6 sm:p-8 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/30">
                <div className="space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/30">
                    <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl">{t('aiMentorTitle')}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {t('aiMentorDesc')}
                  </p>
                  <div className="flex items-center text-indigo-600 group-hover:gap-2 transition-all">
                    <span className="text-sm">{t('aiMentor')}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl">∞</div>
              <p className="text-xl sm:text-2xl opacity-90">{t('unlimitedGrowthStat')}</p>
              <p className="text-blue-100 text-xs sm:text-sm">{t('likeOcean')}</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl flex items-center justify-center gap-2">
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <p className="text-xl sm:text-2xl opacity-90">{t('personalPath')}</p>
              <p className="text-blue-100 text-xs sm:text-sm">{t('uniqueForYou')}</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl">24/7</div>
              <p className="text-xl sm:text-2xl opacity-90">{t('assistantNearby')}</p>
              <p className="text-blue-100 text-xs sm:text-sm">{t('alwaysOnline')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-blue-50/30 to-white dark:from-blue-950/20 dark:to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl px-4">
            {t('readyToStart')}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              TethysMind?
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {t('joinThousands')}
          </p>
          
          <Link to="/portfolio" className="inline-block">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 text-base sm:text-lg px-8 sm:px-12 h-12 sm:h-14">
              {t('diveIntoTethys')}
              <Waves className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}