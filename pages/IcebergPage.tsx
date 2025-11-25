import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { RankBadge } from '../components/RankBadge';
import { TrendingUp, Crown, Award } from 'lucide-react';
import { calculateRank } from '../utils/points';
import { RANKS } from '../utils/points';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../utils/api';
import { useTranslation } from '../utils/i18n';
import { motion } from 'motion/react';

export function IcebergPage() {
  const { user, activeUserId } = useAuth();
  const { t } = useTranslation();
  const [totalPoints, setTotalPoints] = useState(0);
  const [targetUniversity, setTargetUniversity] = useState<any>(null);
  const [admissionChance, setAdmissionChance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load portfolio data and profile to get total points and target university
  useEffect(() => {
    loadData();
  }, [activeUserId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load portfolio for points
      const portfolioData = await api.getPortfolio();
      setTotalPoints(portfolioData.totalPoints || user?.tethysPoints || 0);
      
      // Load profile for target university
      const profileData = await api.getProfile();
      if (profileData.targetUniversity) {
        setTargetUniversity(profileData.targetUniversity);
        setAdmissionChance(profileData.targetUniversity.probability || 0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to user points
      setTotalPoints(user?.tethysPoints || 0);
    } finally {
      setLoading(false);
    }
  };

  const maxPoints = 3000;
  const percentage = Math.min((totalPoints / maxPoints) * 100, 100);
  const { current, next, progress } = calculateRank(totalPoints);

  // Iceberg visibility now based on admission chance: 15% at 0%, 85% at 100%
  const visiblePercentage = 15 + (admissionChance * 0.7);
  
  // Fixed water line at center (450px in 900px viewBox)
  const waterLineY = 450;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 text-cyan-100 drop-shadow-lg">
            {t('achievementIceberg')}
          </h1>
          <p className="text-xl text-cyan-200/70">
            {t('morePointsHigher')}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Stats */}
          <div className="space-y-6">
            {/* Target University Card */}
            {targetUniversity && (
              <Card className="bg-slate-800/50 backdrop-blur-md border-2 border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-100">
                    🎯 {t('targetUniversity')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-lg text-cyan-100 mb-1">
                      {targetUniversity.name}
                    </div>
                    <div className="text-sm text-cyan-300/60">
                      {targetUniversity.location}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-cyan-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-cyan-200/70">{t('admissionChance')}</span>
                      <span className="text-3xl bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                        {admissionChance.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-cyan-500 transition-all duration-500"
                        style={{ width: `${admissionChance}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800/50 backdrop-blur-md border-2 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-100">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  {t('statistics')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-200/70">TethysPoints</span>
                    <span className="text-3xl bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                      {totalPoints}
                    </span>
                  </div>
                  <div className="text-sm text-cyan-300/60">
                    {t('toMaximum')}: {maxPoints - totalPoints} TP
                  </div>
                </div>

                <div className="pt-4 border-t border-cyan-500/20">
                  <RankBadge points={totalPoints} showProgress />
                </div>

                <div className="pt-4 border-t border-cyan-500/20">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-cyan-200/70">{t('aboveWater')}</span>
                      <span className="text-cyan-100">{visiblePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-md border-2 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-100">{t('legend')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-sky-200 to-cyan-300 border border-cyan-400 rounded"></div>
                  <span className="text-sm text-cyan-200/70">{t('aboveWaterPart')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-600 rounded"></div>
                  <span className="text-sm text-cyan-200/70">{t('underwaterPart')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-cyan-400 border-t-2 border-cyan-300 rounded"></div>
                  <span className="text-sm text-cyan-200/70">{t('waterLevel')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - LOW-POLY ICEBERG */}
          <div className="xl:col-span-2">
            <Card className="bg-slate-800/50 backdrop-blur-md border-2 border-cyan-500/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-[600px] md:h-[900px] overflow-hidden">
                  <svg
                    viewBox="0 0 800 870"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      {/* Background Gradient */}
                      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#7dd3fc" />
                        <stop offset="45%" stopColor="#38bdf8" />
                        <stop offset="55%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                      </linearGradient>

                      {/* Water overlay gradient */}
                      <linearGradient id="waterOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#0284c7" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.7" />
                      </linearGradient>
                    </defs>

                    {/* LAYER 1: Background Gradient */}
                    <rect x="0" y="0" width="800" height="900" fill="url(#bgGradient)" />

                    {/* LAYER 1.5: Clouds - Drifting */}
                    <motion.g 
                      opacity="0.3"
                      animate={{ x: [-20, 20, -20] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* Clouds - more coverage */}
                      <ellipse cx="150" cy="40" rx="50" ry="25" fill="#ffffff" />
                      <ellipse cx="175" cy="35" rx="45" ry="22" fill="#ffffff" />
                      <ellipse cx="125" cy="45" rx="40" ry="20" fill="#ffffff" />
                      
                      <ellipse cx="650" cy="30" rx="60" ry="30" fill="#ffffff" />
                      <ellipse cx="680" cy="25" rx="50" ry="25" fill="#ffffff" />
                      <ellipse cx="620" cy="35" rx="45" ry="22" fill="#ffffff" />
                      
                      <ellipse cx="400" cy="80" rx="55" ry="28" fill="#ffffff" />
                      <ellipse cx="430" cy="75" rx="48" ry="24" fill="#ffffff" />
                      <ellipse cx="370" cy="85" rx="42" ry="21" fill="#ffffff" />
                    </motion.g>

                    {/* Sun rays */}
                    <g opacity="0.2">
                      <circle cx="700" cy="100" r="35" fill="#ffffff" />
                      <circle cx="700" cy="100" r="45" fill="#ffffff" opacity="0.3" />
                    </g>

                    {/* Birds - Flying Across */}
                    {[1, 2, 3].map((i) => (
                      <motion.g 
                        key={`bird-${i}`}
                        opacity="0.6"
                        initial={{ x: -100, y: 50 + i * 30 }}
                        animate={{ 
                          x: [850], 
                          y: [50 + i * 30, 40 + i * 30, 60 + i * 30, 50 + i * 30]
                        }}
                        transition={{ 
                          x: { duration: 25 + i * 5, repeat: Infinity, ease: "linear", delay: i * 8 },
                          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                      >
                        <path d="M 0,0 Q 10,-5 20,0" stroke="#ffffff" strokeWidth="2" fill="none" />
                        <path d="M 20,0 Q 30,-5 40,0" stroke="#ffffff" strokeWidth="2" fill="none" />
                      </motion.g>
                    ))}

                    {/* LAYER 3: Iceberg - Animated Swaying */}
                    <motion.g
                      animate={{ 
                        rotate: [-1, 1, -1],
                        y: [0, 5, 0]
                      }}
                      transition={{ 
                        duration: 6, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      style={{ originX: "50%", originY: "50%" }}
                      className="group-hover:opacity-90"
                    >
                      {/* Complex Low-Poly Iceberg - Asymmetric realistic shape */}
                      <g>
                        {/* ===== ABOVE WATER - Sharp peak, small visible part ===== */}
                        
                        {/* Central peak - very sharp */}
                        <path d="M 400,200 L 370,270 L 400,290 Z" fill="#ffffff" opacity="0.95" />
                        <path d="M 400,200 L 430,270 L 400,290 Z" fill="#e0f2fe" opacity="0.92" />
                        
                        {/* Layer 1 - expanding from peak */}
                        <path d="M 370,270 L 340,340 L 370,360 Z" fill="#dbeafe" />
                        <path d="M 370,270 L 400,290 L 370,360 Z" fill="#bae6fd" />
                        <path d="M 400,290 L 370,360 L 400,380 Z" fill="#93c5fd" />
                        
                        <path d="M 430,270 L 460,340 L 430,360 Z" fill="#e0f2fe" />
                        <path d="M 430,270 L 400,290 L 430,360 Z" fill="#93c5fd" />
                        <path d="M 400,290 L 430,360 L 400,380 Z" fill="#bae6fd" />
                        
                        {/* Layer 2 - wider */}
                        <path d="M 340,340 L 320,410 L 350,425 Z" fill="#7dd3fc" />
                        <path d="M 340,340 L 370,360 L 350,425 Z" fill="#60a5fa" />
                        <path d="M 370,360 L 350,425 L 380,440 Z" fill="#93c5fd" />
                        <path d="M 370,360 L 400,380 L 380,440 Z" fill="#7dd3fc" />
                        
                        <path d="M 460,340 L 480,410 L 450,425 Z" fill="#93c5fd" />
                        <path d="M 460,340 L 430,360 L 450,425 Z" fill="#7dd3fc" />
                        <path d="M 430,360 L 450,425 L 420,440 Z" fill="#60a5fa" />
                        <path d="M 430,360 L 400,380 L 420,440 Z" fill="#93c5fd" />
                        
                        {/* Center vertical */}
                        <path d="M 400,380 L 380,440 L 400,450 Z" fill="#60a5fa" />
                        <path d="M 400,380 L 420,440 L 400,450 Z" fill="#7dd3fc" />
                        
                        {/* Layer 3 - at waterline (narrow waist) */}
                        <path d="M 320,410 L 310,450 L 350,450 Z" fill="#60a5fa" />
                        <path d="M 350,425 L 310,450 L 380,450 Z" fill="#7dd3fc" />
                        
                        <path d="M 480,410 L 490,450 L 450,450 Z" fill="#93c5fd" />
                        <path d="M 450,425 L 490,450 L 420,450 Z" fill="#7dd3fc" />

                        {/* ===== UNDERWATER - Massive bulk ===== */}
                        
                        {/* Layer 4 - just below water, expanding */}
                        <path d="M 310,450 L 280,530 L 320,545 Z" fill="#3b82f6" />
                        <path d="M 310,450 L 350,450 L 320,545 Z" fill="#60a5fa" />
                        <path d="M 350,450 L 320,545 L 360,560 Z" fill="#3b82f6" />
                        <path d="M 350,450 L 380,450 L 360,560 Z" fill="#2563eb" />
                        <path d="M 380,450 L 360,560 L 390,575 Z" fill="#3b82f6" />
                        <path d="M 380,450 L 400,450 L 390,575 Z" fill="#2563eb" />
                        
                        <path d="M 490,450 L 520,530 L 480,545 Z" fill="#60a5fa" />
                        <path d="M 490,450 L 450,450 L 480,545 Z" fill="#3b82f6" />
                        <path d="M 450,450 L 480,545 L 440,560 Z" fill="#2563eb" />
                        <path d="M 450,450 L 420,450 L 440,560 Z" fill="#3b82f6" />
                        <path d="M 420,450 L 440,560 L 410,575 Z" fill="#2563eb" />
                        <path d="M 420,450 L 400,450 L 410,575 Z" fill="#3b82f6" />
                        
                        {/* Center vertical underwater */}
                        <path d="M 400,450 L 390,575 L 400,590 Z" fill="#1e40af" />
                        <path d="M 400,450 L 410,575 L 400,590 Z" fill="#2563eb" />
                        
                        {/* Layer 5 - mid underwater, very wide */}
                        <path d="M 280,530 L 240,630 L 290,645 Z" fill="#2563eb" />
                        <path d="M 280,530 L 320,545 L 290,645 Z" fill="#3b82f6" />
                        <path d="M 320,545 L 290,645 L 330,660 Z" fill="#2563eb" />
                        <path d="M 320,545 L 360,560 L 330,660 Z" fill="#1d4ed8" />
                        <path d="M 360,560 L 330,660 L 370,675 Z" fill="#2563eb" />
                        <path d="M 360,560 L 390,575 L 370,675 Z" fill="#1e40af" />
                        
                        <path d="M 520,530 L 560,630 L 510,645 Z" fill="#3b82f6" />
                        <path d="M 520,530 L 480,545 L 510,645 Z" fill="#2563eb" />
                        <path d="M 480,545 L 510,645 L 470,660 Z" fill="#1d4ed8" />
                        <path d="M 480,545 L 440,560 L 470,660 Z" fill="#2563eb" />
                        <path d="M 440,560 L 470,660 L 430,675 Z" fill="#1e40af" />
                        <path d="M 440,560 L 410,575 L 430,675 Z" fill="#2563eb" />
                        
                        {/* Center deep bottom */}
                        <path d="M 390,575 L 370,675 L 390,690 Z" fill="#1e3a8a" />
                        <path d="M 390,575 L 400,590 L 390,690 Z" fill="#1e40af" />
                        <path d="M 400,590 L 390,690 L 400,705 Z" fill="#1e3a8a" />
                        <path d="M 410,575 L 430,675 L 410,690 Z" fill="#1e40af" />
                        <path d="M 410,575 L 400,590 L 410,690 Z" fill="#1e3a8a" />
                        <path d="M 400,590 L 410,690 L 400,705 Z" fill="#1e40af" />
                        
                        {/* Layer 6 - deep section, widest part */}
                        <path d="M 240,630 L 200,750 L 260,760 Z" fill="#1d4ed8" />
                        <path d="M 240,630 L 290,645 L 260,760 Z" fill="#2563eb" />
                        <path d="M 290,645 L 260,760 L 300,770 Z" fill="#1d4ed8" />
                        <path d="M 290,645 L 330,660 L 300,770 Z" fill="#1e40af" />
                        <path d="M 330,660 L 300,770 L 340,780 Z" fill="#1d4ed8" />
                        <path d="M 330,660 L 370,675 L 340,780 Z" fill="#1e3a8a" />
                        <path d="M 370,675 L 340,780 L 370,790 Z" fill="#1e40af" />
                        <path d="M 370,675 L 390,690 L 370,790 Z" fill="#1e3a8a" />
                        
                        <path d="M 560,630 L 600,750 L 540,760 Z" fill="#2563eb" />
                        <path d="M 560,630 L 510,645 L 540,760 Z" fill="#1d4ed8" />
                        <path d="M 510,645 L 540,760 L 500,770 Z" fill="#1e40af" />
                        <path d="M 510,645 L 470,660 L 500,770 Z" fill="#1d4ed8" />
                        <path d="M 470,660 L 500,770 L 460,780 Z" fill="#1e3a8a" />
                        <path d="M 470,660 L 430,675 L 460,780 Z" fill="#1e40af" />
                        <path d="M 430,675 L 460,780 L 430,790 Z" fill="#1e3a8a" />
                        <path d="M 430,675 L 410,690 L 430,790 Z" fill="#1e40af" />
                        
                        {/* Center deep bottom */}
                        <path d="M 390,690 L 370,790 L 390,800 Z" fill="#1e40af" />
                        <path d="M 390,690 L 400,705 L 390,800 Z" fill="#1e3a8a" />
                        <path d="M 410,690 L 430,790 L 410,800 Z" fill="#1e3a8a" />
                        <path d="M 410,690 L 400,705 L 410,800 Z" fill="#1e40af" />
                        
                        {/* Layer 7 - bottom narrowing */}
                        <path d="M 200,750 L 260,760 L 280,850 Z" fill="#1e40af" />
                        <path d="M 260,760 L 300,770 L 280,850 Z" fill="#1e3a8a" />
                        <path d="M 300,770 L 340,780 L 310,860 Z" fill="#1e40af" />
                        <path d="M 300,770 L 280,850 L 310,860 Z" fill="#1e3a8a" />
                        <path d="M 340,780 L 370,790 L 340,870 Z" fill="#1e3a8a" />
                        <path d="M 340,780 L 310,860 L 340,870 Z" fill="#1e40af" />
                        <path d="M 370,790 L 390,800 L 370,880 Z" fill="#1e40af" />
                        <path d="M 370,790 L 340,870 L 370,880 Z" fill="#1e3a8a" />
                        
                        <path d="M 600,750 L 540,760 L 520,850 Z" fill="#1e3a8a" />
                        <path d="M 540,760 L 500,770 L 520,850 Z" fill="#1e40af" />
                        <path d="M 500,770 L 460,780 L 490,860 Z" fill="#1e3a8a" />
                        <path d="M 500,770 L 520,850 L 490,860 Z" fill="#1e40af" />
                        <path d="M 460,780 L 430,790 L 460,870 Z" fill="#1e40af" />
                        <path d="M 460,780 L 490,860 L 460,870 Z" fill="#1e3a8a" />
                        <path d="M 430,790 L 410,800 L 430,880 Z" fill="#1e3a8a" />
                        <path d="M 430,790 L 460,870 L 430,880 Z" fill="#1e40af" />
                        
                        {/* Center bottom narrowing */}
                        <path d="M 390,800 L 370,880 L 390,890 Z" fill="#1e3a8a" />
                        <path d="M 400,705 L 390,800 L 400,890 Z" fill="#1e40af" />
                        <path d="M 410,800 L 430,880 L 410,890 Z" fill="#1e40af" />
                        <path d="M 400,705 L 410,800 L 400,890 Z" fill="#1e3a8a" />
                        
                        {/* Layer 8 - final bottom tip */}
                        <path d="M 280,850 L 310,860 L 340,900 Z" fill="#1e40af" />
                        <path d="M 310,860 L 340,870 L 340,900 Z" fill="#1e3a8a" />
                        <path d="M 340,870 L 370,880 L 360,900 Z" fill="#1e40af" />
                        <path d="M 340,870 L 340,900 L 360,900 Z" fill="#1e3a8a" />
                        <path d="M 370,880 L 390,890 L 380,900 Z" fill="#1e3a8a" />
                        <path d="M 370,880 L 360,900 L 380,900 Z" fill="#1e40af" />
                        <path d="M 390,890 L 400,890 L 400,900 Z" fill="#1e40af" />
                        <path d="M 390,890 L 380,900 L 400,900 Z" fill="#1e3a8a" />
                        
                        <path d="M 520,850 L 490,860 L 460,900 Z" fill="#1e3a8a" />
                        <path d="M 490,860 L 460,870 L 460,900 Z" fill="#1e40af" />
                        <path d="M 460,870 L 430,880 L 440,900 Z" fill="#1e3a8a" />
                        <path d="M 460,870 L 460,900 L 440,900 Z" fill="#1e40af" />
                        <path d="M 430,880 L 410,890 L 420,900 Z" fill="#1e40af" />
                        <path d="M 430,880 L 440,900 L 420,900 Z" fill="#1e3a8a" />
                        <path d="M 410,890 L 400,890 L 400,900 Z" fill="#1e3a8a" />
                        <path d="M 410,890 L 420,900 L 400,900 Z" fill="#1e40af" />
                        
                        {/* Final bottom closure */}
                        <path d="M 340,900 L 360,900 L 380,900 L 400,900 L 420,900 L 440,900 L 460,900 Z" fill="#1e3a8a" />

                        {/* ===== Light effects - highlights ===== */}
                        <motion.ellipse 
                          cx="405" cy="240" rx="15" ry="22" fill="#ffffff" 
                          animate={{ opacity: [0.8, 1, 0.8] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          filter="blur(3px)" 
                        />
                        <motion.ellipse 
                          cx="430" cy="310" rx="18" ry="25" fill="#ffffff" 
                          animate={{ opacity: [0.65, 0.85, 0.65] }}
                          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                          filter="blur(3px)" 
                        />
                        
                        <ellipse cx="385" cy="350" rx="12" ry="18" fill="#f0f9ff" opacity="0.5" filter="blur(2px)" />
                        <ellipse cx="400" cy="600" rx="40" ry="50" fill="#3b82f6" opacity="0.12" filter="blur(20px)" />
                      </g>

                      {/* Water overlay - creates underwater darkening effect */}
                      <rect
                        x="0"
                        y={waterLineY}
                        width="800"
                        height="450"
                        fill="url(#waterOverlay)"
                        opacity="0.7"
                      />
                    </motion.g>

                    {/* LAYER 4: Water Surface Line - Animated */}
                    <g>
                      {/* Moving waves - using wide paths and translateX */}
                      <motion.path
                        d={`M 0 ${waterLineY} Q 100 ${waterLineY - 5} 200 ${waterLineY} T 400 ${waterLineY} T 600 ${waterLineY} T 800 ${waterLineY} T 1000 ${waterLineY} T 1200 ${waterLineY}`}
                        stroke="#22d3ee"
                        strokeWidth="3"
                        fill="none"
                        opacity="0.8"
                        animate={{ x: [-400, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      />
                      
                      <motion.path
                        d={`M 0 ${waterLineY} Q 100 ${waterLineY - 10} 200 ${waterLineY} T 400 ${waterLineY} T 600 ${waterLineY} T 800 ${waterLineY} T 1000 ${waterLineY} T 1200 ${waterLineY}`}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.5"
                        animate={{ x: [-400, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{ translateY: 5 }}
                      />

                      {/* Additional wave lines */}
                      {[1, 2, 3].map((i) => (
                        <motion.path
                          key={`wave-${i}`}
                          d={`M 0 ${waterLineY + i * 8} Q 100 ${waterLineY + i * 8 - 5} 200 ${waterLineY + i * 8} T 400 ${waterLineY + i * 8} T 600 ${waterLineY + i * 8} T 800 ${waterLineY + i * 8} T 1000 ${waterLineY + i * 8}`}
                          stroke="#0ea5e9"
                          strokeWidth="1.5"
                          fill="none"
                          opacity={0.3 - i * 0.07}
                          animate={{ x: [-400, 0] }}
                          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear" }}
                        />
                      ))}
                    </g>

                    {/* Percentage display */}
                    <motion.text
                      x="400"
                      y="200"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="52"
                      fontWeight="bold"
                      style={{ 
                        filter: 'drop-shadow(0px 2px 6px rgba(0,0,0,0.7))',
                        pointerEvents: 'none'
                      }}
                      animate={{ y: [200, 210, 200] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {admissionChance > 0 ? `${admissionChance.toFixed(0)}%` : `${percentage.toFixed(0)}%`}
                    </motion.text>
                  </svg>

                  {/* Info badges */}
                  <div className="absolute top-6 left-6 space-y-3 pointer-events-none">
                    <Badge className="bg-slate-800/80 text-cyan-100 border-cyan-400/40 backdrop-blur-md px-4 py-2 text-base shadow-lg">
                      {t('aboveWater')}: {visiblePercentage.toFixed(1)}%
                    </Badge>
                    <Badge className="bg-blue-900/70 text-cyan-200 border-blue-400/40 backdrop-blur-md px-4 py-2 text-base shadow-lg">
                      {t('underwater')}: {(100 - visiblePercentage).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-md border-2 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-100 text-sm">{t('parameters')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-200/70">{t('heightAboveWater')}</span>
                  <span className="text-cyan-100">{(visiblePercentage * 6).toFixed(1)}м</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-200/70">{t('depthUnderwater')}</span>
                  <span className="text-cyan-100">{((100 - visiblePercentage) * 6).toFixed(1)}м</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-200/70">{t('totalHeight')}</span>
                  <span className="text-cyan-100">600м</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ranks */}
        <Card className="mt-8 bg-slate-800/50 backdrop-blur-md border-2 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <Crown className="w-5 h-5 text-cyan-400" />
              {t('allRanks')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {RANKS.map((rank, index) => {
                const isAchieved = totalPoints >= rank.minPoints;
                const isCurrent = current.name === rank.name;
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      isCurrent
                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-400/60 shadow-lg shadow-cyan-500/20'
                        : isAchieved
                        ? 'bg-slate-700/30 border-cyan-500/30'
                        : 'bg-slate-800/20 border-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-lg ${isCurrent ? 'text-cyan-100' : isAchieved ? 'text-cyan-200' : 'text-slate-500'}`}>
                        {t(rank.nameKey)}
                      </div>
                      {isAchieved && (
                        <Award className={`w-5 h-5 ${isCurrent ? 'text-cyan-400' : 'text-cyan-500'}`} />
                      )}
                    </div>
                    <div className={`text-sm ${isCurrent ? 'text-cyan-200' : isAchieved ? 'text-cyan-300/70' : 'text-slate-600'}`}>
                      {rank.minPoints} TethysPoints
                    </div>
                    {isCurrent && (
                      <Badge className="mt-2 bg-cyan-500 text-slate-900">
                        {t('currentRank')}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}