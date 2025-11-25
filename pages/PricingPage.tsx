import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Для знакомства',
      badge: null,
      features: [
        'Базовое портфолио',
        '5 заметок по книгам',
        '20 сообщений с ИИ в месяц',
        'Стандартная поддержка',
        'Базовые рекомендации'
      ],
      cta: 'Начать бесплатно',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '990',
      description: 'Для серьёзных студентов',
      badge: 'Популярный',
      features: [
        'Расширенное портфолио',
        'Безлимитные заметки',
        '500 сообщений с ИИ в месяц',
        'Приоритетная поддержка',
        'Продвинутые рекомендации',
        'Экспорт в PDF',
        'Интеграции с университетами',
        'Аналитика прогресса'
      ],
      cta: 'Попробовать Pro',
      highlighted: true
    },
    {
      name: 'Master',
      price: '1990',
      description: 'Максимум возможностей',
      badge: 'Лучший выбор',
      features: [
        'Всё из Pro +',
        'Безлимитный ИИ-ассистент',
        'Персональный ИИ-наставник',
        'Доступ к закрытым вебинарам',
        'Приоритетные рекомендации вузов',
        'API доступ',
        'Кастомные интеграции',
        'Индивидуальная консультация'
      ],
      cta: 'Выбрать Master',
      highlighted: false
    }
  ];

  const handleSubscribe = (planName: string) => {
    toast.success(`План "${planName}" выбран!`, {
      description: 'Переход к оплате...'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="outline" className="gap-1 mb-4">
          <Sparkles className="w-3 h-3" />
          Тарифы
        </Badge>
        <h1 className="text-4xl md:text-5xl mb-4">Выберите свой план</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Начните бесплатно или выберите план с расширенными возможностями
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative ${
              plan.highlighted ? 'border-primary shadow-xl scale-105' : ''
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">{plan.badge}</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-6">
                <span className="text-5xl">{plan.price}</span>
                <span className="text-muted-foreground"> ₽/мес</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
                size="lg"
                onClick={() => handleSubscribe(plan.name)}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="text-3xl text-center mb-8">Часто задаваемые вопросы</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              q: 'Можно ли сменить план?',
              a: 'Да, вы можете в любой момент повысить или понизить свой тарифный план. Изменения вступят в силу в следующем расчётном периоде.'
            },
            {
              q: 'Есть ли бесплатный пробный период?',
              a: 'Да! План Free позволяет попробовать платформу бесплатно. Также доступна 14-дневная пробная версия Pro.'
            },
            {
              q: 'Какие способы оплаты принимаются?',
              a: 'Мы принимаем банковские карты, электронные кошельки и банковские переводы.'
            },
            {
              q: 'Можно ли вернуть деньги?',
              a: 'Да, мы предлагаем возврат средств в течение 14 дней с момента покупки, если вы не удовлетворены сервисом.'
            }
          ].map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0 text-white">
        <CardHeader className="text-center py-12">
          <CardTitle className="text-3xl text-white mb-4">
            Не уверены, какой план выбрать?
          </CardTitle>
          <CardDescription className="text-lg text-white/90 mb-6">
            Свяжитесь с нами, и мы поможем подобрать оптимальный вариант
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Связаться с нами
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/10"
            >
              Посмотреть демо
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
