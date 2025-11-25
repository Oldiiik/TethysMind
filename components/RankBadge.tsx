import { calculateRank } from '../utils/points';
import { Crown } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

interface RankBadgeProps {
  points: number;
  showProgress?: boolean;
}

export function RankBadge({ points, showProgress = false }: RankBadgeProps) {
  const { current, next, progress } = calculateRank(points);
  const { t } = useTranslation();
  
  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${current.color} text-white shadow-lg`}>
        <Crown className="w-4 h-4" />
        <span className="font-semibold">{t(current.nameKey)}</span>
      </div>
      
      {showProgress && next && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
            <span>{t('nextRank')}: {t(next.nameKey)}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${next.color} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
