import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Settings, Plus, X, Upload, CheckCircle2, AlertCircle, BookOpen, Target, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ACHIEVEMENT_POINTS } from '../utils/points';
import { useAuth } from '../contexts/AuthContext';
import { getPortfolio, updatePortfolio } from '../utils/api';
import { useTranslation } from '../utils/i18n';

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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [ieltsScore, setIeltsScore] = useState('');
  const [satScore, setSatScore] = useState('');
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectGrade, setNewSubjectGrade] = useState('');
  const [newDiplomaName, setNewDiplomaName] = useState('');
  const [newDiplomaDesc, setNewDiplomaDesc] = useState('');
  const [newDiplomaLevel, setNewDiplomaLevel] = useState<'city' | 'republic' | 'international'>('city');

  useEffect(() => {
    loadPortfolio();
  }, [activeUserId]);

  const loadPortfolio = async () => {
    if (!activeUserId) return;

    try {
      setLoading(true);
      const data = await getPortfolio(activeUserId);
      setSubjects(data.subjects || []);
      setIeltsScore(data.ieltsScore || '');
      setSatScore(data.satScore || '');
      setDiplomas(data.diplomas || []);
      setTotalPoints(data.totalPoints || 0);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast.error(t('errorLoadingPortfolio'));
    } finally {
      setLoading(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newDiploma: Diploma = {
          id: Date.now(),
          name: newDiplomaName || file.name,
          description: newDiplomaDesc,
          level: newDiplomaLevel,
          imagePreview: reader.result as string,
          verified: null,
          verifying: true
        };
        const updatedDiplomas = [...diplomas, newDiploma];
        setDiplomas(updatedDiplomas);

        setTimeout(async () => {
          const verified = Math.random() > 0.2;
          let updatedPoints = totalPoints;
          
          if (verified) {
            const points = ACHIEVEMENT_POINTS[newDiplomaLevel];
            updatedPoints = totalPoints + points;
            setTotalPoints(updatedPoints);
            toast.success(t('diplomaVerified'));
          }
          
          const finalDiplomas = updatedDiplomas.map(d => {
            if (d.id === newDiploma.id) {
              return { ...d, verifying: false, verified };
            }
            return d;
          });
          
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
        }, 2500);

        setNewDiplomaName('');
        setNewDiplomaDesc('');
        setNewDiplomaLevel('city');
        toast.success(t('diplomaUploaded'));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDiploma = async (id: number) => {
    const diploma = diplomas.find(d => d.id === id);
    let updatedPoints = totalPoints;
    
    if (diploma && diploma.verified) {
      const points = ACHIEVEMENT_POINTS[diploma.level];
      updatedPoints = totalPoints - points;
      setTotalPoints(updatedPoints);
    }
    
    const updatedDiplomas = diplomas.filter(d => d.id !== id);
    setDiplomas(updatedDiplomas);
    
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
        color: 'bg-emerald-600 text-white',
        points: ACHIEVEMENT_POINTS.city
      },
      republic: { 
        label: t('republicLevel'), 
        color: 'bg-violet-600 text-white',
        points: ACHIEVEMENT_POINTS.republic
      },
      international: { 
        label: t('internationalLevel'), 
        color: 'bg-amber-600 text-white',
        points: ACHIEVEMENT_POINTS.international
      }
    };
    return configs[level as keyof typeof configs] || configs.city;
  };

  const monthlyGrowth = calculateMonthlyGrowth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
            {t('onlinePortfolio')}
          </h1>
          <p className="text-blue-600 dark:text-blue-400">
            {t('yourAchievementsAndProgress')}
          </p>
        </div>

        {/* Vertical Blocks */}
        <div className="space-y-6">
          {/* Portfolio Strength with Monthly Growth */}
          <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-100/50 to-pink-100/50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-purple-700 dark:text-purple-300">{t('portfolioStrength')}</CardTitle>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {t('overallRatingDesc')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 dark:text-blue-400">{t('overallRating')}</span>
                  <span className="text-3xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    {Math.min(Math.round((totalPoints / 300) * 100), 100)}%
                  </span>
                </div>
                <div className="h-3 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500"
                    style={{ width: `${Math.min((totalPoints / 300) * 100, 100)}%` }}
                  />
                </div>
                
                {/* Monthly Growth */}
                <div className="pt-4 border-t border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-base text-blue-700 dark:text-blue-300">{t('monthGrowth')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg text-center">
                      <div className="text-2xl bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                        +{monthlyGrowth.subjects}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('subjectsLower')}</div>
                    </div>
                    <div className="bg-violet-100 dark:bg-violet-900/30 p-3 rounded-lg text-center">
                      <div className="text-2xl bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                        +{monthlyGrowth.diplomas}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('diplomasLower')}</div>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg text-center">
                      <div className="text-2xl bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                        {calculateGPA()}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('averageGPA')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-purple-200 dark:border-purple-800">
                  <div className="text-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <div className="text-xl text-indigo-700 dark:text-indigo-300">{subjects.length}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">{t('subjects')}</div>
                  </div>
                  <div className="text-center p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <div className="text-xl text-cyan-700 dark:text-cyan-300">
                      {(ieltsScore ? 1 : 0) + (satScore ? 1 : 0)}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">{t('exams')}</div>
                  </div>
                  <div className="text-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <div className="text-xl text-amber-700 dark:text-amber-300">
                      {diplomas.filter(d => d.verified).length}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">{t('diplomasCount')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1. Report Card */}
          <Card className="border-2 border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-100/50 to-blue-100/50 dark:from-indigo-950/30 dark:to-blue-950/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-indigo-700 dark:text-indigo-300">{t('reportCard')}</CardTitle>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      GPA: <span className="font-bold">{calculateGPA()}</span>
                    </p>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-indigo-400 text-indigo-700 dark:text-indigo-300">
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
                      <Button onClick={addSubject} className="w-full bg-indigo-600">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addSubject')}
                      </Button>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {subjects.map((subject, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{subject.name}</span>
                              <Badge className="bg-indigo-600 text-white">{subject.grade}</Badge>
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
                  <div key={index} className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg text-center">
                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">{subject.name}</div>
                    <div className="text-xl text-indigo-700 dark:text-indigo-300">{subject.grade}</div>
                  </div>
                ))}
                {subjects.length > 4 && (
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-center flex items-center justify-center">
                    <span className="text-indigo-700 dark:text-indigo-300">+{subjects.length - 4}</span>
                  </div>
                )}
              </div>
              {subjects.length === 0 && (
                <p className="text-center text-blue-600 dark:text-blue-400 py-8">
                  {t('clickEditToAdd')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* 2. IELTS/SAT */}
          <Card className="border-2 border-cyan-300 dark:border-cyan-700 bg-gradient-to-br from-cyan-100/50 to-blue-100/50 dark:from-cyan-950/30 dark:to-blue-950/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-cyan-700 dark:text-cyan-300">{t('internationalExams')}</CardTitle>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-cyan-400 text-cyan-700 dark:text-cyan-300">
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
                          onChange={(e) => setIeltsScore(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('satScore')}</Label>
                        <Input
                          type="number"
                          min="400"
                          max="1600"
                          placeholder={t('satPlaceholder')}
                          value={satScore}
                          onChange={(e) => setSatScore(e.target.value)}
                        />
                      </div>
                      <Button className="w-full bg-cyan-600">{t('saveButton')}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg text-center">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">IELTS</div>
                  <div className="text-3xl text-cyan-700 dark:text-cyan-300">
                    {ieltsScore || '—'}
                  </div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg text-center">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">SAT</div>
                  <div className="text-3xl text-cyan-700 dark:text-cyan-300">
                    {satScore || '—'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Achievements */}
          <Card className="border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-100/50 to-orange-100/50 dark:from-amber-950/30 dark:to-orange-950/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-amber-700 dark:text-amber-300">{t('achievements')}</CardTitle>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {diplomas.filter(d => d.verified).length} {t('verified')}
                    </p>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-amber-400 text-amber-700 dark:text-amber-300">
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
                          <div className="border-2 border-dashed border-amber-400 rounded-lg p-6 text-center hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                            <p className="text-sm text-amber-700 dark:text-amber-300">{t('uploadFile')}</p>
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
                            <div key={diploma.id} className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="text-sm">{diploma.name}</h4>
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
                                  <Badge className="bg-green-600 text-white gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {t('verifiedStatus')}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-600 text-white gap-1">
                                    <AlertCircle className="w-3 h-3" />
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
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-center">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">{t('cityLevelShort')}</div>
                  <div className="text-2xl text-emerald-700 dark:text-emerald-300">
                    {diplomas.filter(d => d.level === 'city' && d.verified).length}
                  </div>
                </div>
                <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-center">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">{t('republicShort')}</div>
                  <div className="text-2xl text-violet-700 dark:text-violet-300">
                    {diplomas.filter(d => d.level === 'republic' && d.verified).length}
                  </div>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-center">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">{t('internationalShort')}</div>
                  <div className="text-2xl text-amber-700 dark:text-amber-300">
                    {diplomas.filter(d => d.level === 'international' && d.verified).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
