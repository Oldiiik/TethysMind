import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPortfolio, updatePortfolio, getProfile, updateProfile } from '../utils/api';
import { useTranslation } from '../utils/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { BookOpen, Target, Trophy, Sparkles, Settings, Plus, X, Upload, CheckCircle2, AlertCircle, TrendingUp, Search, Globe, Lightbulb, Award, Calendar, ExternalLink, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { recalculateTargetUniversityChance } from '../utils/gemini';
import { verifyCertificateOnline, isWellKnownCompetition } from '../utils/certificateVerification';
import { generateRecommendations, type ProfileAnalysis, type Competition } from '../utils/aiRecommendations';
import { useNavigate } from 'react-router-dom';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const ACHIEVEMENT_POINTS = {
  city: 10,
  republic: 30,
  international: 50,
};

interface Diploma {
  id: number;
  name: string;
  description: string;
  level: 'city' | 'republic' | 'international';
  imagePreview?: string;
  verified: boolean | null;
  verifying: boolean;
}

interface Subject {
  name: string;
  grade: string;
}

export function PortfolioPage() {
  const { activeUserId } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [ieltsScore, setIeltsScore] = useState('');
  const [satScore, setSatScore] = useState('');
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [targetUniversity, setTargetUniversity] = useState<any>(null);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectGrade, setNewSubjectGrade] = useState('');
  const [newDiplomaName, setNewDiplomaName] = useState('');
  const [newDiplomaDesc, setNewDiplomaDesc] = useState('');
  const [newDiplomaLevel, setNewDiplomaLevel] = useState<'city' | 'republic' | 'international'>('city');
  const [previousProbability, setPreviousProbability] = useState<number | null>(null);
  const [calculatingChance, setCalculatingChance] = useState(false); // For manual calculation button
  const [portfolioChanged, setPortfolioChanged] = useState(false); // Track if portfolio changed
  const [expandedLevel, setExpandedLevel] = useState<'city' | 'republic' | 'international' | null>(null);
  
  // AI Recommendations state
  const [profileAnalysis, setProfileAnalysis] = useState<ProfileAnalysis | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);
  
  // Saving states for visual feedback
  const [savingExams, setSavingExams] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, [activeUserId]);

  // Reload when component becomes visible (to catch updates from AI Mentor)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadPortfolio();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track portfolio changes to show notification
  useEffect(() => {
    if (targetUniversity && (subjects.length > 0 || diplomas.length > 0)) {
      setPortfolioChanged(true);
    }
  }, [subjects, diplomas, ieltsScore, satScore]);

  // Manual calculation triggered by button
  const calculateChanceWithAI = async () => {
    if (!targetUniversity) {
      toast.error(t('noTargetUniversity') || 'Целевой университет не выбран');
      return;
    }
    
    setCalculatingChance(true);
    
    try {
      const gpa = calculateGPANumeric();
      const verifiedDiplomas = diplomas.filter(d => d.verified).map(d => ({
        level: d.level,
        name: d.name
      }));
      
      const newProbability = await recalculateTargetUniversityChance(
        {
          name: targetUniversity.name,
          nameRu: targetUniversity.nameRu,
          rank: targetUniversity.rank,
          location: targetUniversity.location
        },
        {
          gpa,
          ieltsScore: ieltsScore ? parseFloat(ieltsScore) : undefined,
          satScore: satScore ? parseFloat(satScore) : undefined,
          achievements: verifiedDiplomas // ✅ FIX: Changed from verifiedDiplomas to achievements
        }
      );
      
      const oldProbability = targetUniversity.probability || 0;
      const diff = newProbability - oldProbability;
      const isIncrease = diff > 0;
      
      // Update target university with new probability
      const updatedTarget = { ...targetUniversity, probability: newProbability };
      setTargetUniversity(updatedTarget);
      
      // Save to backend
      if (activeUserId) {
        await updateProfile({ targetUniversity: updatedTarget }, activeUserId);
      }
      
      // Show notification
      if (Math.abs(diff) >= 0.1) {
        toast.success(
          isIncrease ? t('chanceIncreased') : diff < 0 ? t('chanceDecreased') : t('chanceRecalculated'),
          {
            description: oldProbability > 0 
              ? `${oldProbability}% → ${newProbability}% (${isIncrease ? '+' : ''}${diff.toFixed(1)}%)`
              : `${t('yourAdmissionChance')}: ${newProbability}%`,
            duration: 4000
          }
        );
      } else {
        toast.success(t('chanceRecalculatedFull'), {
          description: `${t('yourCurrentChance')}: ${newProbability}%`,
          duration: 3000
        });
      }
      
      setPreviousProbability(newProbability);
      setPortfolioChanged(false); // Reset the change flag after recalculation
    } catch (error) {
      console.error('Error calculating chance with AI:', error);
      toast.error(t('errorCalculatingChance'), {
        description: t('tryAgainLater'),
        duration: 3000
      });
    } finally {
      setCalculatingChance(false);
    }
  };

  const calculateAdmissionProbability = (): number => {
    if (!targetUniversity) return 0;
    
    // Check if portfolio is empty
    const hasSubjects = subjects.length > 0;
    const hasTestScores = ieltsScore || satScore;
    const hasVerifiedDiplomas = diplomas.filter(d => d.verified).length > 0;
    
    // If portfolio is completely empty, return 0%
    if (!hasSubjects && !hasTestScores && !hasVerifiedDiplomas) {
      return 0;
    }
    
    // Base probability from university rank
    let probability = 50; // Start neutral
    
    // Adjust based on university rank (top universities = harder)
    if (targetUniversity.rank <= 10) {
      probability = 15; // Top 10: very hard
    } else if (targetUniversity.rank <= 50) {
      probability = 30; // Top 50: hard
    } else if (targetUniversity.rank <= 100) {
      probability = 45; // Top 100: moderate
    } else if (targetUniversity.rank <= 200) {
      probability = 60; // Top 200: good chance
    } else {
      probability = 75; // Others: high chance
    }
    
    // GPA impact
    const gpa = calculateGPANumeric();
    if (gpa === 0) {
      // No subjects = huge penalty
      probability -= 40;
    } else if (gpa >= 4.5) {
      probability += 15;
    } else if (gpa >= 4.0) {
      probability += 10;
    } else if (gpa >= 3.5) {
      probability += 5;
    } else if (gpa >= 3.0) {
      probability += 0;
    } else if (gpa >= 2.5) {
      probability -= 10;
    } else {
      probability -= 20;
    }
    
    // IELTS impact
    const ielts = parseFloat(ieltsScore) || 0;
    if (ielts >= 8.0) {
      probability += 10;
    } else if (ielts >= 7.5) {
      probability += 7;
    } else if (ielts >= 7.0) {
      probability += 5;
    } else if (ielts >= 6.5) {
      probability += 2;
    } else if (ielts >= 6.0) {
      probability -= 5;
    } else if (ielts > 0) {
      probability -= 15;
    }
    
    // SAT impact
    const sat = parseFloat(satScore) || 0;
    if (sat >= 1500) {
      probability += 15;
    } else if (sat >= 1400) {
      probability += 10;
    } else if (sat >= 1300) {
      probability += 5;
    } else if (sat >= 1200) {
      probability += 0;
    } else if (sat >= 1000) {
      probability -= 10;
    } else if (sat > 0) {
      probability -= 20;
    }
    
    // Diplomas impact
    const verifiedDiplomas = diplomas.filter(d => d.verified);
    verifiedDiplomas.forEach(diploma => {
      if (diploma.level === 'international') {
        probability += 10;
      } else if (diploma.level === 'republic') {
        probability += 5;
      } else if (diploma.level === 'city') {
        probability += 2;
      }
    });
    
    // Ensure probability is within realistic bounds
    probability = Math.max(0, Math.min(95, probability));
    
    return Math.round(probability);
  };

  const calculateGPANumeric = (): number => {
    if (subjects.length === 0) return 0;
    const total = subjects.reduce((sum, subj) => sum + parseFloat(subj.grade || '0'), 0);
    return total / subjects.length;
  };

  // Calculate overall portfolio strength (0-100%)
  const calculateOverallStrength = (): number => {
    let score = 0;
    
    // GPA Component (40 points max)
    const gpa = calculateGPANumeric();
    if (gpa >= 4.8) score += 40;
    else if (gpa >= 4.5) score += 35;
    else if (gpa >= 4.0) score += 30;
    else if (gpa >= 3.5) score += 25;
    else if (gpa >= 3.0) score += 20;
    else if (gpa > 0) score += 10;
    
    // Test Scores Component (30 points max)
    const ielts = parseFloat(ieltsScore) || 0;
    const sat = parseFloat(satScore) || 0;
    
    // IELTS (15 points max)
    if (ielts >= 8.0) score += 15;
    else if (ielts >= 7.5) score += 13;
    else if (ielts >= 7.0) score += 11;
    else if (ielts >= 6.5) score += 9;
    else if (ielts >= 6.0) score += 7;
    else if (ielts > 0) score += 5;
    
    // SAT (15 points max)
    if (sat >= 1500) score += 15;
    else if (sat >= 1400) score += 13;
    else if (sat >= 1300) score += 11;
    else if (sat >= 1200) score += 9;
    else if (sat >= 1000) score += 7;
    else if (sat > 0) score += 5;
    
    // Achievements Component (30 points max)
    const verifiedDiplomas = diplomas.filter(d => d.verified);
    const international = verifiedDiplomas.filter(d => d.level === 'international').length;
    const republic = verifiedDiplomas.filter(d => d.level === 'republic').length;
    const city = verifiedDiplomas.filter(d => d.level === 'city').length;
    
    const achievementScore = Math.min(30, (international * 10) + (republic * 5) + (city * 2));
    score += achievementScore;
    
    return Math.min(100, Math.round(score));
  };

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      
      // Load from backend ONLY (no localStorage!)
      if (activeUserId) {
        const [portfolioData, profileData, savedRecommendations] = await Promise.all([
          getPortfolio(activeUserId),
          getProfile(activeUserId),
          // Load saved AI recommendations
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6738f032/ai/recommendations/${activeUserId}`, {
            headers: { 
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-User-Token': localStorage.getItem('tethys_token') || ''
            }
          }).then(r => r.json()).catch(() => null)
        ]);
        
        console.log('📦 ====== PORTFOLIO DATA LOADED ======');
        console.log('📊 Portfolio Data:', portfolioData);
        console.log('👤 Profile Data:', profileData);
        console.log('🎯 Target University from profile:', profileData?.targetUniversity);
        console.log('💾 Saved Recommendations:', savedRecommendations);
        console.log('====================================');
        
        setSubjects(portfolioData.subjects || []);
        setIeltsScore(portfolioData.ieltsScore || '');
        setSatScore(portfolioData.satScore || '');
        setDiplomas(portfolioData.diplomas || []);
        setTotalPoints(portfolioData.totalPoints || 0);
        
        // Backend target university takes precedence
        // Fixed: profileData IS the profile, not wrapped
        if (profileData?.targetUniversity) {
          // Convert snake_case from backend to camelCase for frontend
          let uni: any = profileData.targetUniversity;
          console.log('🔍 typeof uni:', typeof uni);
          console.log('🔍 Object.keys(uni):', Object.keys(uni));
          console.log('🔍 JSON.stringify(uni):', JSON.stringify(uni));
          
          // If it's a string, parse it
          if (typeof uni === 'string') {
            console.log('⚠️ uni is a STRING! Parsing...');
            uni = JSON.parse(uni);
          }
          
          console.log('🔍 After parsing - uni.name:', uni.name);
          console.log('🔍 After parsing - uni.name_ru:', uni.name_ru);
          
          // Direct assignment - no fancy tricks
          const convertedUni: any = {};
          convertedUni.name = uni.name;
          convertedUni.nameRu = uni.name_ru;
          convertedUni.nameKk = uni.name_kk;
          convertedUni.location = uni.location;
          convertedUni.locationRu = uni.location_ru;
          convertedUni.locationKk = uni.location_kk;
          convertedUni.rank = uni.rank;
          convertedUni.probability = uni.probability;
          
          console.log('🔄 Converted uni:', convertedUni);
          setTargetUniversity(convertedUni);
          setPreviousProbability(convertedUni.probability || null);
          console.log('✅ Loaded target university from backend:', convertedUni);
        } else {
          // Clear target university if none in backend
          setTargetUniversity(null);
          setPreviousProbability(null);
          console.log('✅ No target university in backend - cleared');
        }
        
        // Restore saved AI recommendations
        console.log('🔍 Checking saved recommendations...');
        console.log('🔍 savedRecommendations:', savedRecommendations);
        console.log('🔍 Has strengths?', savedRecommendations && savedRecommendations.strengths);
        
        if (savedRecommendations && savedRecommendations.strengths) {
          console.log('✅ FOUND SAVED RECOMMENDATIONS! Restoring...');
          const analysis: ProfileAnalysis = {
            strengths: savedRecommendations.strengths,
            weaknesses: savedRecommendations.weaknesses,
            recommendations: savedRecommendations.recommendations,
            internationalCompetitions: savedRecommendations.international_competitions || [],
            nationalCompetitions: savedRecommendations.national_competitions || [],
            localCompetitions: savedRecommendations.local_competitions || []
          };
          setProfileAnalysis(analysis);
          setShowRecommendations(true);
          setLastGeneratedAt(savedRecommendations.created_at);
          console.log('✅ Restored AI recommendations from:', savedRecommendations.created_at);
          console.log('✅ Analysis object:', analysis);
        } else {
          console.log('❌ NO SAVED RECOMMENDATIONS FOUND');
        }
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast.error(t('errorLoadingPortfolio'));
    } finally {
      setLoading(false);
      setPortfolioChanged(false); // Reset on load
    }
  };

  const calculateGPA = () => {
    if (subjects.length === 0) return '0.00';
    const total = subjects.reduce((sum, subj) => sum + parseFloat(subj.grade || '0'), 0);
    return (total / subjects.length).toFixed(2);
  };

  const calculateMonthlyGrowth = () => {
    const recentSubjects = Math.min(subjects.length, 3);
    const recentDiplomas = diplomas.filter(d => d.verified).length;
    const pointsGrowth = recentDiplomas * 30 + recentSubjects * 5;
    return {
      points: pointsGrowth,
      subjects: recentSubjects,
      diplomas: recentDiplomas
    };
  };

  const addSubject = async () => {
    if (newSubjectName && newSubjectGrade) {
      const updatedSubjects = [...subjects, { name: newSubjectName, grade: newSubjectGrade }];
      setSubjects(updatedSubjects);
      setNewSubjectName('');
      setNewSubjectGrade('');
      toast.success(t('subjectAdded'));
      
      if (activeUserId) {
        try {
          await updatePortfolio({
            subjects: updatedSubjects,
            ieltsScore,
            satScore,
            diplomas,
            totalPoints,
          }, activeUserId);
        } catch (error) {
          console.error('Error saving subject:', error);
        }
      }
    }
  };

  const removeSubject = async (index: number) => {
    const updatedSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(updatedSubjects);
    
    if (activeUserId) {
      try {
        await updatePortfolio({
          subjects: updatedSubjects,
          ieltsScore,
          satScore,
          diplomas,
          totalPoints,
        }, activeUserId);
      } catch (error) {
        console.error('Error removing subject:', error);
      }
    }
  };

  // Быстрый пересчёт баллов
  const calculateTotalPoints = (diplomasList: Diploma[]) => {
    return diplomasList
      .filter(d => d.verified === true)
      .reduce((sum, d) => sum + ACHIEVEMENT_POINTS[d.level], 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const savedName = newDiplomaName || file.name;
    const savedDesc = newDiplomaDesc;
    const savedLevel = newDiplomaLevel;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newDiploma: Diploma = {
        id: Date.now(),
        name: savedName,
        description: savedDesc,
        level: savedLevel,
        imagePreview: reader.result as string,
        verified: null,
        verifying: true
      };
      
      const updatedDiplomas = [...diplomas, newDiploma];
      setDiplomas(updatedDiplomas);
      
      // Очистка формы
      setNewDiplomaName('');
      setNewDiplomaDesc('');
      setNewDiplomaLevel('city');

      // Быстрая верификация в фоне
      setTimeout(async () => {
        let verified = false;
        let message = '';
        let verificationMessage = ''; // Legacy variable
        const savedDiplomaName = savedName;
        const savedDiplomaDesc = savedDesc;
        const savedDiplomaLevel = savedLevel;
        
        // Проверка полей
        if (savedName.trim().length < 3) {
          const failedDiplomas = updatedDiplomas.filter(d => d.id !== newDiploma.id);
          setDiplomas(failedDiplomas);
          toast.error(t('certificateNotVerified'), {
            description: '❌ Название диплома слишком короткое',
            duration: 4000
          });
          return;
        }
        
        if (!savedDesc || savedDesc.trim().length < 2) {
          const failedDiplomas = updatedDiplomas.filter(d => d.id !== newDiploma.id);
          setDiplomas(failedDiplomas);
          toast.error(t('certificateNotVerified'), {
            description: '❌ Добавьте описание (например: "1 место")',
            duration: 4000
          });
          return;
        }
        
        // Верификация
        try {
          if (savedLevel === 'republic' || savedLevel === 'international') {
            const result = await verifyCertificateOnline(savedName, savedDesc, savedLevel, newDiploma.imagePreview);
            verified = result.verified;
            message = result.reason;
            
            if (!verified && isWellKnownCompetition(savedName, savedLevel)) {
              verified = true;
              message = '✅ Известная олимпиада';
            }
          } else {
            verified = true;
            message = '✅ Подтверждено';
          }
        } catch (error) {
          verified = false;
          message = '❌ Укажите нормальное название диплома (минимум 3 символа, не просто "аф" или "123"). Например: "Городская олимпиада по математике"';
            
            // 🔥 СРАЗУ ПОКАЗЫВАЕМ TOAST И УДАЛЯЕМ ДИПЛОМ (не ждем 3 секунды)
            console.log('🚫 Invalid name - removing diploma immediately');
            const finalDiplomas = updatedDiplomas.filter(d => d.id !== newDiploma.id);
            setDiplomas(finalDiplomas);
            
            toast.error(t('certificateNotVerified'), {
              description: verificationMessage,
              duration: 7000,
              icon: '❌'
            });
            
            return; // ⚠️ ВЫХОДИМ ИЗ setTimeout - не продолжаем проверку
          }
          if (!savedDiplomaDesc || savedDiplomaDesc.trim() === '') {
            console.error('❌ Diploma description is empty - skipping verification!');
            verified = false;
            verificationMessage = '❌ Опишите диплом (например: "1 место", "Победитель", "Участник"). Описание обязательно для всех уровней.';
            
            // 🔥 СРАЗУ ПОКАЗЫВАЕМ TOAST И УДАЛЯЕМ ДИПЛОМ
            console.log('🚫 Empty description - removing diploma immediately');
            const finalDiplomas = updatedDiplomas.filter(d => d.id !== newDiploma.id);
            setDiplomas(finalDiplomas);
            
            toast.error(t('certificateNotVerified'), {
              description: verificationMessage,
              duration: 7000,
              icon: '❌'
            });
            
            return; // ⚠️ ВЫХОДИМ ИЗ setTimeout
          }
          
          // Все поля заполнены корректно - запускаем РЕАЛЬНУЮ проверку через Vision API для ВСЕХ уровней
          {
              console.log('🚀 ===============================================');
              console.log('🚀 CALLING verifyCertificateOnline()');
              console.log('🚀 ===============================================');
              console.log('📝 Name:', savedDiplomaName);
              console.log('📝 Desc:', savedDiplomaDesc);
              console.log('📝 Level:', savedDiplomaLevel);
              console.log('📸 Has image:', !!newDiploma.imagePreview);
              console.log('📸 Image size:', newDiploma.imagePreview?.length || 0, 'chars');
              
              try {
                console.log('⏳ Calling verifyCertificateOnline...');
                const verificationResult = await verifyCertificateOnline(
                  savedDiplomaName,
                  savedDiplomaDesc,
                  savedDiplomaLevel,
                  newDiploma.imagePreview // 👈 Передаём base64 изображение для Vision API
                );
                console.log('✅ verifyCertificateOnline returned:', verificationResult);
                
                verified = verificationResult.verified;
                verificationMessage = verificationResult.reason;
                
                console.log('📜 Certificate verification:', {
                  name: savedDiplomaName,
                  level: savedDiplomaLevel,
                  verified: verificationResult.verified,
                  confidence: verificationResult.confidence,
                  sources: verificationResult.sources,
                  reason: verificationResult.reason,
                  extractedData: verificationResult.extractedData
                });
                
                // Дополнительная проверка известных олимпиад ТОЛЬКО для текстового поиска
                // НО если Vision API строго отклонил - не переопределяем
                if (!verified && isWellKnownCompetition(savedDiplomaName, savedDiplomaLevel)) {
                  // Если было изображение - НЕ переопределяем решение Vision API
                  if (!newDiploma.imagePreview) {
                    verified = true;
                    verificationMessage = '✅ Сертификат подтвержден! Это известная олимпиада.';
                  } else {
                    // Vision API строго отклонил - не переопределяем
                    console.log('🚫 Vision API rejected despite known competition - respecting strict check');
                  }
                }
              } catch (error) {
                console.error('❌❌❌ ERROR DURING VERIFICATION ❌❌❌');
                console.error('Error details:', error);
                console.error('Error type:', typeof error);
                console.error('Error message:', error instanceof Error ? error.message : String(error));
                console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
                verified = false;
                verificationMessage = '❌ Ошибка проверки. Попробуйте позже.';
              }
            }
          
          let updatedPoints = totalPoints;
          let finalDiplomas = updatedDiplomas;
          
          if (verified) {
            const points = ACHIEVEMENT_POINTS[savedLevel];
            updatedPoints = totalPoints + points;
            setTotalPoints(updatedPoints);
            
            // Обновляем статус диплома на верифицированный
            finalDiplomas = updatedDiplomas.map(d => {
              if (d.id === newDiploma.id) {
                return { ...d, verifying: false, verified: true };
              }
              return d;
            });
            
            toast.success(t('diplomaVerified'), {
              description: verificationMessage,
              duration: 5000,
              icon: '✅'
            });
          } else {
            // ❌ ДИПЛОМ НЕ ПРОШЕЛ ПРОВЕРКУ - УДАЛЯЕМ ЕГО ИЗ СПИСКА
            console.log('🚫 Certificate rejected - removing from list');
            finalDiplomas = updatedDiplomas.filter(d => d.id !== newDiploma.id);
            
            toast.error(t('certificateNotVerified'), {
              description: verificationMessage,
              duration: 7000,
              icon: '❌'
            });
          }
          
          setDiplomas(finalDiplomas);
          
          if (activeUserId) {
            try {
              await updatePortfolio({
                subjects,
                ieltsScore,
                satScore,
                diplomas: finalDiplomas,
                totalPoints: updatedPoints,
              }, activeUserId);
            } catch (error) {
              console.error('Error saving diploma:', error);
            }
          }
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const removeDiploma = async (id: number) => {
    const updatedDiplomas = diplomas.filter(d => d.id !== id);
    setDiplomas(updatedDiplomas);
    
    const updatedPoints = calculateTotalPoints(updatedDiplomas);
    setTotalPoints(updatedPoints);
    
    if (activeUserId) {
      try {
        await updatePortfolio({
          subjects,
          ieltsScore,
          satScore,
          diplomas: updatedDiplomas,
          totalPoints: updatedPoints,
        }, activeUserId);
      } catch (error) {
        console.error('Error removing diploma:', error);
      }
    }
  };

  const getLevelConfig = (level: string) => {
    const configs = {
      city: { 
        label: t('cityLevel'), 
        color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0',
        points: ACHIEVEMENT_POINTS.city
      },
      republic: { 
        label: t('republicLevel'), 
        color: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0',
        points: ACHIEVEMENT_POINTS.republic
      },
      international: { 
        label: t('internationalLevel'), 
        color: 'bg-gradient-to-r from-rose-400 to-orange-400 text-white border-0',
        points: ACHIEVEMENT_POINTS.international
      }
    };
    return configs[level as keyof typeof configs] || configs.city;
  };

  // AI Recommendations generation
  const handleGenerateRecommendations = async () => {
    if (!activeUserId) return;

    try {
      setLoadingRecommendations(true);
      
      // Load both profile and portfolio
      const [profileData, portfolioResponse] = await Promise.all([
        getProfile(activeUserId),
        getPortfolio(activeUserId)
      ]);
      
      // Calculate GPA from subjects
      const calculateGPA = () => {
        const subs = portfolioResponse.subjects || [];
        if (subs.length === 0) return 0; // CHANGED: return 0 instead of 3.5 if no subjects
        const total = subs.reduce((sum: number, subj: any) => sum + parseFloat(subj.grade || '0'), 0);
        return total / subs.length;
      };
      
      // Prepare profile data for AI
      const userProfileData = {
        country: profileData.profile?.country || 'Unknown',
        city: profileData.profile?.city || 'Unknown',
        direction: profileData.profile?.direction || 'technology',
        gpa: calculateGPA(),
        ieltsScore: portfolioResponse.ieltsScore ? parseFloat(portfolioResponse.ieltsScore) : undefined,
        satScore: portfolioResponse.satScore ? parseFloat(portfolioResponse.satScore) : undefined,
        diplomas: portfolioResponse.diplomas || [],
        targetUniversity: profileData.profile?.targetUniversity
      };
      
      const analysis = await generateRecommendations(userProfileData, language);
      
      console.log('🎯 ANALYSIS RECEIVED:', analysis);
      console.log('🎯 Strengths:', analysis?.strengths);
      console.log('🎯 Weaknesses:', analysis?.weaknesses);
      console.log('🎯 Recommendations:', analysis?.recommendations);
      
      setProfileAnalysis(analysis);
      setShowRecommendations(true);
      
      console.log('🎯 STATE UPDATED - showRecommendations:', true);
      console.log('🎯 STATE UPDATED - profileAnalysis:', analysis);
      
      // 💾 SAVE TO DATABASE
      try {
        console.log('🧪 Testing backend connection first...');
        
        // TEST: Проверяем работает ли backend вообще
        const testResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6738f032/test`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        const testResult = await testResponse.text();
        console.log('🧪 Backend test response:', testResponse.status, testResult);
        
        console.log('💾 Saving recommendations to database...');
        console.log('💾 User ID:', activeUserId);
        console.log('💾 Data to save:', {
          profileSnapshot: userProfileData,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          recommendations: analysis.recommendations,
          internationalCompetitions: analysis.internationalCompetitions,
          nationalCompetitions: analysis.nationalCompetitions,
          localCompetitions: analysis.localCompetitions
        });
        
        const saveResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6738f032/ai/recommendations/${activeUserId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': localStorage.getItem('tethys_token') || ''
          },
          body: JSON.stringify({
            profileSnapshot: userProfileData,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            recommendations: analysis.recommendations,
            internationalCompetitions: analysis.internationalCompetitions,
            nationalCompetitions: analysis.nationalCompetitions,
            localCompetitions: analysis.localCompetitions
          })
        });
        
        console.log('💾 Save response status:', saveResponse.status);
        
        // Получаем RAW текст чтобы увидеть что реально вернулось
        const rawText = await saveResponse.text();
        console.log('💾 Save response RAW text:', rawText);
        
        // Пробуем распарсить JSON
        let saveResult;
        try {
          saveResult = JSON.parse(rawText);
          console.log('💾 Save response data:', saveResult);
        } catch (parseError) {
          console.error('❌ Failed to parse response as JSON:', parseError);
          console.log('💾 This means backend returned non-JSON:', rawText);
        }
        
        setLastGeneratedAt(new Date().toISOString());
        console.log('💾 AI recommendations saved to database successfully!');
      } catch (saveError) {
        console.error('❌ Failed to save recommendations:', saveError);
        // Don't show error to user - recommendations still work in UI
      }
      
      toast.success(t('recommendationsGenerated'));
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // generateRecommendations already returns fallback data, so this should never happen
      // But if it does, show error without hiding the UI
      toast.error('Не удалось сгенерировать рекомендации', {
        description: 'Проверьте подключение к интернету',
        duration: 5000
      });
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Render competition card
  const renderCompetitionCard = (competition: Competition) => (
    <Card key={competition.name} className="border border-blue-200/30 dark:border-blue-800/50 hover:border-blue-400/60 dark:hover:border-blue-600/60 transition-colors bg-blue-800/20 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Award className="w-10 h-10 text-blue-400 dark:text-blue-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-blue-100">{competition.name}</h4>
              <Badge className="bg-blue-600 flex-shrink-0">{competition.relevance}%</Badge>
            </div>
            <p className="text-sm text-blue-200/80 mb-2">{competition.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {competition.deadline && (
                <div className="flex items-center gap-1 text-blue-300">
                  <Calendar className="w-4 h-4" />
                  <span>{competition.deadline}</span>
                </div>
              )}
              {competition.website && (
                <a 
                  href={competition.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('visitWebsite')}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const monthlyGrowth = calculateMonthlyGrowth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
            {t('onlinePortfolio')}
          </h1>
          <p className="text-blue-200/80 dark:text-blue-400/80">
            {t('yourAchievementsAndProgress')}
          </p>
        </div>

        {/* Vertical Blocks */}
        <div className="space-y-6">
          {/* Target University */}
          {targetUniversity && (
            <Card className="border border-blue-500/30 bg-blue-800/40 backdrop-blur-sm shadow-lg shadow-blue-500/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">{t('targetUniversity')}</CardTitle>
                    <p className="text-sm text-white/90">
                      {t('yourGoal')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl text-white mb-1">
                      {language === 'ru' ? (targetUniversity.nameRu || targetUniversity.name) : language === 'kk' ? (targetUniversity.nameKk || targetUniversity.name) : targetUniversity.name}
                    </h3>
                    <p className="text-sm text-white/80">
                      {language === 'ru' ? (targetUniversity.locationRu || targetUniversity.location) : language === 'kk' ? (targetUniversity.locationKk || targetUniversity.location) : targetUniversity.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-md shadow-blue-500/20">#{targetUniversity.rank}</Badge>
                      <Badge variant="outline" className="border-blue-400/60 text-blue-200 bg-blue-900/20">
                        {t('worldRanking')}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-center md:text-right space-y-3">
                    <div>
                      <div className="text-5xl bg-gradient-to-br from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                        {targetUniversity.probability || 0}%
                      </div>
                      <div className="text-sm text-white/90 mt-1">
                        {t('admissionChance')}
                      </div>
                    </div>
                    
                    {/* Portfolio change notification */}
                    {portfolioChanged && (
                      <div className="flex items-center gap-2 text-xs text-yellow-300 bg-yellow-900/30 px-3 py-2 rounded-lg border border-yellow-500/30">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {t('portfolioChangedRecalculate')}
                        </span>
                      </div>
                    )}
                    
                    <Button
                      onClick={calculateChanceWithAI}
                      disabled={calculatingChance}
                      className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/30 border-0"
                      size="sm"
                    >
                      {calculatingChance ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          {t('calculating')}
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          {t('calculateChance')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Strength with Monthly Growth */}
          <Card className="border border-violet-500/30 bg-indigo-800/40 backdrop-blur-sm shadow-lg shadow-violet-500/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="bg-gradient-to-r from-blue-300 to-violet-300 bg-clip-text text-transparent">{t('portfolioStrength')}</CardTitle>
                  <p className="text-sm text-blue-200/80">
                    {t('overallRatingDesc')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200/80">{t('overallRating')}</span>
                  <span className="text-3xl bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                    {calculateOverallStrength()}%
                  </span>
                </div>
                <div className="h-3 bg-blue-950/60 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 transition-all duration-500 shadow-md"
                    style={{ width: `${calculateOverallStrength()}%` }}
                  />
                </div>
                
                {/* Monthly Growth */}
                <div className="pt-4 border-t border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-violet-400" />
                    <span className="text-base bg-gradient-to-r from-blue-300 to-violet-300 bg-clip-text text-transparent">{t('monthGrowth')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-700/40 p-3 rounded-lg text-center border border-blue-500/30 shadow-sm backdrop-blur-sm">
                      <div className="text-2xl bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                        +{monthlyGrowth.subjects}
                      </div>
                      <div className="text-xs text-blue-200/70 mt-1">{t('subjectsLower')}</div>
                    </div>
                    <div className="bg-violet-700/40 p-3 rounded-lg text-center border border-violet-500/30 shadow-sm backdrop-blur-sm">
                      <div className="text-2xl bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                        +{monthlyGrowth.diplomas}
                      </div>
                      <div className="text-xs text-blue-200/70 mt-1">{t('diplomasLower')}</div>
                    </div>
                    <div className="bg-rose-700/40 p-3 rounded-lg text-center border border-rose-500/30 shadow-sm backdrop-blur-sm">
                      <div className="text-2xl bg-gradient-to-r from-rose-300 to-pink-300 bg-clip-text text-transparent">
                        {calculateGPA()}
                      </div>
                      <div className="text-xs text-blue-200/70 mt-1">{t('averageGPA')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-blue-500/20">
                  <div className="text-center p-3 bg-blue-700/40 rounded-lg border border-blue-500/30 shadow-sm backdrop-blur-sm">
                    <div className="text-xl text-blue-200">{subjects.length}</div>
                    <div className="text-xs text-blue-200/70">{t('subjects')}</div>
                  </div>
                  <div className="text-center p-3 bg-violet-700/40 rounded-lg border border-violet-500/30 shadow-sm backdrop-blur-sm">
                    <div className="text-xl text-violet-200">
                      {(ieltsScore ? 1 : 0) + (satScore ? 1 : 0)}
                    </div>
                    <div className="text-xs text-blue-200/70">{t('exams')}</div>
                  </div>
                  <div className="text-center p-3 bg-rose-700/40 rounded-lg border border-rose-500/30 shadow-sm backdrop-blur-sm">
                    <div className="text-xl text-rose-200">
                      {diplomas.filter(d => d.verified).length}
                    </div>
                    <div className="text-xs text-blue-200/70">{t('diplomasCount')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1. Report Card */}
          <Card className="border border-blue-500/30 bg-blue-800/40 backdrop-blur-sm shadow-lg shadow-blue-500/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">{t('reportCard')}</CardTitle>
                    <p className="text-sm text-blue-200/80">
                      GPA: <span className="font-bold">{calculateGPA()}</span>
                    </p>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-blue-400/60 text-blue-200 hover:bg-blue-700/40">
                      <Settings className="w-4 h-4 mr-2" />
                      {t('changeEdit')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('reportCardSettings')}</DialogTitle>
                      <DialogDescription>{t('addYourSubjects')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('subjectName')}</Label>
                        <Input
                          placeholder={t('mathematics')}
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('gradeRange')}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          placeholder={t('gradePlaceholder')}
                          value={newSubjectGrade}
                          onChange={(e) => setNewSubjectGrade(e.target.value)}
                        />
                      </div>
                      <Button onClick={addSubject} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addSubject')}
                      </Button>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {subjects.map((subject, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-800/60 rounded-lg border border-blue-600/50">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{subject.name}</span>
                              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">{subject.grade}</Badge>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeSubject(index)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {subjects.slice(0, 4).map((subject, index) => (
                  <div key={index} className="p-3 bg-blue-700/40 rounded-lg text-center border border-blue-500/30 shadow-sm backdrop-blur-sm">
                    <div className="text-xs text-blue-200/70 mb-1">{subject.name}</div>
                    <div className="text-xl bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">{subject.grade}</div>
                  </div>
                ))}
                {subjects.length > 4 && (
                  <div className="p-3 bg-blue-700/40 rounded-lg text-center flex items-center justify-center border border-blue-500/30 backdrop-blur-sm">
                    <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">+{subjects.length - 4}</span>
                  </div>
                )}
              </div>
              {subjects.length === 0 && (
                <p className="text-center text-blue-200/70 py-8">
                  {t('clickEditToAdd')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* 2. IELTS/SAT */}
          <Card className="border border-cyan-500/30 bg-cyan-800/40 backdrop-blur-sm shadow-lg shadow-cyan-500/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="bg-gradient-to-r from-cyan-300 to-sky-300 bg-clip-text text-transparent">{t('internationalExams')}</CardTitle>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-cyan-400/60 text-cyan-200 hover:bg-cyan-700/40">
                      <Settings className="w-4 h-4 mr-2" />
                      {t('changeEdit')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('examScores')}</DialogTitle>
                      <DialogDescription>{t('enterYourResults')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('ieltsScore')}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          placeholder={t('ieltsPlaceholder')}
                          value={ieltsScore}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (e.target.value === '' || (value >= 0 && value <= 9)) {
                              setIeltsScore(e.target.value);
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value > 0) {
                              // Round to nearest 0.5
                              const rounded = Math.round(value * 2) / 2;
                              const clamped = Math.max(0, Math.min(9, rounded));
                              setIeltsScore(clamped.toString());
                            } else if (e.target.value === '' || value === 0) {
                              setIeltsScore(''); // Allow empty or 0
                            }
                          }}
                        />
                        <p className="text-xs text-blue-300/70">{t('ieltsRange') || '0-9 (step 0.5) - Leave empty if not taken'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('satScore')}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="1600"
                          step="10"
                          placeholder={t('satPlaceholder')}
                          value={satScore}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (e.target.value === '' || (value >= 0 && value <= 1600)) {
                              setSatScore(e.target.value);
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value > 0) {
                              // Valid SAT scores are 400-1600, but allow any input
                              const clamped = Math.min(1600, value);
                              setSatScore(clamped.toString());
                            } else if (e.target.value === '' || value === 0) {
                              setSatScore(''); // Allow empty or 0
                            }
                          }}
                        />
                        <p className="text-xs text-blue-300/70">{t('satRange') || '400-1600 - Leave empty if not taken'}</p>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700"
                        onClick={async () => {
                          if (activeUserId) {
                            setSavingExams(true);
                            try {
                              await updatePortfolio({
                                subjects,
                                ieltsScore,
                                satScore,
                                diplomas,
                                totalPoints,
                              }, activeUserId);
                              toast.success(t('savedSuccessfully'));
                            } catch (error) {
                              console.error('Error saving exam scores:', error);
                              toast.error(t('errorSaving'));
                            } finally {
                              setSavingExams(false);
                            }
                          }
                        }}
                      >
                        {savingExams ? '...' : t('saveButton')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-cyan-700/40 backdrop-blur-sm rounded-lg text-center border border-cyan-500/30 shadow-sm">
                  <div className="text-sm text-blue-200/70 mb-2">IELTS</div>
                  <div className="text-3xl bg-gradient-to-r from-cyan-300 to-sky-300 bg-clip-text text-transparent">
                    {ieltsScore || '—'}
                  </div>
                </div>
                <div className="p-4 bg-cyan-700/40 backdrop-blur-sm rounded-lg text-center border border-cyan-500/30 shadow-sm">
                  <div className="text-sm text-blue-200/70 mb-2">SAT</div>
                  <div className="text-3xl bg-gradient-to-r from-cyan-300 to-sky-300 bg-clip-text text-transparent">
                    {satScore || '—'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Achievements */}
          <Card className="border border-teal-500/30 bg-teal-800/40 backdrop-blur-sm shadow-lg shadow-teal-500/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">{t('achievements')}</CardTitle>
                    <p className="text-sm text-blue-200/80">
                      {diplomas.filter(d => d.verified).length} {t('verified')}
                    </p>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-teal-400/60 text-teal-200 hover:bg-teal-700/40">
                      <Settings className="w-4 h-4 mr-2" />
                      {t('changeEdit')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('addAchievementTitle')}</DialogTitle>
                      <DialogDescription>{t('uploadDiplomaPhoto')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('name')}</Label>
                        <Input
                          placeholder={t('olympiadWinner')}
                          value={newDiplomaName}
                          onChange={(e) => setNewDiplomaName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('description')}</Label>
                        <Textarea
                          placeholder={t('briefDescription')}
                          value={newDiplomaDesc}
                          onChange={(e) => setNewDiplomaDesc(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('scale')}</Label>
                        <Select value={newDiplomaLevel} onValueChange={(value: any) => setNewDiplomaLevel(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="city">{t('cityScale')}</SelectItem>
                            <SelectItem value="republic">{t('republicScale')}</SelectItem>
                            <SelectItem value="international">{t('internationalScale')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('diplomaPhoto')}</Label>
                        <label htmlFor="diploma-upload" className="cursor-pointer block mt-2">
                          <div className="border-2 border-dashed border-teal-400/60 rounded-lg p-6 text-center hover:bg-teal-700/20 transition-colors">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-teal-300" />
                            <p className="text-sm text-teal-200">{t('uploadFile')}</p>
                          </div>
                          <input
                            id="diploma-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {diplomas.map((diploma) => {
                          const levelConfig = getLevelConfig(diploma.level);
                          return (
                            <div key={diploma.id} className="p-3 bg-teal-800/60 rounded-lg border border-teal-600/50">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="text-sm">{diploma.name}</h4>
                                  {diploma.description && (
                                    <p className="text-xs text-teal-300 mt-1">{diploma.description}</p>
                                  )}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeDiploma(diploma.id)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={levelConfig.color}>
                                  {levelConfig.label}
                                </Badge>
                                {diploma.verifying ? (
                                  <Badge variant="outline" className="gap-1">
                                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    {t('verifying')}
                                  </Badge>
                                ) : diploma.verified ? (
                                  <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white gap-1 border-0">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {t('verifiedStatus')}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white gap-1 border-0">
                                    <AlertCircle className="w-3 h-4" />
                                    {t('rejected')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* City Level */}
                <Collapsible open={expandedLevel === 'city'} onOpenChange={(open) => setExpandedLevel(open ? 'city' : null)}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full p-4 bg-teal-700/40 rounded-lg border border-teal-500/30 shadow-sm backdrop-blur-sm hover:bg-teal-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-blue-200/70">{t('cityLevelShort')}</div>
                          <div className="text-2xl bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                            {diplomas.filter(d => d.level === 'city' && d.verified).length}
                          </div>
                        </div>
                        {expandedLevel === 'city' ? (
                          <ChevronUp className="w-5 h-5 text-teal-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-teal-300" />
                        )}
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    {diplomas.filter(d => d.level === 'city' && d.verified).map((diploma) => (
                      <div key={diploma.id} className="p-3 bg-teal-800/60 rounded-lg border border-teal-600/50 ml-4">
                        <h4 className="text-sm text-teal-100">{diploma.name}</h4>
                        {diploma.description && (
                          <p className="text-xs text-teal-300 mt-1">{diploma.description}</p>
                        )}
                      </div>
                    ))}
                    {diplomas.filter(d => d.level === 'city' && d.verified).length === 0 && (
                      <p className="text-xs text-teal-300/60 ml-4">{t('noDiplomas') || 'Нет дипломов'}</p>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Republic Level */}
                <Collapsible open={expandedLevel === 'republic'} onOpenChange={(open) => setExpandedLevel(open ? 'republic' : null)}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full p-4 bg-blue-700/40 rounded-lg border border-blue-500/30 shadow-sm backdrop-blur-sm hover:bg-blue-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-blue-200/70">{t('republicShort')}</div>
                          <div className="text-2xl bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                            {diplomas.filter(d => d.level === 'republic' && d.verified).length}
                          </div>
                        </div>
                        {expandedLevel === 'republic' ? (
                          <ChevronUp className="w-5 h-5 text-blue-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-blue-300" />
                        )}
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    {diplomas.filter(d => d.level === 'republic' && d.verified).map((diploma) => (
                      <div key={diploma.id} className="p-3 bg-blue-800/60 rounded-lg border border-blue-600/50 ml-4">
                        <h4 className="text-sm text-blue-100">{diploma.name}</h4>
                        {diploma.description && (
                          <p className="text-xs text-blue-300 mt-1">{diploma.description}</p>
                        )}
                      </div>
                    ))}
                    {diplomas.filter(d => d.level === 'republic' && d.verified).length === 0 && (
                      <p className="text-xs text-blue-300/60 ml-4">{t('noDiplomas') || 'Нет дипломов'}</p>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* International Level */}
                <Collapsible open={expandedLevel === 'international'} onOpenChange={(open) => setExpandedLevel(open ? 'international' : null)}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full p-4 bg-emerald-700/40 rounded-lg border border-emerald-500/30 shadow-sm backdrop-blur-sm hover:bg-emerald-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-blue-200/70">{t('internationalShort')}</div>
                          <div className="text-2xl bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                            {diplomas.filter(d => d.level === 'international' && d.verified).length}
                          </div>
                        </div>
                        {expandedLevel === 'international' ? (
                          <ChevronUp className="w-5 h-5 text-emerald-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-emerald-300" />
                        )}
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    {diplomas.filter(d => d.level === 'international' && d.verified).map((diploma) => (
                      <div key={diploma.id} className="p-3 bg-emerald-800/60 rounded-lg border border-emerald-600/50 ml-4">
                        <h4 className="text-sm text-emerald-100">{diploma.name}</h4>
                        {diploma.description && (
                          <p className="text-xs text-emerald-300 mt-1">{diploma.description}</p>
                        )}
                      </div>
                    ))}
                    {diplomas.filter(d => d.level === 'international' && d.verified).length === 0 && (
                      <p className="text-xs text-emerald-300/60 ml-4">{t('noDiplomas') || 'Нет дипломов'}</p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations Button */}
          {activeUserId && (
            <Card className="border border-purple-500/30 bg-purple-800/40 backdrop-blur-sm shadow-lg shadow-purple-500/10">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-purple-100">{t('aiRecommendations')}</h3>
                      <p className="text-sm text-purple-200/80">{t('getPersonalizedAdvice')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateRecommendations}
                    disabled={loadingRecommendations}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-500/30"
                  >
                    {loadingRecommendations ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {t('generateRecommendations')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis Results */}
          {console.log('🖥️ RENDER CHECK - showRecommendations:', showRecommendations, 'profileAnalysis:', profileAnalysis)}
          {showRecommendations && profileAnalysis && (
            <>
              {console.log('🖥️ RENDERING AI RESULTS!')}
              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="border border-green-500/30 bg-green-800/40 backdrop-blur-sm shadow-lg shadow-green-500/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-green-400" />
                      <CardTitle className="text-green-100">{t('strengths')}</CardTitle>
                    </div>
                    <CardDescription className="text-green-200/80">
                      {t('yourStrongPoints')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {profileAnalysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-green-100">
                          <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="border border-orange-500/30 bg-orange-800/40 backdrop-blur-sm shadow-lg shadow-orange-500/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-400" />
                      <CardTitle className="text-orange-100">{t('areasForImprovement')}</CardTitle>
                    </div>
                    <CardDescription className="text-orange-200/80">
                      {t('whatToWorkOn')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {profileAnalysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2 text-orange-100">
                          <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-400" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="border border-blue-500/30 bg-blue-800/40 backdrop-blur-sm shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-400" />
                    <CardTitle className="text-blue-100">{t('recommendations')}</CardTitle>
                  </div>
                  <CardDescription className="text-blue-200/80">
                    {t('actionPlan')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {profileAnalysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Badge className="bg-blue-600 flex-shrink-0">{index + 1}</Badge>
                        <span className="text-blue-100">{recommendation}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Competitions - International */}
              {profileAnalysis.internationalCompetitions.length > 0 && (
                <Card className="border border-purple-500/30 bg-purple-800/40 backdrop-blur-sm shadow-lg shadow-purple-500/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-400" />
                      <CardTitle className="text-purple-100">{t('internationalCompetitions')}</CardTitle>
                    </div>
                    <CardDescription className="text-purple-200/80">
                      {t('prestigiousWorldwideEvents')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profileAnalysis.internationalCompetitions.map(renderCompetitionCard)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Competitions - National */}
              {profileAnalysis.nationalCompetitions.length > 0 && (
                <Card className="border border-blue-500/30 bg-blue-800/40 backdrop-blur-sm shadow-lg shadow-blue-500/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-400" />
                      <CardTitle className="text-blue-100">{t('nationalCompetitions')}</CardTitle>
                    </div>
                    <CardDescription className="text-blue-200/80">
                      {t('competitionsInYourCountry')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profileAnalysis.nationalCompetitions.map(renderCompetitionCard)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Competitions - Local */}
              {profileAnalysis.localCompetitions.length > 0 && (
                <Card className="border border-cyan-500/30 bg-cyan-800/40 backdrop-blur-sm shadow-lg shadow-cyan-500/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-cyan-400" />
                      <CardTitle className="text-cyan-100">{t('localCompetitions')}</CardTitle>
                    </div>
                    <CardDescription className="text-cyan-200/80">
                      {t('competitionsInYourCity')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profileAnalysis.localCompetitions.map(renderCompetitionCard)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}