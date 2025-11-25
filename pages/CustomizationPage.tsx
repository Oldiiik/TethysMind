import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Palette, Zap, Crown, Award, Star, Sparkles, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function CustomizationPage() {
  const customizations = [
    {
      icon: Palette,
      name: 'Персональная тема',
      price: '199',
      description: 'Настройте цвета и стиль интерфейса под себя',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Zap,
      name: 'Приоритетная поддержка',
      price: '499',
      description: 'Ответы в течение 1 часа, личный менеджер',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Crown,
      name: 'VIP статус',
      price: '999',
      description: 'Эксклюзивный значок, ранний доступ к функциям',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Award,
      name: 'Сертификаты',
      price: '299',
      description: 'Официальные сертификаты о прохождении курсов',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Star,
      name: 'Экспертная консультация',
      price: '1499',
      description: '1-на-1 сессия с экспертом по выбору вуза',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Sparkles,
      name: 'ИИ-наставник Pro',
      price: '799',
      description: 'Расширенные возможности ИИ с персонализацией',
      color: 'from-violet-500 to-purple-500'
    }
  ];

  const handleAdd = (name: string) => {
    toast.success(`"${name}" добавлено в корзину`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl mb-2">Каталог кастомизаций</h1>
            <p className="text-muted-foreground text-lg">
              Улучшите свой опыт с дополнительными возможностями
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Корзина
          </Button>
        </div>
      </div>

      {/* Customization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customizations.map((item, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl">{item.price}</span>
                <span className="text-muted-foreground">₽</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full gap-2"
                onClick={() => handleAdd(item.name)}
              >
                <ShoppingCart className="w-4 h-4" />
                Добавить
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Bundle Offer */}
      <Card className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-primary/20">
        <CardHeader className="text-center">
          <Badge className="w-fit mx-auto mb-4">Специальное предложение</Badge>
          <CardTitle className="text-2xl">Пакет "Всё включено"</CardTitle>
          <CardDescription className="text-base">
            Все кастомизации по специальной цене
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            <span className="text-5xl">3999</span>
            <span className="text-muted-foreground text-xl"> ₽</span>
            <p className="text-sm text-muted-foreground mt-2">
              Экономия более 1000 ₽
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Crown className="w-5 h-5" />
            Купить пакет
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
