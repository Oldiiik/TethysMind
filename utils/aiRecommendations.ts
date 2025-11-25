/**
 * AI Recommendations System
 * Система ИИ-рекомендаций - ТОЧНО КАК AI MENTOR
 */

import { generateMultilingualRecommendations, type Language } from './gemini-multilang';

export interface ProfileAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  localCompetitions: Competition[];
  nationalCompetitions: Competition[];
  internationalCompetitions: Competition[];
}

export interface Competition {
  name: string;
  level: 'local' | 'national' | 'international';
  description: string;
  deadline?: string;
  website?: string;
  relevance: number; // 0-100
}

/**
 * Генерирует персонализированные рекомендации на основе профиля пользователя
 */
export async function generateRecommendations(
  userProfile: {
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
  },
  language: Language
): Promise<ProfileAnalysis> {
  try {
    console.log('🤖 Generating AI recommendations for user:', userProfile);
    
    // ВЫЗЫВАЕМ GEMINI ТОЧНО КАК AI MENTOR
    const result = await generateMultilingualRecommendations(userProfile, language);
    
    console.log('✅ AI recommendations generated successfully');
    console.log('✅ Result:', result);
    
    // Добавляем соревнования
    const competitions = generateSmartCompetitions(userProfile.country, userProfile.city, userProfile.direction);
    
    return {
      ...result,
      ...competitions
    };

  } catch (error) {
    console.log('ℹ️ Using smart fallback recommendations');
    console.log('❌ ERROR DETAILS:', error);
    console.log('❌ ERROR MESSAGE:', error instanceof Error ? error.message : 'Unknown');
    console.log('❌ ERROR STACK:', error instanceof Error ? error.stack : 'No stack');
    
    // Fallback recommendations based on user profile
    const fallbackRecommendations = generateSmartFallback(userProfile);
    
    console.log('📦 FALLBACK:', fallbackRecommendations);
    
    return fallbackRecommendations;
  }
}

/**
 * Generate smart fallback recommendations based on profile
 */
function generateSmartFallback(userProfile: {
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
}): ProfileAnalysis {
  const hasIELTS = userProfile.ieltsScore && userProfile.ieltsScore > 0;
  const hasSAT = userProfile.satScore && userProfile.satScore > 0;
  const hasDiplomas = userProfile.diplomas.length > 0;
  const isHighGPA = userProfile.gpa >= 4.0;
  
  // Smart strengths based on profile
  const strengths: string[] = [];
  if (isHighGPA) {
    strengths.push('Высокий средний балл (GPA) показывает академическую сильную подготовку');
  }
  if (hasIELTS) {
    strengths.push(`IELTS ${userProfile.ieltsScore} демонстрирует хороший уровень английского языка`);
  }
  if (hasSAT) {
    strengths.push(`SAT ${userProfile.satScore} повышает ваши шансы на поступление в топовые университеты`);
  }
  if (hasDiplomas) {
    strengths.push(`${userProfile.diplomas.length} верифицированных достижений укрепляют ваше портфолио`);
  }
  if (strengths.length === 0) {
    strengths.push('Вы уже начали работу над своим академическим профилем');
    strengths.push('Выбрали направление для развития');
  }
  
  // Smart weaknesses based on profile
  const weaknesses: string[] = [];
  if (!hasIELTS) {
    weaknesses.push('Отсутствие IELTS/TOEFL значительно снижает шансы на международные университеты');
  } else if (userProfile.ieltsScore && userProfile.ieltsScore < 7.0) {
    weaknesses.push('IELTS ние 7.0 может быть недостаточно для топовых университетов');
  }
  if (!hasSAT && userProfile.targetUniversity && userProfile.targetUniversity.rank < 200) {
    weaknesses.push('SAT необходим для поступления в большинство топовых университетов США');
  }
  if (!hasDiplomas) {
    weaknesses.push('Отсутствие олимпиад и конкурсов снижает конкурентоспособность профиля');
  }
  if (!isHighGPA) {
    weaknesses.push('GPA ниже 4.0 требует компенсации через достижения и тесты');
  }
  
  // Smart recommendations
  const recommendations: string[] = [];
  if (!hasIELTS) {
    recommendations.push('🎯 Приоритет #1: Начните подготовку к IELTS/TOEFL, целевой балл 7.0+');
  } else if (userProfile.ieltsScore && userProfile.ieltsScore < 7.0) {
    recommendations.push('📈 Улучшите балл IELTS до 7.0+ для топовых университетов');
  }
  
  if (!hasSAT && userProfile.targetUniversity && userProfile.targetUniversity.rank < 200) {
    recommendations.push('📝 Подготовьтесь к SAT (целевой балл 1400+) для университетов США');
  }
  
  if (!hasDiplomas || userProfile.diplomas.length < 3) {
    recommendations.push(`🏆 Участвуйте в олимпиадах по направлению "${userProfile.direction}"`);
  }
  
  recommendations.push('💼 Развивайте портфолио проектов в своей области');
  recommendations.push('📚 Читайте научные статьи и участвуйте в исследованиях');
  recommendations.push('🤝 Найдите менторов в вашей области для рекомендательных писем');
  
  // International competitions based on direction
  const internationalCompetitions: Competition[] = [];
  
  if (userProfile.direction.toLowerCase().includes('tech') || 
      userProfile.direction.toLowerCase().includes('програм') ||
      userProfile.direction.toLowerCase().includes('it')) {
    internationalCompetitions.push(
      {
        name: 'International Olympiad in Informatics (IOI)',
        level: 'international',
        description: 'Престижная международная олимпиада по программированию для школьников',
        website: 'https://ioinformatics.org',
        relevance: 95
      },
      {
        name: 'Google Code Jam',
        level: 'international',
        description: 'Глобальное соревнование по программированию от Google',
        website: 'https://codingcompetitions.withgoogle.com/codejam',
        relevance: 90
      },
      {
        name: 'ICPC (International Collegiate Programming Contest)',
        level: 'international',
        description: 'Крупнейшее соревнование по программированию для студентов',
        website: 'https://icpc.global',
        relevance: 85
      }
    );
  }
  
  internationalCompetitions.push(
    {
      name: 'International Mathematical Olympiad (IMO)',
      level: 'international',
      description: 'Самая престижная математическая олимпиада для школьников',
      website: 'https://www.imo-official.org',
      relevance: 90
    },
    {
      name: 'Intel ISEF',
      level: 'international',
      description: 'Крупнейшая международная научная выставка для школьников',
      website: 'https://www.societyforscience.org/isef',
      relevance: 85
    }
  );
  
  return {
    strengths,
    weaknesses,
    recommendations: recommendations.slice(0, 7),
    localCompetitions: [],
    nationalCompetitions: [],
    internationalCompetitions
  };
}

