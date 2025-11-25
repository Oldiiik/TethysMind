import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, User, BookOpen, Clock, Award, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { useTranslation } from '../utils/i18n';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';

interface MarketplaceItemDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  authorId: string;
  authorName: string;
  type: 'course' | 'book' | 'material';
  category: string;
  thumbnailUrl?: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  isPremium: boolean;
  createdAt: string;
  whatYouLearn?: string[];
  requirements?: string[];
  content?: string;
}

export function MarketplaceItemPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useAuth();
  const [item, setItem] = useState<MarketplaceItemDetail | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      // Public endpoint but check if user is authenticated for purchase status
      const headers: Record<string, string> = {
        Authorization: `Bearer ${publicAnonKey}`,
      };
      
      // Add user token if available to check purchase status
      if (token) {
        headers['X-User-Token'] = token;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6738f032/marketplace/items/${id}`,
        { headers }
      );

      if (!response.ok) throw new Error('Failed to fetch item');

      const data = await response.json();
      setItem(data.item);
      setIsPurchased(data.isPurchased || false);
    } catch (error) {
      console.error('Error fetching item details:', error);
      toast.error(t('errorLoadingProfile'));
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user || !token) {
      toast.error('Войдите в систему для покупки');
      navigate('/login');
      return;
    }

    if (item?.price === 0) {
      // Free content - instant access
      try {
        setPurchasing(true);
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6738f032/marketplace/purchase`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Token': token,
            },
            body: JSON.stringify({ itemId: id }),
          }
        );

        if (!response.ok) throw new Error('Purchase failed');

        toast.success(t('alreadyPurchased'));
        setIsPurchased(true);
      } catch (error) {
        console.error('Error purchasing item:', error);
        toast.error('Ошибка при получении контента');
      } finally {
        setPurchasing(false);
      }
    } else {
      // Paid content - redirect to Stripe
      toast.info('Интеграция с платежной системой в разработке');
      // TODO: Integrate with Stripe
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-950 dark:to-blue-950">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-950 dark:to-blue-950">
        <div className="text-center">
          <h2 className="text-2xl mb-4">{t('noItemsFound')}</h2>
          <Button onClick={() => navigate('/marketplace')}>{t('back')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-950 dark:to-blue-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/marketplace')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('back')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card className="border-blue-200 dark:border-blue-800">
              <div className="relative h-64 md:h-96 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-t-lg overflow-hidden">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-blue-600" />
                  </div>
                )}
                {item.isPremium && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500">
                    {t('premium')}
                  </Badge>
                )}
              </div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-600 text-white">
                    {item.type === 'course' ? t('course') : item.type === 'book' ? t('book') : t('material')}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl mb-4">{item.title}</h1>
                <p className="text-lg text-muted-foreground mb-6">{item.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      <span className="text-lg">{item.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({item.reviewCount} {t('reviews')})
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>{item.salesCount} {t('students')}</span>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      {item.authorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('aboutInstructor')}</p>
                    <p className="font-semibold">{item.authorName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            {item.whatYouLearn && item.whatYouLearn.length > 0 && (
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle>{t('whatYouLearn')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.whatYouLearn.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {item.requirements && item.requirements.length > 0 && (
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle>{t('requirements')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Content Description */}
            {item.content && (
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle>{t('courseContent')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{item.content}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="text-4xl flex items-center gap-1 mb-2">
                    {item.price === 0 ? (
                      <span className="text-green-600">{t('free')}</span>
                    ) : (
                      <>
                        <span className="text-blue-600">$</span>
                        <span className="text-blue-600">{item.price.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                  {item.price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t('platformCommission')}: {(item.price * 0.2).toFixed(2)} USD (20%)
                    </p>
                  )}
                </div>

                {isPurchased ? (
                  <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                    <Check className="w-4 h-4 mr-2" />
                    {t('enrolled')}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                      onClick={handlePurchase}
                      disabled={purchasing}
                    >
                      {purchasing ? t('loading') : item.price === 0 ? t('enrolled') : t('buyNow')}
                    </Button>
                  </div>
                )}

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold mb-3">{t('courseContent')}</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>{t('available')} 24/7</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <span>{t('certificatesDesc')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}