import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { WaterRippleButton } from '../components/WaterRippleButton';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Brain, Globe, Target, Trophy, Sparkles, TrendingUp, BookOpen, Award, AlertCircle, CheckCircle2, Filter, GraduationCap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../utils/i18n';
import { getProfile, getPortfolio, setTargetUniversity } from '../utils/api';
import { UniversityData, DIRECTION_MAPPING } from '../utils/universities';
import { UNIVERSITIES_DATABASE_1000 } from '../utils/universitiesExpanded';
import { 
  calculateAdmissionChance, 
  buildPortfolioFromUserData, 
  sortByProbability,
  getRecommendedMix,
  AdmissionChance 
} from '../utils/admissionCalculator';
import { analyzeAdmissionChances } from '../utils/gemini';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type Region = 'asia' | 'central-asia' | 'north-america' | 'europe' | 'south-america' | 'oceania';
type DifficultyLevel = 'all' | 'easy' | 'medium' | 'hard' | 'very-hard';
type CategoryType = 'all' | 'technology' | 'business' | 'medicine' | 'engineering' | 'arts' | 'science';

const RegionIcon = ({ type }: { type: Region }) => {
  const icons = {
    'asia': (<svg viewBox="0 0 24 24" fill="none" className="w-8 h-8"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22" stroke="currentColor" strokeWidth="2"/><path d="M12 2C12 2 16 6 16 12C16 18 12 22 12 22" stroke="currentColor" strokeWidth="2"/><path d="M2 12H22" stroke="currentColor" strokeWidth="2"/></svg>),
    'central-asia': (<svg viewBox="0 0 24 24" fill="none" className="w-8 h-8"><path d="M3 20L12 4L21 20H3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M7 20L12 10L17 20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>),
    'north-america': (<svg viewBox="0 0 24 24" fill="none" className="w-8 h-8"><rect x="8" y="8" width="8" height="14" stroke="currentColor" strokeWidth="2"/><path d="M8 8L12 2L16 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2"/></svg>),
    'europe': (<svg viewBox="0 0 24 24" fill="none" className="w-8 h-8"><rect x="6" y="10" width="12" height="10" stroke="currentColor" strokeWidth="2"/><path d="M6 10L12 4L18 10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><line x1="9" y1="14" x2="11" y2="14" stroke="currentColor" strokeWidth="2"/><line x1="13" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="2"/></svg>),
    'south-america': (<svg viewBox="0 0 24 24" fill="none" className="w-8 h-8"><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2"/><path d="M9 11C9 11 8 14 8 18C8 20 10 22 12 22C14 22 16 20 16 18C16 14 15 11 15 11" stroke="currentColor" strokeWidth="2"/></svg>),
    'oceania': (<svg viewBox="0 0 24 24" fill="none" className="w-8 h-8"><path d="M4 18C4 18 8 16 12 16C16 16 20 18 20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="7" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="17" cy="12" r="1" fill="currentColor"/><circle cx="10" cy="14" r="0.5" fill="currentColor"/></svg>)
  };
  return icons[type];
};

export function AssistantPage() {
  const { activeUserId } = useAuth();
  const { t, language } = useTranslation();
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [admissionChances, setAdmissionChances] = useState<AdmissionChance[]>([]);
  const [userDirection, setUserDirection] = useState<string>('technology');
  const [portfolioLoaded, setPortfolioLoaded] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  
  // Portfolio stats for display
  const [portfolioStats, setPortfolioStats] = useState({
    gpa: 0,
    ielts: 0,
    sat: 0,
    achievements: 0,
  });

  const regions: { id: Region; name: string }[] = [
    { id: 'asia', name: t('asia') },
    { id: 'central-asia', name: t('centralAsia') },
    { id: 'north-america', name: t('northAmerica') },
    { id: 'europe', name: t('europe') },
    { id: 'south-america', name: t('southAmerica') },
    { id: 'oceania', name: t('oceania') },
  ];

  // Load user profile and portfolio on mount
  useEffect(() => {
    loadUserData();
    loadLastQuery(); // Load last query on mount
  }, [activeUserId]);

  const loadUserData = async () => {
    if (!activeUserId) return;

    try {
      // Load profile for direction
      const profile = await getProfile(activeUserId);
      setUserDirection(profile.direction || 'technology');

      // Load portfolio data
      const portfolio = await getPortfolio(activeUserId);
      
      // Calculate GPA
      let gpa = 0;
      if (portfolio.subjects && portfolio.subjects.length > 0) {
        const total = portfolio.subjects.reduce((sum: number, subject: any) => {
          return sum + parseFloat(subject.grade || '0');
        }, 0);
        gpa = total / portfolio.subjects.length;
      }

      setPortfolioStats({
        gpa: Number(gpa.toFixed(2)),
        ielts: portfolio.ieltsScore ? parseFloat(portfolio.ieltsScore) : 0,
        sat: portfolio.satScore ? parseFloat(portfolio.satScore) : 0,
        achievements: portfolio.diplomas?.filter((d: any) => d.verified).length || 0,
      });
      
      setPortfolioLoaded(true);
    } catch (error) {
      console.error('Error loading user data:', error);
      setPortfolioLoaded(true); // Still mark as loaded to show UI
    }
  };

  const toggleRegion = (regionId: Region) => {
    setSelectedRegions(prev =>
      prev.includes(regionId) ? prev.filter(r => r !== regionId) : [...prev, regionId]
    );
  };

  const selectAllRegions = () => {
    if (selectedRegions.length === regions.length) {
      setSelectedRegions([]);
    } else {
      setSelectedRegions(regions.map(r => r.id));
    }
  };

  const handleAnalyze = async () => {
    if (selectedRegions.length === 0) {
      toast.error(t('selectAtLeastOneRegion'));
      return;
    }

    setAnalyzing(true);
    
    try {
      // Build user portfolio from REAL data or use minimum defaults
      let userPortfolio;
      
      if (activeUserId) {
        try {
          // Get REAL user data
          const [profileData, portfolioData] = await Promise.all([
            getProfile(activeUserId),
            getPortfolio(activeUserId)
          ]);

          console.log('📦 Profile data:', profileData);
          console.log('📦 Portfolio data:', portfolioData);

          userPortfolio = buildPortfolioFromUserData(
            profileData?.profile || { direction: userDirection },
            portfolioData?.portfolio || null
          );
          console.log('📊 REAL User portfolio:', userPortfolio);
        } catch (error) {
          console.error('Error loading portfolio, using defaults:', error);
          // Use minimum portfolio if loading fails
          userPortfolio = {
            gpa: 2.0,
            ieltsScore: 0,
            satScore: 0,
            achievements: 0,
            direction: userDirection,
          };
        }
      } else {
        // No user logged in - use minimum portfolio for demo
        userPortfolio = {
          gpa: 2.0,
          ieltsScore: 0,
          satScore: 0,
          achievements: 0,
          direction: userDirection,
        };
        console.log('👤 Using minimum portfolio (no user logged in)');
      }

      // Filter universities by selected regions and direction
      const filteredUniversities = UNIVERSITIES_DATABASE_1000.filter(uni => {
        const regionMatch = selectedRegions.includes(uni.region);
        
        // Filter by difficulty (based on world rank)
        let difficultyMatch = true;
        if (selectedDifficulty !== 'all') {
          switch (selectedDifficulty) {
            case 'easy':
              difficultyMatch = uni.rank >= 300;
              break;
            case 'medium':
              difficultyMatch = uni.rank >= 100 && uni.rank < 300;
              break;
            case 'hard':
              difficultyMatch = uni.rank >= 50 && uni.rank < 100;
              break;
            case 'very-hard':
              difficultyMatch = uni.rank < 50;
              break;
          }
        }

        // Filter by category
        let categoryMatch = true;
        if (selectedCategory !== 'all') {
          const categoryMappings: Record<CategoryType, string[]> = {
            'all': [],
            'technology': ['Computer Science', 'Information Technology', 'Software Engineering', 'Data Science'],
            'business': ['Business', 'Economics', 'Management', 'Finance'],
            'medicine': ['Medicine', 'Healthcare', 'Nursing', 'Public Health'],
            'engineering': ['Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering'],
            'arts': ['Arts', 'Design', 'Humanities', 'Literature', 'Music'],
            'science': ['Science', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Research'],
          };
          
          const categoryDirections = categoryMappings[selectedCategory];
          categoryMatch = uni.directions.some(dir => 
            categoryDirections.some(catDir => 
              dir.toLowerCase().includes(catDir.toLowerCase()) || 
              catDir.toLowerCase().includes(dir.toLowerCase())
            )
          );
        }
        
        // Check if university offers programs in user's direction
        const directionMatch = uni.directions.some(dir => {
          const mappedDirections = DIRECTION_MAPPING[userDirection] || [userDirection];
          return mappedDirections.includes(dir);
        });

        return regionMatch && difficultyMatch && categoryMatch && directionMatch;
      });

      // If no universities found with direction filter, show all from regions
      const universitiesToAnalyze = filteredUniversities.length > 0 
        ? filteredUniversities 
        : UNIVERSITIES_DATABASE_1000.filter(uni => selectedRegions.includes(uni.region));

      console.log('🎓 Universities after region filter:', universitiesToAnalyze.length);
      console.log('🌍 Selected regions:', selectedRegions);
      console.log('📚 Direction:', userDirection);

      if (universitiesToAnalyze.length === 0) {
        toast.error(t('universitiesNotFound'), {
          description: t('tryOtherRegions')
        });
        setAnalyzing(false);
        return;
      }

      let admissionResults: AdmissionChance[] = [];

      // Try AI analysis first
      try {
        console.log('🔍 Analyzing universities:', universitiesToAnalyze.length);
        console.log('📊 User portfolio:', userPortfolio);
        
        // Transform universities to match the expected format
        const universitiesForAI = universitiesToAnalyze.map(uni => ({
          name: uni.nameRu, // Use Russian name for AI analysis (better recognition)
          ranking: uni.rank,
          country: uni.country,
          category: uni.directions[0] || 'general'
        }));
        
        const chances = await analyzeAdmissionChances(universitiesForAI, userPortfolio);
        
        console.log('✅ AI returned results:', chances.length);
        console.log('📝 All AI results:', chances);

        // Map AI results to our AdmissionChance format
        admissionResults = chances.map((aiResult) => {
          // Find the matching university (try both Russian and English names)
          const university = universitiesToAnalyze.find(u => {
            const nameMatch = u.nameRu === aiResult.universityName || 
                             u.name === aiResult.universityName ||
                             u.nameRu.toLowerCase().includes(aiResult.universityName.toLowerCase()) ||
                             aiResult.universityName.toLowerCase().includes(u.nameRu.toLowerCase());
            
            console.log(`🔎 Matching "${aiResult.universityName}" with "${u.nameRu}": ${nameMatch}`);
            return nameMatch;
          });

          if (!university) {
            console.warn('⚠️ University not found for AI result:', aiResult.universityName);
            console.warn('   Available universities:', universitiesToAnalyze.map(u => u.nameRu).join(', '));
            return null;
          }

          console.log('✅ Matched university:', university.nameRu);

          // Create breakdown based on AI probability
          const breakdown = {
            gpaScore: Math.min(100, aiResult.probability + 10),
            testScore: Math.max(0, aiResult.probability - 10),
            achievementScore: aiResult.probability,
            directionMatch: aiResult.probability > 30,
          };

          return {
            university,
            probability: aiResult.probability,
            matchScore: aiResult.probability,
            breakdown,
            recommendation: aiResult.category.toLowerCase() as 'safety' | 'target' | 'reach' | 'dream',
          };
        }).filter((r): r is AdmissionChance => r !== null);

        console.log('✨ Mapped results:', admissionResults.length);
        toast.success('✨ AI анализ завершен!');
      } catch (error: any) {
        // Fallback to local algorithm if AI is unavailable
        console.warn('⚠️ AI analysis failed, using fallback algorithm');
        console.warn('Error:', error?.message);
        
        admissionResults = universitiesToAnalyze.map(uni => 
          calculateAdmissionChance(uni, userPortfolio)
        );

        console.log('📊 Using local calculation for', admissionResults.length, 'universities');
        console.log('🔢 Sample results:', admissionResults.slice(0, 3).map(r => ({
          name: r.university.nameRu,
          probability: r.probability,
          rank: r.university.rank
        })));
        
        if (admissionResults.length === 0) {
          toast.error(t('failedToCalculate'));
          setAnalyzing(false);
          return;
        }
        
        toast.success(t('analysisCompleted'), {
          description: t('showingBestUniversities'),
        });
      }

      // Sort by probability and take top 10
      const sortedChances = sortByProbability(admissionResults).slice(0, 10);
      
      console.log('🎯 Final results after sorting:', sortedChances.length);
      console.log('🏆 Top 3 universities:', sortedChances.slice(0, 3).map(c => ({
        name: c.university.nameRu,
        probability: c.probability
      })));

      if (sortedChances.length === 0) {
        toast.error(t('noUniversitiesFound'));
        setAdmissionChances([]);
        setAnalyzed(false);
      } else {
        setAdmissionChances(sortedChances);
        setAnalyzed(true);
        toast.success(t('analysisComplete'));
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error(t('analysisError'));
    } finally {
      setAnalyzing(false);
      saveQuery(); // Save the query after analysis
    }
  };

  const getUniversityName = (uni: UniversityData) => {
    if (language === 'ru') return uni.nameRu;
    if (language === 'kk') return uni.nameKk;
    return uni.name;
  };

  const getUniversityLocation = (uni: UniversityData) => {
    if (language === 'ru') return uni.locationRu;
    if (language === 'kk') return uni.locationKk;
    return uni.location;
  };

  const getUniversityPrograms = (uni: UniversityData) => {
    if (language === 'ru') return uni.programsRu;
    if (language === 'kk') return uni.programsKk;
    return uni.programs;
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 60) return 'text-emerald-600 dark:text-emerald-400';
    if (probability >= 35) return 'text-blue-600 dark:text-blue-400';
    if (probability >= 15) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProbabilityBgColor = (probability: number) => {
    if (probability >= 60) return 'from-emerald-500 to-green-500';
    if (probability >= 35) return 'from-blue-500 to-cyan-500';
    if (probability >= 15) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getRecommendationBadge = (recommendation: string) => {
    const config = {
      safety: { color: 'bg-emerald-600', text: t('safety') || 'Safety' },
      target: { color: 'bg-blue-600', text: t('target') || 'Target' },
      reach: { color: 'bg-amber-600', text: t('reach') || 'Reach' },
      dream: { color: 'bg-purple-600', text: t('dream') || 'Dream' },
    };
    return config[recommendation as keyof typeof config] || config.dream;
  };

  const handleSetAsTarget = async (uni: UniversityData, probability: number) => {
    try {
      await setTargetUniversity({
        name: uni.name,
        nameRu: uni.nameRu,
        nameKk: uni.nameKk,
        location: uni.location,
        locationRu: uni.locationRu,
        locationKk: uni.locationKk,
        rank: uni.rank,
        probability,
      }, activeUserId || undefined);

      const message = activeUserId 
        ? `${getUniversityName(uni)} ${t('universitySavedPortfolio')}`
        : `${getUniversityName(uni)} ${t('universitySavedLocally')}`;

      toast.success(`🎯 ${t('targetUniversitySet')}`, {
        description: message,
      });
    } catch (error) {
      console.error('Error setting target university:', error);
      toast.error(t('errorSettingTarget'));
    }
  };

  const recommendedMix = analyzed ? getRecommendedMix(admissionChances) : null;

  const loadLastQuery = async () => {
    if (!activeUserId) return;

    try {
      console.log('📂 Loading last query for user:', activeUserId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6738f032/ai/mentor/${activeUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📂 Loaded data from database:', data);
        
        if (data && data.selected_regions) {
          // Restore regions
          const regions = JSON.parse(data.selected_regions);
          setSelectedRegions(regions);
          console.log('✅ Restored regions:', regions);
          
          // Restore difficulty and category
          if (data.selected_difficulty) {
            setSelectedDifficulty(data.selected_difficulty);
          }
          if (data.selected_category) {
            setSelectedCategory(data.selected_category);
          }
          
          // Restore universities and show results
          if (data.universities_shown) {
            try {
              const universitiesData = typeof data.universities_shown === 'string' 
                ? JSON.parse(data.universities_shown) 
                : data.universities_shown;
              
              console.log('📚 Restored universities:', universitiesData);
              
              if (Array.isArray(universitiesData) && universitiesData.length > 0) {
                // Convert saved data back to AdmissionChance format
                const restoredChances: AdmissionChance[] = universitiesData.map((uni: any) => {
                  // Find full university data from database
                  const fullUni = UNIVERSITIES_DATABASE_1000.find(u => 
                    u.name === uni.name || u.nameRu === uni.nameRu
                  );
                  
                  if (!fullUni) {
                    console.warn('⚠️ University not found in database:', uni.name);
                    return null;
                  }
                  
                  // Reconstruct AdmissionChance
                  return {
                    university: fullUni,
                    probability: uni.probability || 0,
                    matchScore: uni.probability || 0,
                    breakdown: {
                      gpaScore: Math.min(100, uni.probability + 10),
                      testScore: Math.max(0, uni.probability - 10),
                      achievementScore: uni.probability,
                      directionMatch: uni.probability > 30,
                    },
                    recommendation: uni.probability >= 60 ? 'safety' : 
                                  uni.probability >= 35 ? 'target' : 
                                  uni.probability >= 15 ? 'reach' : 'dream',
                  };
                }).filter((c): c is AdmissionChance => c !== null);
                
                if (restoredChances.length > 0) {
                  setAdmissionChances(restoredChances);
                  setAnalyzed(true);
                  console.log('✅ Restored', restoredChances.length, 'universities');
                  
                  toast.success(t('lastQueryRestored'), {
                    description: `${t('showing')} ${restoredChances.length} ${t('universities')}`,
                  });
                }
              }
            } catch (parseError) {
              console.error('❌ Error parsing universities_shown:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading last query:', error);
    }
  };

  const saveQuery = async () => {
    if (!activeUserId) return;

    try {
      console.log('💾 Attempting to save query...');
      console.log('   User ID:', activeUserId);
      console.log('   Selected regions:', selectedRegions);
      console.log('   Difficulty:', selectedDifficulty);
      console.log('   Category:', selectedCategory);
      console.log('   Universities count:', admissionChances.length);
      console.log('   Universities:', admissionChances.map(c => ({
        name: c.university.name,
        nameRu: c.university.nameRu,
        rank: c.university.rank,
        probability: c.probability,
      })));
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6738f032/ai/mentor/${activeUserId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            selected_regions: JSON.stringify(selectedRegions),
            selected_difficulty: selectedDifficulty,
            selected_category: selectedCategory,
            universities_shown: admissionChances.map(c => ({
              name: c.university.name,
              nameRu: c.university.nameRu,
              rank: c.university.rank,
              probability: c.probability,
            })),
          }),
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log('💾 Query saved successfully:', result);
      } else {
        const errorData = await response.json();
        console.error('❌ Error saving query:', response.status, errorData);
        
        // Show user-friendly error for missing table
        if (response.status === 500) {
          toast.error('База данных не настроена', {
            description: 'Пожалуйста, создайте таблицу ai_mentor_conversations в Supabase. Смотрите /CHECK_DATABASE.md'
          });
        }
      }
    } catch (error) {
      console.error('❌ Error saving query:', error);
      // Don't show error toast - saving is not critical, it happens in background
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
            <Brain className="w-10 h-10 text-blue-600" />
            {t('aiMentor')}
          </h1>
          <p className="text-blue-600 dark:text-blue-400">
            {t('aiMentorDescription')}
          </p>
        </div>

        {/* Portfolio Summary */}
        {portfolioLoaded && (
          <Card className="mb-8 border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-100/50 to-pink-100/50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-purple-700 dark:text-purple-300">
                    {t('yourPortfolio')}
                  </CardTitle>
                  <CardDescription className="text-blue-600 dark:text-blue-400">
                    {t('currentStats')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-center">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">GPA</div>
                  <div className="text-2xl text-indigo-700 dark:text-indigo-300">
                    {portfolioStats.gpa > 0 ? portfolioStats.gpa.toFixed(2) : '—'}
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">из 5.0</div>
                </div>
                <div className="p-4 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg text-center">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">IELTS</div>
                  <div className="text-2xl text-cyan-700 dark:text-cyan-300">
                    {portfolioStats.ielts > 0 ? portfolioStats.ielts : '—'}
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">из 9.0</div>
                </div>
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">SAT</div>
                  <div className="text-2xl text-blue-700 dark:text-blue-300">
                    {portfolioStats.sat > 0 ? portfolioStats.sat : '—'}
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">из 1600</div>
                </div>
                <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-center">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">{t('achievements')}</div>
                  <div className="text-2xl text-amber-700 dark:text-amber-300">
                    {portfolioStats.achievements}
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">{t('verified')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Region Selection */}
        <Card className="mb-8 border-2 border-blue-300 dark:border-blue-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle className="text-blue-900 dark:text-blue-100">
                    {t('selectRegions')}
                  </CardTitle>
                  <CardDescription className="text-blue-600 dark:text-blue-400">
                    {t('chooseRegionsForSearch')}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllRegions}
                className="border-blue-400 text-blue-700 dark:text-blue-300"
              >
                {selectedRegions.length === regions.length ? t('deselectAll') : t('selectAll')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {regions.map(region => (
                <button
                  key={region.id}
                  onClick={() => toggleRegion(region.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedRegions.includes(region.id)
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 hover:border-blue-500 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={selectedRegions.includes(region.id) ? 'text-white' : 'text-blue-600 dark:text-blue-400'}>
                      <RegionIcon type={region.id} />
                    </div>
                    <span className="text-sm text-center">{region.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Difficulty Filter */}
              <div className="space-y-2">
                <label className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {t('admissionDifficulty')}:
                </label>
                <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as DifficultyLevel)}>
                  <SelectTrigger className="w-full border-blue-300 dark:border-blue-700">
                    <SelectValue placeholder={t('selectDifficulty')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allUniversities')}</SelectItem>
                    <SelectItem value="easy">{t('easyDifficulty')} ({t('rank300Plus')})</SelectItem>
                    <SelectItem value="medium">{t('mediumDifficulty')} ({t('rank100to300')})</SelectItem>
                    <SelectItem value="hard">{t('hardDifficulty')} ({t('rank50to100')})</SelectItem>
                    <SelectItem value="very-hard">{t('veryHardDifficulty')} ({t('topFifty')})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {t('programCategories')}:
                </label>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as CategoryType)}>
                  <SelectTrigger className="w-full border-blue-300 dark:border-blue-700">
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allCategories')}</SelectItem>
                    <SelectItem value="technology">{t('technologyAndIT')}</SelectItem>
                    <SelectItem value="business">{t('businessAndEconomics')}</SelectItem>
                    <SelectItem value="medicine">{t('medicineAndHealth')}</SelectItem>
                    <SelectItem value="engineering">{t('engineeringCategory')}</SelectItem>
                    <SelectItem value="arts">{t('artsAndDesign')}</SelectItem>
                    <SelectItem value="science">{t('scienceAndResearch')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <WaterRippleButton
                onClick={handleAnalyze}
                disabled={analyzing || selectedRegions.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-500 text-white px-8 py-6 text-lg"
              >
                {analyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('analyzing')}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t('analyzeChances')}
                  </>
                )}
              </WaterRippleButton>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {analyzed && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-2 border-emerald-300 dark:border-emerald-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    <div>
                      <div className="text-2xl text-emerald-700 dark:text-emerald-300">
                        {recommendedMix?.safety.length || 0}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Safety</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-300 dark:border-blue-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-2xl text-blue-700 dark:text-blue-300">
                        {recommendedMix?.target.length || 0}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Target</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-300 dark:border-amber-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-amber-600" />
                    <div>
                      <div className="text-2xl text-amber-700 dark:text-amber-300">
                        {recommendedMix?.reach.length || 0}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Reach</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-300 dark:border-purple-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                    <div>
                      <div className="text-2xl text-purple-700 dark:text-purple-300">
                        {recommendedMix?.dream.length || 0}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Dream</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Universities List */}
            <div className="space-y-4">
              <h2 className="text-2xl bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-600" />
                {t('recommendedUniversities')} ({admissionChances.length})
              </h2>

              {admissionChances.length === 0 ? (
                <Card className="border-2 border-blue-300 dark:border-blue-700">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                    <p className="text-blue-600 dark:text-blue-400">
                      {t('noUniversitiesFound')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                admissionChances.map((chance, index) => {
                  const badgeConfig = getRecommendationBadge(chance.recommendation);
                  
                  return (
                    <Card 
                      key={chance.university.id} 
                      className="border-2 border-blue-300 dark:border-blue-700 hover:shadow-xl transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="bg-blue-600">#{chance.university.rank}</Badge>
                              <Badge className={badgeConfig.color}>{badgeConfig.text}</Badge>
                            </div>
                            <CardTitle className="text-blue-900 dark:text-blue-100 text-2xl mb-1">
                              {getUniversityName(chance.university)}
                            </CardTitle>
                            <CardDescription className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              {getUniversityLocation(chance.university)}
                            </CardDescription>
                          </div>

                          <div className="text-center md:text-right">
                            <div className={`text-5xl mb-1 ${getProbabilityColor(chance.probability)}`}>
                              {chance.probability}%
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              {t('admissionChance')}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <Progress 
                            value={chance.probability} 
                            className="h-3"
                          />
                        </div>

                        {/* Match Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">GPA Match</div>
                            <div className="text-lg text-indigo-700 dark:text-indigo-300">
                              {chance.breakdown.gpaScore}%
                            </div>
                          </div>
                          <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Test Scores</div>
                            <div className="text-lg text-cyan-700 dark:text-cyan-300">
                              {chance.breakdown.testScore}%
                            </div>
                          </div>
                          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Achievements</div>
                            <div className="text-lg text-amber-700 dark:text-amber-300">
                              {chance.breakdown.achievementScore}%
                            </div>
                          </div>
                          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Direction</div>
                            <div className="text-lg text-purple-700 dark:text-purple-300">
                              {chance.breakdown.directionMatch ? '✓' : '—'}
                            </div>
                          </div>
                        </div>

                        {/* Requirements */}
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                          <div className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                            {t('requirements')}:
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400">
                              <span className="text-xs opacity-70">GPA: </span>
                              <span className="font-semibold">{chance.university.requirements.minGPA.toFixed(1)}+</span>
                            </div>
                            {chance.university.requirements.minIELTS && (
                              <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400">
                                <span className="text-xs opacity-70">IELTS: </span>
                                <span className="font-semibold">{chance.university.requirements.minIELTS}+</span>
                              </div>
                            )}
                            {chance.university.requirements.minSAT && (
                              <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400">
                                <span className="text-xs opacity-70">SAT: </span>
                                <span className="font-semibold">{chance.university.requirements.minSAT}+</span>
                              </div>
                            )}
                            {chance.university.requirements.minAchievements ? (
                              <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400">
                                <span className="text-xs opacity-70">{t('achievements')}: </span>
                                <span className="font-semibold">{chance.university.requirements.minAchievements}+</span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Programs */}
                        <div>
                          <div className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                            {t('availablePrograms')}:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {getUniversityPrograms(chance.university).map((program, i) => (
                              <Badge key={i} variant="outline" className="border-blue-400 text-blue-700 dark:text-blue-300">
                                {program}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Tuition */}
                        {chance.university.tuitionFee && (
                          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                              {t('tuitionFee')}:
                            </div>
                            <div className="text-sm text-emerald-700 dark:text-emerald-300">
                              {chance.university.tuitionFee} / {t('year')}
                            </div>
                          </div>
                        )}

                        {/* Set as Target */}
                        <div className="mt-4">
                          <WaterRippleButton
                            onClick={() => handleSetAsTarget(chance.university, chance.probability)}
                            className="bg-gradient-to-r from-blue-600 to-purple-500 text-white px-4 py-2 text-sm group"
                          >
                            {t('setAsTarget')}
                          </WaterRippleButton>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}