/**
 * Генерирует соревнования ЛОКАЛЬНО (быстрее чем API запрос!)
 */
function generateSmartCompetitions(country: string, city: string, direction: string): {
  localCompetitions: Competition[];
  nationalCompetitions: Competition[];
  internationalCompetitions: Competition[];
} {
  const localCompetitions: Competition[] = [];
  const nationalCompetitions: Competition[] = [];
  const internationalCompetitions: Competition[] = [];
  
  // Add local competitions
  if (city.toLowerCase().includes('moscow')) {
    localCompetitions.push(
      {
        name: 'Московская олимпиада по математике',
        level: 'local',
        description: 'Олимпиада по математике для школьников Москвы',
        website: 'https://www.mosolymp.ru',
        relevance: 80
      },
      {
        name: 'Московская олимпиада по информатике',
        level: 'local',
        description: 'Олимпиада по информатике для школьников Москвы',
        website: 'https://www.mosolymp.ru',
        relevance: 85
      }
    );
  }
  
  // Add national competitions
  if (country.toLowerCase().includes('russia')) {
    nationalCompetitions.push(
      {
        name: 'Российская олимпиада по математике',
        level: 'national',
        description: 'Олимпиада по атематике для школьников России',
        website: 'https://www.rusolymp.ru',
        relevance: 90
      },
      {
        name: 'Российская олимпиада по информатике',
        level: 'national',
        description: 'Олимпиада по информатике для школьников России',
        website: 'https://www.rusolymp.ru',
        relevance: 85
      }
    );
  }
  
  // Add international competitions
  if (direction.toLowerCase().includes('tech') || 
      direction.toLowerCase().includes('програм') ||
      direction.toLowerCase().includes('it')) {
    internationalCompetitions.push(
      {
        name: 'International Olympiad in Informatics (IOI)',
        level: 'international',
        description: 'Престижная международная олимпиада по программированию для школьников',
        website: 'https://ioinformatics.org',
        relevance: 95
      },
      {
        name: 'Google Code Jam',
        level: 'international',
        description: 'Глобальное соревнование по программированию от Google',
        website: 'https://codingcompetitions.withgoogle.com/codejam',
        relevance: 90
      },
      {
        name: 'ICPC (International Collegiate Programming Contest)',
        level: 'international',
        description: 'Крупнейшее соревнование по программированию для студентов',
        website: 'https://icpc.global',
        relevance: 85
      }
    );
  }
  
  internationalCompetitions.push(
    {
      name: 'International Mathematical Olympiad (IMO)',
      level: 'international',
      description: 'Самая престижная математическая олимпиада для школьников',
      website: 'https://www.imo-official.org',
      relevance: 90
    },
    {
      name: 'Intel ISEF',
      level: 'international',
      description: 'Крупнейшая международная научная выставка для школьников',
      website: 'https://www.societyforscience.org/isef',
      relevance: 85
    }
  );
  
  return {
    localCompetitions,
    nationalCompetitions,
    internationalCompetitions
  };
}