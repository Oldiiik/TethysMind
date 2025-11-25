import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, Users, TrendingUp, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getGlobalLeaderboard, getFriendsLeaderboard } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { useTranslation } from '../utils/i18n';
import { calculateRank } from '../utils/points';

interface LeaderEntry {
  rank: number;
  name: string;
  points: number;
  country: string;
  rankTitle: string;
  avatar?: string;
}

export function LeaderboardPage() {
  const { user, activeUserId } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [globalLeaders, setGlobalLeaders] = useState<LeaderEntry[]>([]);
  const [friendLeaders, setFriendLeaders] = useState<LeaderEntry[]>([]);

  // Get user's current rank title
  const userRankInfo = user?.tethysPoints ? calculateRank(user.tethysPoints) : null;
  const userRankTitle = userRankInfo?.current?.nameKey ? t(userRankInfo.current.nameKey as any) : t('cadet');

  // Helper to translate rank titles
  const translateRankTitle = (rankTitle: string): string => {
    // Map database rank values to translation keys
    const rankMap: Record<string, string> = {
      'cadet': 'cadet',
      'sailor': 'sailor',
      'pettyOfficer': 'pettyOfficer',
      'lieutenant': 'lieutenant',
      'captain': 'captain',
      'rearAdmiral': 'rearAdmiral',
      'viceAdmiral': 'viceAdmiral',
      'admiral': 'admiral',
      'fleetCommander': 'fleetCommander',
      // Legacy support for Russian names
      'Юнга': 'cadet',
      'Матрос': 'sailor',
      'Старшина': 'pettyOfficer',
      'Лейтенант': 'lieutenant',
      'Капитан': 'captain',
      'Контр-адмирал': 'rearAdmiral',
      'Вице-адмирал': 'viceAdmiral',
      'Адмирал': 'admiral',
      'Флотоводец': 'fleetCommander',
    };
    
    const key = rankMap[rankTitle] || 'cadet';
    return t(key as any);
  };

  useEffect(() => {
    loadLeaderboards();
  }, [activeUserId]);

  const loadLeaderboards = async () => {
    try {
      setLoading(true);
      
      // Load global leaderboard
      const global = await getGlobalLeaderboard();
      setGlobalLeaders(global);

      // Load friends leaderboard if user is authenticated
      if (activeUserId) {
        try {
          const friends = await getFriendsLeaderboard(activeUserId);
          setFriendLeaders(friends);
        } catch (error) {
          console.error('Error loading friends leaderboard:', error);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboards:', error);
      toast.error(t('errorLoadingLeaderboard'));
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-amber-400 to-yellow-500';
    if (rank === 2) return 'from-slate-300 to-slate-400';
    if (rank === 3) return 'from-orange-400 to-amber-600';
    return 'from-blue-400 to-cyan-500';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const LeaderboardList = ({ leaders, showCountry = true }: { leaders: LeaderEntry[], showCountry?: boolean }) => (
    <div className="space-y-2 sm:space-y-3">
      {leaders.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-blue-300 dark:text-blue-700" />
          <p className="text-blue-600 dark:text-blue-400 text-base sm:text-lg">
            {t('noParticipants')}
          </p>
          <p className="text-blue-500 dark:text-blue-500 text-xs sm:text-sm mt-2 px-4">
            {t('earnPointsMessage')}
          </p>
        </div>
      ) : (
        leaders.map((leader, index) => (
          <Card
            key={`${leader.rank}-${leader.name}`}
            className={`border-2 transition-all duration-300 transform hover:scale-[1.01] sm:hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 ${
              leader.name === 'Ты' || leader.name === user?.name
                ? 'border-blue-500 bg-blue-950/50 dark:bg-blue-950/50 shadow-lg shadow-blue-500/20'
                : 'border-blue-700/30 dark:border-blue-700/30 bg-slate-50 dark:bg-slate-800/50'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Rank */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${getRankColor(leader.rank)} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                  <span className="text-base sm:text-lg font-bold">{getRankIcon(leader.rank)}</span>
                </div>

                {/* Avatar */}
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-blue-400">
                  {leader.avatar ? (
                    <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm sm:text-base">
                      {leader.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                    <span className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base truncate">
                      {leader.name}
                    </span>
                    {(leader.name === 'Ты' || leader.name === user?.name) && (
                      <Badge className="bg-blue-600 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0">{t('you')}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <Badge variant="outline" className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs">
                      {translateRankTitle(leader.rankTitle)}
                    </Badge>
                    {showCountry && leader.country && (
                      <>
                        <span className="text-blue-400 dark:text-blue-500 hidden sm:inline">•</span>
                        <span className="text-blue-600 dark:text-blue-400 hidden sm:inline truncate">{leader.country}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
                      {leader.points}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400">TP</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 mb-3 sm:mb-4 shadow-lg shadow-amber-500/50">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl mb-2 sm:mb-3 bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
            {t('globalLeaderboard')}
          </h1>
          <p className="text-blue-600 dark:text-blue-400 text-base sm:text-lg px-4">
            {t('competeWithBest')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-2 border-amber-300 dark:border-amber-700">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">{t('yourRating')}</CardTitle>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
                {user?.tethysPoints || 0}
              </div>
              <p className="text-xs sm:text-sm text-blue-500 dark:text-blue-400 mt-1">TethysPoints</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300 dark:border-blue-700">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">{t('yourTitle')}</CardTitle>
                <Badge className="bg-blue-600 text-xs">{userRankTitle}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300">
                {userRankTitle}
              </div>
              <p className="text-xs sm:text-sm text-blue-500 dark:text-blue-400 mt-1">{t('marineRank')}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-300 dark:border-cyan-700">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">{t('totalParticipants')}</CardTitle>
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-cyan-700 dark:text-cyan-300">
                {globalLeaders.length}
              </div>
              <p className="text-xs sm:text-sm text-blue-500 dark:text-blue-400 mt-1">{t('worldwide')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboards */}
        <Card className="border-2 border-blue-300 dark:border-blue-700 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Tabs defaultValue="global" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="global" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  {t('global')}
                </TabsTrigger>
                <TabsTrigger value="friends" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Users className="w-4 h-4 mr-2" />
                  {t('friendsTab')}
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="global" className="mt-0">
                <LeaderboardList leaders={globalLeaders} />
              </TabsContent>
              <TabsContent value="friends" className="mt-0">
                <LeaderboardList leaders={friendLeaders} showCountry={false} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}