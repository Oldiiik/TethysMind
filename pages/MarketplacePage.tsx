import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, BookOpen, GraduationCap, FileText, Star, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTranslation } from '../utils/i18n';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';

interface MarketplaceItem {
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
}

export function MarketplacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [priceFilter, setPriceFilter] = useState<string>('all');

  useEffect(() => {
    fetchMarketplaceItems();
  }, []);

  useEffect(() => {
    filterAndSortItems();
  }, [searchQuery, typeFilter, sortBy, priceFilter, items]);

  const fetchMarketplaceItems = async () => {
    try {
      // Public endpoint - no user token required
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6738f032/marketplace/items`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch items');
      }

      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      toast.error(t('errorLoadingProfile'));
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let filtered = [...items];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Apply price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter((item) => item.price === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter((item) => item.price > 0);
    }

    // Apply sorting
    if (sortBy === 'popular') {
      filtered.sort((a, b) => b.salesCount - a.salesCount);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'topRated') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredItems(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <GraduationCap className="w-4 h-4" />;
      case 'book':
        return <BookOpen className="w-4 h-4" />;
      case 'material':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course':
        return t('course');
      case 'book':
        return t('book');
      case 'material':
        return t('material');
      default:
        return type;
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                {t('marketplaceTitle')}
              </h1>
              <p className="text-muted-foreground">{t('exploreContent')}</p>
            </div>
            <Button
              onClick={() => navigate('/creator-dashboard')}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
            >
              {t('becomeCreator')}
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('search') + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="course">{t('courses')}</SelectItem>
                <SelectItem value="book">{t('books')}</SelectItem>
                <SelectItem value="material">{t('materials')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('priceRange')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="free">{t('free')}</SelectItem>
                <SelectItem value="paid">{t('paid')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">{t('popular')}</SelectItem>
                <SelectItem value="newest">{t('newest')}</SelectItem>
                <SelectItem value="topRated">{t('topRated')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl mb-2">{t('noItemsFound')}</h3>
            <p className="text-muted-foreground">{t('tryAnotherSearch')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-blue-200 dark:border-blue-800"
                onClick={() => navigate(`/marketplace/${item.id}`)}
              >
                <CardHeader className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-t-lg overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </div>
                    )}
                    {item.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                        {t('premium')}
                      </Badge>
                    )}
                    <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                      {getTypeLabel(item.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardTitle className="mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mb-3">
                    {item.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>
                      {t('by')} {item.authorName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm">{item.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({item.reviewCount} {t('reviews')})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ShoppingCart className="w-4 h-4" />
                      <span>{item.salesCount}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-0">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="text-xl text-blue-600">
                      {item.price === 0 ? t('free') : item.price.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/marketplace/${item.id}`);
                    }}
                  >
                    {t('viewProfile')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}