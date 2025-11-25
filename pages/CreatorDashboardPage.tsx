import { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, Eye, Edit, Trash2, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useTranslation } from '../utils/i18n';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';

interface CreatorContent {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'course' | 'book' | 'material';
  category: string;
  salesCount: number;
  status: 'draft' | 'published';
  createdAt: string;
}

interface CreatorStats {
  totalSales: number;
  monthlyEarnings: number;
  totalEarnings: number;
  totalContent: number;
  commission: number;
}

export function CreatorDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [content, setContent] = useState<CreatorContent[]>([]);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    price: 0,
    type: 'course' as 'course' | 'book' | 'material',
    category: '',
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);

  useEffect(() => {
    if (user && token) {
      fetchCreatorData();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const fetchCreatorData = async () => {
    if (!token) {
      toast.error('Необходима авторизация');
      navigate('/login');
      return;
    }

    try {
      const headers = {
        'X-User-Token': token,
      };

      const [contentResponse, statsResponse] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6738f032/marketplace/creator/content`,
          { headers }
        ),
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6738f032/marketplace/creator/stats`,
          { headers }
        ),
      ]);

      if (!contentResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch creator data');
      }

      const contentData = await contentResponse.json();
      const statsData = await statsResponse.json();

      setContent(contentData.content || []);
      setStats(statsData.stats || null);
    } catch (error) {
      console.error('Error fetching creator data:', error);
      toast.error(t('errorLoadingProfile'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    if (!newContent.title || !newContent.description) {
      toast.error('Заполните все поля');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newContent.title);
      formData.append('description', newContent.description);
      formData.append('price', newContent.price.toString());
      formData.append('type', newContent.type);
      formData.append('category', newContent.category);

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      if (contentFile) {
        formData.append('content', contentFile);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6738f032/marketplace/creator/content`,
        {
          method: 'POST',
          headers: {
            'X-User-Token': token,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Failed to create content');

      toast.success('Контент создан!');
      setIsCreateDialogOpen(false);
      fetchCreatorData();
      setNewContent({ title: '', description: '', price: 0, type: 'course', category: '' });
      setThumbnailFile(null);
      setContentFile(null);
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Ошибка создания контента');
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Удалить этот контент?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6738f032/marketplace/creator/content/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-User-Token': token,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete content');

      toast.success('Контент удален');
      fetchCreatorData();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Ошибка удаления контента');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-950 dark:to-blue-950">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-950 dark:to-blue-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
              {t('creatorDashboard')}
            </h1>
            <p className="text-muted-foreground">{t('manageYourConnections')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/marketplace')}>
              {t('viewAsStudent')}
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createContent')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('createContent')}</DialogTitle>
                  <DialogDescription>
                    {t('uploadContent')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm mb-1 block">{t('contentType')}</label>
                    <Select
                      value={newContent.type}
                      onValueChange={(value: 'course' | 'book' | 'material') =>
                        setNewContent({ ...newContent, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">{t('course')}</SelectItem>
                        <SelectItem value="book">{t('book')}</SelectItem>
                        <SelectItem value="material">{t('material')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">{t('contentTitle')}</label>
                    <Input
                      value={newContent.title}
                      onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                      placeholder={t('bookTitle')}
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">{t('contentDescription')}</label>
                    <Textarea
                      value={newContent.description}
                      onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                      placeholder={t('description')}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">{t('priceInUSD')}</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newContent.price}
                      onChange={(e) => setNewContent({ ...newContent, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">{t('thumbnail')}</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">{t('contentFile')}</label>
                    <Input
                      type="file"
                      accept=".pdf,.zip"
                      onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button onClick={handleCreateContent} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500">
                    {t('publish')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('totalSales')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.totalSales}</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('thisMonth')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  {stats.monthlyEarnings.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('yourEarnings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  {stats.totalEarnings.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('platformCommission')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{(stats.commission * 100).toFixed(0)}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content List */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>{t('myContent')}</CardTitle>
            <CardDescription>
              {content.length} {t('projectsLowercase')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {content.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('noItemsFound')}
              </div>
            ) : (
              <div className="space-y-4">
                {content.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                          {item.status === 'published' ? t('published') : t('draft')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {item.type === 'course' ? t('course') : item.type === 'book' ? t('book') : t('material')}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {item.price === 0 ? t('free') : item.price.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                          {item.salesCount} {t('salesCount')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/marketplace/${item.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteContent(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}