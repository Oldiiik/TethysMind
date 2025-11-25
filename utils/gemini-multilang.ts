/**
 * Multilingual AI Recommendations
 * Генерация рекомендаций на разных языках
 */

import { generateText } from './gemini';

export type Language = 'ru' | 'kk' | 'en';

interface UserProfile {
  country: string;
  city: string;
  direction: string;
  gpa: number;
  ieltsScore?: number;
  satScore?: number;
  diplomas: Array<{ level: string; name: string }>;
  targetUniversity?: {
    name: string;
    rank: number;
    probability: number;
  };
}

/**
 * Generate multilingual prompt for AI recommendations
 */
function generatePrompt(userProfile: UserProfile, language: Language): string {
  const prompts = {
    ru: {
      expert: 'Ты - эксперт по подготовке к поступлению в топовые университеты мира. Проанализируй профиль студента ДЕТАЛЬНО и дай КОНКРЕТНЫЕ рекомендации.',
      profile: 'ПРОФИЛЬ СТУДЕНТА:',
      country: 'Страна',
      city: 'Город',
      direction: 'Направление',
      noTest: 'не сдавал',
      diplomas: 'Дипломы и награды',
      none: 'нет',
      targetUni: 'ЦЕЛЕВОЙ УНИВЕРСИТЕТ',
      ranking: 'Рейтинг QS',
      currentChance: 'Текущий шанс поступления',
      important: '⚠️ ВАЖНО: Все рекомендации должны быть направлены на ПОВЫШЕНИЕ шансов поступления именно в',
      requirements: 'Учитывай требования университетов уровня TOP',
      format: 'Для профиля студента предоставь анализ в следующем формате:',
      strengths: 'СИЛЬНЫЕ СТОРОНЫ',
      weaknesses: 'СЛАБЫЕ СТОРОНЫ',
      recommendations: 'РЕКОМЕНДАЦИИ',
      strongPoint: 'сильная сторона',
      weakPoint: 'слабая сторона',
      recommendation: 'рекомендация',
      concrete: 'КОНКРЕТНАЯ для целевого университета',
      importantRules: 'ВАЖНО:',
      rule1: 'Давай КОНКРЕТНЫЕ рекомендации с действиями',
      rule2: 'Учитывай специфику направления',
      rule3: 'Будь реалистичным для студента из',
      rule4: 'ВСЕ рекомендации должны помогать поступить в',
      rule5: 'Указывай КОНКРЕТНЫЕ требования этого уровня университетов (минимальный IELTS, SAT, типы достижений)',
      rule6: 'Приоритезируй рекомендации по важности для поступления'
    },
    kk: {
      expert: 'Сіз - әлемдегі топ университеттерге түсуге дайындалу жөніндегі сарапшысыз. Студенттің профилін ДЕТАЛЬДІ талдаңыз және НАҚТЫ ұсыныстар беріңіз.',
      profile: 'СТУДЕНТТІҢ ПРОФИЛІ:',
      country: 'Ел',
      city: 'Қала',
      direction: 'Бағыт',
      noTest: 'тапсырмаған',
      diplomas: 'Дипломдар мен марапаттар',
      none: 'жоқ',
      targetUni: 'МАҚСАТТЫ УНИВЕРСИТЕТ',
      ranking: 'QS рейтингі',
      currentChance: 'Қазіргі қабылдану мүмкіндігі',
      important: '⚠️ МАҢЫЗДЫ: Барлық ұсыныстар',
      requirements: 'университетіне қабылдану мүмкіндігін АРТТЫРУҒА бағытталған болуы керек. TOP деңгейіндегі университеттердің талаптарын ескеріңіз',
      format: 'Студент профилі үшін келесі форматта талдау беріңіз:',
      strengths: 'КҮШТІ ЖАҚТАРЫ',
      weaknesses: 'ӘЛСІЗ ЖАҚТАРЫ',
      recommendations: 'ҰСЫНЫСТАР',
      strongPoint: 'күшті жақ',
      weakPoint: 'әлсіз жақ',
      recommendation: 'ұсыныс',
      concrete: 'мақсатты университет үшін НАҚТЫ',
      importantRules: 'МАҢЫЗДЫ:',
      rule1: 'НАҚТЫ әрекеттермен ұсыныстар беріңіз',
      rule2: 'бағытының ерекшелігін ескеріңіз',
      rule3: 'еліндегі студент үшін шынайы болыңыз',
      rule4: 'БАРЛЫҚ ұсыныстар',
      rule5: 'университетіне түсуге көмектесуі керек. Осы деңгейдегі университеттердің НАҚТЫ талаптарын көрсетіңіз (минималды IELTS, SAT, жетістіктер түрлері)',
      rule6: 'Ұсыныстарды түсу үшін маңыздылығы бойынша басымдықпен беріңіз'
    },
    en: {
      expert: 'You are an expert in preparing students for admission to top universities in the world. Analyze the student\'s profile in DETAIL and give SPECIFIC recommendations.',
      profile: 'STUDENT PROFILE:',
      country: 'Country',
      city: 'City',
      direction: 'Direction',
      noTest: 'not taken',
      diplomas: 'Diplomas and awards',
      none: 'none',
      targetUni: 'TARGET UNIVERSITY',
      ranking: 'QS Ranking',
      currentChance: 'Current admission chance',
      important: '⚠️ IMPORTANT: All recommendations should be aimed at INCREASING the chances of admission to',
      requirements: 'Consider the requirements of TOP',
      format: 'For the student profile, provide analysis in the following format:',
      strengths: 'STRENGTHS',
      weaknesses: 'WEAKNESSES',
      recommendations: 'RECOMMENDATIONS',
      strongPoint: 'strength',
      weakPoint: 'weakness',
      recommendation: 'recommendation',
      concrete: 'SPECIFIC for target university',
      importantRules: 'IMPORTANT:',
      rule1: 'Give SPECIFIC recommendations with actions',
      rule2: 'Consider the specifics of the',
      rule3: 'Be realistic for a student from',
      rule4: 'ALL recommendations should help get admitted to',
      rule5: 'Specify SPECIFIC requirements for this level of universities (minimum IELTS, SAT, types of achievements)',
      rule6: 'Prioritize recommendations by importance for admission'
    }
  };

  const t = prompts[language];
  
  return `${t.expert}

${t.profile}
- ${t.country}: ${userProfile.country}
- ${t.city}: ${userProfile.city}
- ${t.direction}: ${userProfile.direction}
- GPA: ${(userProfile.gpa || 0).toFixed(2)} / 5.0
${userProfile.ieltsScore ? `- IELTS: ${userProfile.ieltsScore}` : `- IELTS: ${t.noTest}`}
${userProfile.satScore ? `- SAT: ${userProfile.satScore}` : `- SAT: ${t.noTest}`}
- ${t.diplomas}: ${userProfile.diplomas.length > 0 ? userProfile.diplomas.map(d => `${d.name} (${d.level})`).join(', ') : t.none}
${userProfile.targetUniversity ? `
🎯 ${t.targetUni}: ${userProfile.targetUniversity.name}
   ${t.ranking}: #${userProfile.targetUniversity.rank}
   ${t.currentChance}: ${userProfile.targetUniversity.probability}%
   
   ${t.important} ${userProfile.targetUniversity.name}!
   ${t.requirements}-${userProfile.targetUniversity.rank < 50 ? '50' : userProfile.targetUniversity.rank < 100 ? '100' : '200'}.
` : ''}

${t.format}

${t.strengths}:
- [${t.strongPoint} 1]
- [${t.strongPoint} 2]
- [${t.strongPoint} 3]
---

${t.weaknesses}:
- [${t.weakPoint} 1]
- [${t.weakPoint} 2]
- [${t.weakPoint} 3]
---

${t.recommendations}:
- [${t.recommendation} 1 - ${t.concrete}]
- [${t.recommendation} 2 - ${t.concrete}]
- [${t.recommendation} 3 - ${t.concrete}]
- [${t.recommendation} 4]
- [${t.recommendation} 5]
---

${t.importantRules}
1. ${t.rule1}
2. ${t.rule2} "${userProfile.direction}"
3. ${t.rule3} ${userProfile.country}
${userProfile.targetUniversity ? `4. ${t.rule4} ${userProfile.targetUniversity.name} (${t.ranking} #${userProfile.targetUniversity.rank})
5. ${t.rule5}
6. ${t.rule6}` : ''}`;
}

/**
 * Parse AI response based on language
 */
function parseResponse(aiText: string, language: Language): {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
} {
  const results = {
    strengths: [] as string[],
    weaknesses: [] as string[],
    recommendations: [] as string[]
  };

  // Remove markdown formatting
  const cleanText = aiText.replace(/\*\*/g, '').replace(/\*/g, '');
  
  const blocks = cleanText.split('---').filter(b => b.trim());

  // Section markers by language
  const markers = {
    ru: {
      strengths: 'СИЛЬНЫЕ СТОРОНЫ',
      weaknesses: 'СЛАБЫЕ СТОРОНЫ',
      recommendations: 'РЕКОМЕНДАЦИИ'
    },
    kk: {
      strengths: 'КҮШТІ ЖАҚТАРЫ',
      weaknesses: 'ӘЛСІЗ ЖАҚТАРЫ',
      recommendations: 'ҰСЫНЫСТАР'
    },
    en: {
      strengths: 'STRENGTHS',
      weaknesses: 'WEAKNESSES',
      recommendations: 'RECOMMENDATIONS'
    }
  };

  const m = markers[language];

  for (const block of blocks) {
    try {
      if (block.includes(m.strengths)) {
        const lines = block.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed.startsWith('-') || /^\d+\./.test(trimmed);
        });
        results.strengths = lines.map(line => line.replace(/^[-\d.]+\s*/, '').trim()).filter(Boolean);
      } else if (block.includes(m.weaknesses)) {
        const lines = block.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed.startsWith('-') || /^\d+\./.test(trimmed);
        });
        results.weaknesses = lines.map(line => line.replace(/^[-\d.]+\s*/, '').trim()).filter(Boolean);
      } else if (block.includes(m.recommendations)) {
        const lines = block.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed.startsWith('-') || /^\d+\./.test(trimmed);
        });
        results.recommendations = lines.map(line => line.replace(/^[-\d.]+\s*/, '').trim()).filter(Boolean);
      }
    } catch (err) {
      console.warn('⚠️ Failed to parse block:', err);
    }
  }

  return results;
}

/**
 * Generate multilingual AI recommendations
 */
export async function generateMultilingualRecommendations(
  userProfile: UserProfile,
  language: Language = 'ru'
): Promise<{
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}> {
  try {
    console.log('🤖 Starting multilingual AI recommendations...');
    console.log('🌍 Language:', language);
    console.log('👤 User profile:', userProfile);

    const prompt = generatePrompt(userProfile, language);
    
    console.log('📤 Sending prompt to Gemini...');
    
    const aiResponse = await generateText(prompt);
    
    console.log('📥 Received AI response');
    console.log('📝 Response length:', aiResponse.length);
    
    const results = parseResponse(aiResponse, language);
    
    console.log('✅ Parsed results:', {
      strengths: results.strengths.length,
      weaknesses: results.weaknesses.length,
      recommendations: results.recommendations.length
    });
    
    if (results.strengths.length === 0 || results.weaknesses.length === 0 || results.recommendations.length === 0) {
      console.warn('⚠️ No results from AI, using fallback');
      throw new Error('No valid results from AI');
    }

    return results;
  } catch (error) {
    console.log('ℹ️ AI recommendations unavailable, using fallback');
    throw error;
  }
}
