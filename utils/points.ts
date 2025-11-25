export const ACHIEVEMENT_POINTS = {
  city: 10,
  republic: 30,
  international: 100
} as const;

export const RANKS = [
  { name: 'Юнга', nameKey: 'cadet', minPoints: 0, color: 'from-blue-400 to-cyan-400' },
  { name: 'Матрос', nameKey: 'sailor', minPoints: 50, color: 'from-blue-500 to-cyan-500' },
  { name: 'Старшина', nameKey: 'pettyOfficer', minPoints: 150, color: 'from-blue-600 to-cyan-600' },
  { name: 'Лейтенант', nameKey: 'lieutenant', minPoints: 300, color: 'from-indigo-500 to-blue-500' },
  { name: 'Капитан', nameKey: 'captain', minPoints: 500, color: 'from-indigo-600 to-blue-600' },
  { name: 'Контр-адмирал', nameKey: 'rearAdmiral', minPoints: 800, color: 'from-purple-500 to-indigo-500' },
  { name: 'Вице-адмирал', nameKey: 'viceAdmiral', minPoints: 1200, color: 'from-purple-600 to-indigo-600' },
  { name: 'Адмирал', nameKey: 'admiral', minPoints: 2000, color: 'from-violet-600 to-purple-600' },
  { name: 'Флотоводец', nameKey: 'fleetCommander', minPoints: 3000, color: 'from-amber-500 to-orange-500' }
] as const;

export function calculateRank(points: number) {
  const rank = [...RANKS].reverse().find(r => points >= r.minPoints) || RANKS[0];
  const nextRank = RANKS[RANKS.findIndex(r => r.name === rank.name) + 1];
  
  return {
    current: rank,
    next: nextRank,
    progress: nextRank 
      ? ((points - rank.minPoints) / (nextRank.minPoints - rank.minPoints)) * 100
      : 100
  };
}

export function calculateIcebergHeight(points: number) {
  // Максимум 3000 очков = 100% айсберга над водой
  const maxPoints = 3000;
  const percentage = Math.min((points / maxPoints) * 100, 100);
  return percentage;
}