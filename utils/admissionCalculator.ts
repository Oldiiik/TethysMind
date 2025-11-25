import { UniversityData } from './universities';

export interface UserPortfolio {
  gpa: number; // out of 5.0
  ieltsScore?: number;
  satScore?: number;
  achievements: number; // Count of verified diplomas
  direction: string;
}

export interface AdmissionChance {
  university: UniversityData;
  probability: number; // 0-100
  matchScore: number; // How well user matches requirements (0-100)
  breakdown: {
    gpaScore: number;
    testScore: number;
    achievementScore: number;
    directionMatch: boolean;
  };
  recommendation: 'safety' | 'target' | 'reach' | 'dream';
}

/**
 * Calculate admission probability based on user portfolio
 */
export function calculateAdmissionChance(
  university: UniversityData,
  portfolio: UserPortfolio
): AdmissionChance {
  const breakdown = {
    gpaScore: calculateGPAScore(portfolio.gpa, university.requirements.minGPA),
    testScore: calculateTestScore(portfolio, university),
    achievementScore: calculateAchievementScore(portfolio.achievements, university.requirements.minAchievements || 0),
    directionMatch: checkDirectionMatch(portfolio.direction, university.directions),
  };

  // Calculate overall match score (0-100)
  let matchScore = 0;
  matchScore += breakdown.gpaScore * 0.4; // GPA is 40% of score
  matchScore += breakdown.testScore * 0.3; // Test scores are 30%
  matchScore += breakdown.achievementScore * 0.2; // Achievements are 20%
  matchScore += breakdown.directionMatch ? 10 : 0; // Direction match is 10%

  // Calculate probability considering university's acceptance rate AND rank
  const baseAcceptanceRate = university.acceptanceRate;
  
  // Rank factor: top universities (rank < 100) are much harder
  const rankFactor = university.rank < 50 ? 0.3 : 
                     university.rank < 100 ? 0.5 : 
                     university.rank < 200 ? 0.7 : 
                     university.rank < 500 ? 0.9 : 1.0;
  
  // GPA gap penalty: larger gap = much lower chances
  const gpaGap = university.requirements.minGPA - portfolio.gpa;
  const gpaGapPenalty = gpaGap > 1.0 ? 0.2 :  // 1+ point below = 80% penalty
                        gpaGap > 0.5 ? 0.4 :  // 0.5-1 point below = 60% penalty
                        gpaGap > 0.0 ? 0.7 :  // slightly below = 30% penalty
                        1.0;                  // meets or exceeds = no penalty
  
  // Calculate base probability
  let probability = 0;
  
  if (matchScore >= 90) {
    // Excellent match - but still limited by rank
    probability = Math.min(baseAcceptanceRate * 3 * rankFactor, 95);
  } else if (matchScore >= 75) {
    // Good match
    probability = Math.min(baseAcceptanceRate * 2 * rankFactor, 75);
  } else if (matchScore >= 60) {
    // Fair match
    probability = Math.min(baseAcceptanceRate * 1.5 * rankFactor, 50);
  } else if (matchScore >= 40) {
    // Below average match
    probability = Math.min(baseAcceptanceRate * rankFactor, 25);
  } else {
    // Poor match
    probability = Math.min(baseAcceptanceRate * 0.5 * rankFactor, 10);
  }

  // Apply GPA gap penalty
  probability *= gpaGapPenalty;

  // Missing test scores penalty (if required)
  if (university.requirements.minIELTS && !portfolio.ieltsScore) {
    probability *= 0.5; // Major penalty for missing IELTS when required
  }
  
  if (university.requirements.minSAT && !portfolio.satScore) {
    probability *= 0.6; // Major penalty for missing SAT when required
  }
  
  // Low test scores penalty (if provided but below requirement)
  if (university.requirements.minIELTS && portfolio.ieltsScore) {
    if (portfolio.ieltsScore < university.requirements.minIELTS) {
      probability *= 0.7;
    }
  }

  if (university.requirements.minSAT && portfolio.satScore) {
    if (portfolio.satScore < university.requirements.minSAT) {
      probability *= 0.7;
    }
  }

  // Cap probability between 0% and 95%
  probability = Math.max(0, probability);
  probability = Math.min(95, probability);

  // Determine recommendation category
  let recommendation: 'safety' | 'target' | 'reach' | 'dream';
  if (probability >= 60) {
    recommendation = 'safety';
  } else if (probability >= 35) {
    recommendation = 'target';
  } else if (probability >= 15) {
    recommendation = 'reach';
  } else {
    recommendation = 'dream';
  }

  return {
    university,
    probability: Math.round(probability),
    matchScore: Math.round(matchScore),
    breakdown,
    recommendation,
  };
}

/**
 * Calculate GPA score (0-100)
 */
function calculateGPAScore(userGPA: number, requiredGPA: number): number {
  if (userGPA >= requiredGPA + 0.3) return 100;
  if (userGPA >= requiredGPA + 0.2) return 95;
  if (userGPA >= requiredGPA + 0.1) return 90;
  if (userGPA >= requiredGPA) return 85;
  if (userGPA >= requiredGPA - 0.1) return 75;
  if (userGPA >= requiredGPA - 0.2) return 65;
  if (userGPA >= requiredGPA - 0.3) return 55;
  if (userGPA >= requiredGPA - 0.5) return 40;
  return 25;
}

/**
 * Calculate test score (IELTS/SAT) (0-100)
 */
