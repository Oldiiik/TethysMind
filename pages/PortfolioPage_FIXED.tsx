// This will be the fixed version - creating helper function for diploma upload
// We need to completely rewrite handleFileUpload function

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
import { BookOpen, Target, Trophy, Sparkles, Settings, Plus, X, Upload, CheckCircle2, AlertCircle, TrendingUp, Search, Globe, Lightbulb, Award, Calendar, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { recalculateTargetUniversityChance } from '../utils/gemini';
import { verifyCertificateOnline, isWellKnownCompetition } from '../utils/certificateVerification';
import { generateRecommendations, type ProfileAnalysis, type Competition } from '../utils/aiRecommendations';
import { useNavigate } from 'react-router-dom';

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

// FIXED handleFileUpload function
const handleFileUploadFixed = (
  file: File,
  savedName: string,
  savedDesc: string,
  savedLevel: 'city' | 'republic' | 'international',
  diplomas: Diploma[],
  setDiplomas: (d: Diploma[]) => void,
  calculateTotalPoints: (d: Diploma[]) => number,
  setTotalPoints: (p: number) => void,
  activeUserId: string | null,
  updatePortfolio: any,
  subjects: Subject[],
  ieltsScore: string,
  satScore: string,
  t: any
) => {
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

    // Quick verification in background
    setTimeout(async () => {
      let verified = false;
      let message = '';
      
      // Check fields
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
      
      // Verification
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
        message = '❌ Ошибка проверки';
      }
      
      // Update status
      const finalDiplomas = verified
        ? updatedDiplomas.map(d => d.id === newDiploma.id ? { ...d, verifying: false, verified: true } : d)
        : updatedDiplomas.filter(d => d.id !== newDiploma.id);
      
      setDiplomas(finalDiplomas);
      
      // Recalculate points
      const updatedPoints = calculateTotalPoints(finalDiplomas);
      setTotalPoints(updatedPoints);
      
      // Autosave
      if (activeUserId) {
        await updatePortfolio({
          subjects,
          ieltsScore,
          satScore,
          diplomas: finalDiplomas,
          totalPoints: updatedPoints,
        }, activeUserId);
      }
      
      // Notification
      if (verified) {
        toast.success(t('diplomaVerified'), { description: message });
      } else {
        toast.error(t('certificateNotVerified'), { description: message });
      }
    }, 1500);
  };
  reader.readAsDataURL(file);
};

export { handleFileUploadFixed };