function calculateTestScore(portfolio: UserPortfolio, university: UniversityData): number {
  let ieltsScore = 0;
  let satScore = 0;
  let hasIELTS = false;
  let hasSAT = false;
  let needsIELTS = !!university.requirements.minIELTS;
  let needsSAT = !!university.requirements.minSAT;

  // Calculate IELTS score
  if (university.requirements.minIELTS && portfolio.ieltsScore) {
    hasIELTS = true;
    const diff = portfolio.ieltsScore - university.requirements.minIELTS;
    if (diff >= 1.0) ieltsScore = 100;
    else if (diff >= 0.5) ieltsScore = 95;
    else if (diff >= 0) ieltsScore = 85;
    else if (diff >= -0.5) ieltsScore = 70;
    else if (diff >= -1.0) ieltsScore = 50;
    else ieltsScore = 30;
  } else if (university.requirements.minIELTS && !portfolio.ieltsScore) {
    // University requires IELTS but student doesn't have it - MAJOR penalty
    ieltsScore = 15;
    hasIELTS = true;
  }

  // Calculate SAT score
  if (university.requirements.minSAT && portfolio.satScore) {
    hasSAT = true;
    const diff = portfolio.satScore - university.requirements.minSAT;
    if (diff >= 100) satScore = 100;
    else if (diff >= 50) satScore = 95;
    else if (diff >= 0) satScore = 85;
    else if (diff >= -50) satScore = 70;
    else if (diff >= -100) satScore = 50;
    else satScore = 30;
  } else if (university.requirements.minSAT && !portfolio.satScore) {
    // University requires SAT but student doesn't have it - MAJOR penalty
    satScore = 15;
    hasSAT = true;
  }

  // Return average if both required
  if (hasIELTS && hasSAT) {
    return (ieltsScore + satScore) / 2;
  } else if (hasIELTS) {
    return ieltsScore;
  } else if (hasSAT) {
    return satScore;
  }
  
  // No test scores required - neutral score
  return 70;
}

/**
 * Calculate achievement score (0-100)
 */
function calculateAchievementScore(userAchievements: number, requiredAchievements: number): number {
  if (requiredAchievements === 0) {
    // Achievements are bonus, but lack of them is still a penalty
    if (userAchievements >= 3) return 100;
    if (userAchievements >= 2) return 90;
    if (userAchievements >= 1) return 80;
    return 50; // Changed from 70 to 50 - no achievements = below average
  }

  const diff = userAchievements - requiredAchievements;
  if (diff >= 2) return 100;
  if (diff >= 1) return 95;
  if (diff >= 0) return 85;
  if (diff >= -1) return 60;
  if (diff >= -2) return 40;
  return 20; // Significantly lacking achievements
}

/**
 * Check if user's direction matches university's offered directions
 */
function checkDirectionMatch(userDirection: string, universityDirections: string[]): boolean {
  // Direct match
  if (universityDirections.includes(userDirection)) {
    return true;
  }

  // Related directions
  const directionRelations: Record<string, string[]> = {
    technology: ['engineering', 'science'],
    engineering: ['technology', 'science'],
    science: ['engineering', 'technology', 'medicine'],
    medicine: ['science'],
    business: ['economics'],
    humanities: ['arts', 'law'],
    arts: ['humanities'],
    law: ['humanities'],
  };

  const relatedDirections = directionRelations[userDirection] || [];
  return universityDirections.some(dir => relatedDirections.includes(dir));
}

/**
 * Get portfolio from user data
 */
export function buildPortfolioFromUserData(
  profile: {
    direction?: string;
  },
  portfolio: {
    subjects?: Array<{ name: string; grade: string }>;
    ieltsScore?: string;
    satScore?: string;
    diplomas?: Array<{ verified: boolean }>;
  } | null | undefined
): UserPortfolio {
  // Handle null/undefined portfolio
  if (!portfolio) {
    return {
      gpa: 0,
      ieltsScore: undefined,
      satScore: undefined,
      achievements: 0,
      direction: profile?.direction || 'technology',
    };
  }

  // Calculate GPA from subjects
  let gpa = 0;
  if (portfolio.subjects && portfolio.subjects.length > 0) {
    const total = portfolio.subjects.reduce((sum, subject) => {
      return sum + parseFloat(subject.grade || '0');
    }, 0);
    gpa = total / portfolio.subjects.length;
  }

  // Count verified achievements
  const achievements = portfolio.diplomas?.filter(d => d.verified).length || 0;

  return {
    gpa,
    ieltsScore: portfolio.ieltsScore ? parseFloat(portfolio.ieltsScore) : undefined,
    satScore: portfolio.satScore ? parseFloat(portfolio.satScore) : undefined,
    achievements,
    direction: profile?.direction || 'technology',
  };
}

/**
 * Sort universities by probability (descending)
 */
export function sortByProbability(chances: AdmissionChance[]): AdmissionChance[] {
  return [...chances].sort((a, b) => b.probability - a.probability);
}

/**
 * Filter universities by minimum probability
 */
export function filterByMinProbability(chances: AdmissionChance[], minProbability: number): AdmissionChance[] {
  return chances.filter(c => c.probability >= minProbability);
}

/**
 * Get recommended mix of universities (safety, target, reach)
 */
export function getRecommendedMix(chances: AdmissionChance[]): {
  safety: AdmissionChance[];
  target: AdmissionChance[];
  reach: AdmissionChance[];
  dream: AdmissionChance[];
} {
  return {
    safety: chances.filter(c => c.recommendation === 'safety'),
    target: chances.filter(c => c.recommendation === 'target'),
    reach: chances.filter(c => c.recommendation === 'reach'),
    dream: chances.filter(c => c.recommendation === 'dream'),
  };
}