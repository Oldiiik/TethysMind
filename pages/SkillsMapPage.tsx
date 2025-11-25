import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ZoomIn, ZoomOut, Maximize2, Star, Sparkles, Info, X, Code, Calculator, Globe2, Palette, Briefcase, Atom, Wrench, Music, BookOpen } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import { getSkillTranslation, getFullSkillTranslation } from '../utils/skillsTranslations';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

interface SkillNode {
  id: string;
  name: string;
  nameKz?: string;
  x: number;
  y: number;
  unlocked: boolean;
  connections: string[];
  level: number;
  description: string;
  detailedDescription: string;
  prerequisites?: string;
  outcomes?: string;
}

interface DirectionData {
  id: string;
  name: string;
  nameKz: string;
  icon: any;
  color: string;
  skills: SkillNode[];
}

export function SkillsMapPage() {
  const { t, language } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 0.6 : 1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1400, height: 900 });
  const [currentDirection, setCurrentDirection] = useState('programming');
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartDistance, setTouchStartDistance] = useState(0);

  // 8 абсолютно разных направлений
  const directions: DirectionData[] = [
    {
      id: 'programming',
      name: t('programming'),
      nameKz: 'Программалау',
      icon: Code,
      color: '#3b82f6',
      skills: [
        { id: 'center', name: t('skillStart'), x: 700, y: 450, unlocked: true, connections: ['basics'], level: 0, 
          description: 'Начало пути программиста',
          detailedDescription: 'Здесь начинается твое путешествие в мир кода. Ты научишься основам алгоритмического мышления и логики.',
          prerequisites: 'Нет требований',
          outcomes: 'Понимание базовых концепций программирования' },
        
        { id: 'basics', name: t('skillProgrammingBasics'), x: 900, y: 450, unlocked: false, connections: ['python', 'javascript'], level: 1,
          description: 'Переменные, циклы, условия',
          detailedDescription: 'Изучи фундаментальные концепции: переменные, типы данных, циклы, условные операторы, функции. Это основа всего программирования.',
          prerequisites: 'Желание учиться',
          outcomes: 'Умение писать простые программы' },
        
        { id: 'python', name: t('skillPython'), x: 1050, y: 300, unlocked: false, connections: ['django', 'data-science'], level: 2,
          description: 'Универсальный язык',
          detailedDescription: 'Python - мощный и простой язык для начинающих. Освой синтаксис, работу со списками, словарями, ООП.',
          prerequisites: 'Основы программирования',
          outcomes: 'Создание веб-приложений и скриптов' },
        
        { id: 'javascript', name: t('skillJavaScript'), x: 1050, y: 600, unlocked: false, connections: ['react', 'nodejs'], level: 2,
          description: 'Язык веба',
          detailedDescription: 'JavaScript делает веб-страницы интерактивными. Изучи ES6+, асинхронность, DOM манипуляции.',
          prerequisites: 'Основы программирования',
          outcomes: 'Разработка интерактивных веб-сайтов' },
        
        { id: 'django', name: t('skillDjango'), x: 1250, y: 200, unlocked: false, connections: ['fullstack'], level: 3,
          description: 'Python веб-фреймворк',
          detailedDescription: 'Django - мощный фреймворк для backend разработки. Научись создавать REST API, работать с БД, аутентификацией.',
          prerequisites: 'Python продвинутый уровень',
          outcomes: 'Полноценные веб-приложения' },
        
        { id: 'data-science', name: t('skillDataScience'), x: 1250, y: 400, unlocked: false, connections: ['ml'], level: 3,
          description: 'Анализ данных',
          detailedDescription: 'Работа с большими данными: pandas, numpy, matplotlib. Визуализация, статистический анализ, предобработка данных.',
          prerequisites: 'Python + математика',
          outcomes: 'Анализ и визуализация данных' },
        
        { id: 'react', name: t('skillReact'), x: 1250, y: 550, unlocked: false, connections: ['fullstack'], level: 3,
          description: 'Frontend библиотека',
          detailedDescription: 'React - современная библиотека для создания UI. Компоненты, hooks, state management, роутинг.',
          prerequisites: 'JavaScript ES6+',
          outcomes: 'Современные SPA приложения' },
        
        { id: 'nodejs', name: t('skillNodeJS'), x: 1250, y: 700, unlocked: false, connections: ['fullstack'], level: 3,
          description: 'Backend на JavaScript',
          detailedDescription: 'Node.js позволяет использовать JS на сервере. Express, работа с БД, создание API, реал-тайм приложения.',
          prerequisites: 'JavaScript продвинутый',
          outcomes: 'Backend сервисы' },
        
        { id: 'ml', name: t('skillML'), x: 1400, y: 300, unlocked: false, connections: [], level: 4,
          description: 'Машинное обучение',
          detailedDescription: 'Создание моделей ML: supervised/unsupervised learning, нейронные сети, TensorFlow, PyTorch.',
          prerequisites: 'Data Science + высшая математика',
          outcomes: 'AI модели и предсказательные системы' },
        
        { id: 'fullstack', name: t('skillFullStack'), x: 1400, y: 600, unlocked: false, connections: [], level: 4,
          description: 'Frontend + Backend',
          detailedDescription: 'Полный цикл разработки: от дизайна UI до развертывания на сервере. DevOps, CI/CD, облачные технологии.',
          prerequisites: 'React + Node.js/Django',
          outcomes: 'Полноценные продукты от А до Я' },
      ]
    },
    {
      id: 'mathematics',
      name: t('mathematics'),
      nameKz: 'Математика',
      icon: Calculator,
      color: '#8b5cf6',
      skills: [
        { id: 'center', name: t('skillStart'), x: 700, y: 450, unlocked: true, connections: ['arithmetic'], level: 0,
          description: 'Начало математического пути',
          detailedDescription: 'Математика - царица наук. Здесь ты начнешь понимать красоту чисел и логики.',
          prerequisites: 'Нет',
          outcomes: 'Математическое мышление' },
        
        { id: 'arithmetic', name: t('skillArithmetic'), x: 900, y: 450, unlocked: false, connections: ['algebra', 'geometry'], level: 1,
          description: 'Основы чисел',
          detailedDescription: 'Операции с числами, дроби, проценты, пропорции. Фундамент всей математики.',
          prerequisites: 'Базовая логика',
          outcomes: 'Уверенное владение числами' },
        
        { id: 'algebra', name: t('skillAlgebra'), x: 1050, y: 300, unlocked: false, connections: ['linear-algebra', 'calculus'], level: 2,
          description: 'Уравнения и функции',
          detailedDescription: 'Решение уравнений, системы, неравенства, функции и их свойства, квадратичные уравнения.',
          prerequisites: 'Арифметика',
          outcomes: 'Аналитическое мышление' },
        
        { id: 'geometry', name: t('skillGeometry'), x: 1050, y: 600, unlocked: false, connections: ['trig', 'analytic-geo'], level: 2,
          description: 'Фигуры и пространство',
          detailedDescription: 'Планиметрия, стереометрия, теоремы, доказательства, площади и объемы.',
          prerequisites: 'Арифметика',
          outcomes: 'Пространственное мышление' },
        
        { id: 'linear-algebra', name: t('skillLinearAlgebra'), x: 1250, y: 200, unlocked: false, connections: ['advanced-math'], level: 3,
          description: 'Векторы и матрицы',
          detailedDescription: 'Матричные операции, определители, собственные значения, линейные пространства. Основа для ML.',
          prerequisites: 'Алгебра',
          outcomes: 'Работа с многомерными данными' },
        
        { id: 'calculus', name: t('skillCalculus'), x: 1250, y: 350, unlocked: false, connections: ['advanced-math'], level: 3,
          description: 'Производные и интегралы',
          detailedDescription: 'Пределы, производные, интегралы, ряды. Изучение изменений и накоплений.',
          prerequisites: 'Алгебра',
          outcomes: 'Моделирование процессов' },
        
        { id: 'trig', name: t('skillTrigonometry'), x: 1250, y: 550, unlocked: false, connections: ['analytic-geo'], level: 3,
          description: 'Синусы и косинусы',
          detailedDescription: 'Тригонометрические функции, формулы, уравнения, применение в физике и инженерии.',
          prerequisites: 'Геометрия + Алгебра',
          outcomes: 'Решение сложных задач' },
        
        { id: 'analytic-geo', name: t('skillAnalyticGeometry'), x: 1250, y: 700, unlocked: false, connections: ['advanced-math'], level: 3,
          description: 'Геометрия через алгебру',
          detailedDescription: 'Уравнения прямых, окружностей, конических сечений в координатах.',
          prerequisites: 'Алгебра + Геометрия',
          outcomes: 'Синтез алгебры и геометрии' },
        
        { id: 'advanced-math', name: t('skillHigherMath'), x: 1400, y: 450, unlocked: false, connections: [], level: 4,
          description: 'Дифференциальные уравнения',
          detailedDescription: 'Дифур, теория вероятностей, математическая статистика, комплексный анализ.',
          prerequisites: 'Все предыдущие разделы',
          outcomes: 'Научно-исследовательский уровень' },
      ]
    },
    {
      id: 'languages',
      name: t('languages'),
      nameKz: 'Шет тілдері',
      icon: Globe2,
      color: '#10b981',
      skills: [
        { id: 'center', name: t('skillStart'), x: 700, y: 450, unlocked: true, connections: ['basics'], level: 0,
          description: 'Начало полиглота',
          detailedDescription: 'Языки открывают двери в новые культуры и возможности.',
          prerequisites: 'Нет',
          outcomes: 'Мотивация к изучению' },
        
        { id: 'basics', name: t('skillLanguageBasics'), x: 900, y: 450, unlocked: false, connections: ['english', 'chinese'], level: 1,
          description: 'Методики и подходы',
          detailedDescription: 'Фонетика, грамматика, лексика. Как эффективно учить языки, мнемотехники.',
          prerequisites: 'Родной язык',
          outcomes: 'Стратегия обучения' },
        
        { id: 'english', name: t('skillEnglishBasic'), x: 1050, y: 300, unlocked: false, connections: ['english-advanced', 'ielts'], level: 2,
          description: 'Международный язык',
          detailedDescription: 'Времена, грамматика, разговорная практика, чтение, аудирование. От Elementary до Upper-Intermediate.',
          prerequisites: 'Базовые знания',
          outcomes: 'Уверенное общение' },
        
        { id: 'chinese', name: t('skillChineseBasic'), x: 1050, y: 600, unlocked: false, connections: ['chinese-advanced'], level: 2,
          description: 'Язык будущего',
          detailedDescription: 'Иероглифы, тона, базовая грамматика. HSK 1-3 уровни.',
          prerequisites: 'Основы фонетики',
          outcomes: 'Базовое общение на китайском' },
        
        { id: 'english-advanced', name: t('skillEnglishAdvanced'), x: 1250, y: 200, unlocked: false, connections: ['polyglot'], level: 3,
          description: 'Продвинутый уровень',
          detailedDescription: 'Advanced и Proficiency. Академический английский, бизнес-коммуникация, литература.',
          prerequisites: 'English B2',
          outcomes: 'Профессиональное владение' },
        
        { id: 'ielts', name: 'IELTS Preparation', x: 1250, y: 350, unlocked: false, connections: [], level: 3,
          description: 'Подготовка к экзамену',
          detailedDescription: 'Стратегии для всех секций IELTS: Listening, Reading, Writing, Speaking. Цель - 7.0+',
          prerequisites: 'English B2+',
          outcomes: 'Высокий балл IELTS' },
        
        { id: 'chinese-advanced', name: t('skillChineseAdvanced'), x: 1250, y: 600, unlocked: false, connections: ['polyglot'], level: 3,
          description: 'Продвинутый китайский',
          detailedDescription: 'Сложная грамматика, 2500+ иероглифов, чтение газет и литературы.',
          prerequisites: 'HSK 3',
          outcomes: 'Свободное владение' },
        
        { id: 'spanish', name: 'Español (A1-B2)', x: 1050, y: 450, unlocked: false, connections: ['polyglot'], level: 2,
          description: 'Романский язык',
          detailedDescription: 'Испанская грамматика, разговорная практика, культура испаноязычных стран.',
          prerequisites: 'Основ�� изучения',
          outcomes: 'Общение на испанском' },
        
        { id: 'polyglot', name: 'Полиглот', x: 1400, y: 400, unlocked: false, connections: [], level: 4,
          description: '3+ языка свободно',
          detailedDescription: 'Владение 3+ языками на высоком уровне. Изучение новых языков становится легче.',
          prerequisites: 'English C1 + Chinese HSK5/Spanish B2',
          outcomes: 'Международная карьера' },
      ]
    },
    {
      id: 'design',
      name: t('design'),
      nameKz: 'Дизайн',
      icon: Palette,
      color: '#ec4899',
      skills: [
        { id: 'center', name: 'Старт', x: 700, y: 450, unlocked: true, connections: ['basics'], level: 0,
          description: 'Путь дизайнера',
          detailedDescription: 'Дизайн - это не только красота, но и функциональность.',
          prerequisites: 'Нет',
          outcomes: 'Визуальное мышление' },
        
        { id: 'basics', name: 'Основы дизайна', x: 900, y: 450, unlocked: false, connections: ['graphic', 'ui-ux'], level: 1,
          description: 'Теория цвета и композиция',
          detailedDescription: 'Цвет, типографика, композиция, баланс, контраст, иерархия. Принципы хорошего дизайна.',
          prerequisites: 'Эстетическое чувство',
          outcomes: 'Понимание визуальной гармонии' },
        
        { id: 'graphic', name: 'Графический дизайн', x: 1050, y: 300, unlocked: false, connections: ['adobe', 'branding'], level: 2,
          description: 'Визуальная коммуникация',
          detailedDescription: 'Создание постеров, флаеров, логотипов. Работа с векторной и растровой графикой.',
          prerequisites: 'Основы дизайна',
          outcomes: 'Создание печатных материалов' },
        
        { id: 'ui-ux', name: 'UI/UX Design', x: 1050, y: 600, unlocked: false, connections: ['figma', 'product'], level: 2,
          description: 'Дизайн интерфейсов',
          detailedDescription: 'User Interface и User Experience. Прототипирование, юзабилити, wireframes.',
          prerequisites: 'Основы дизайна',
          outcomes: 'Удобные интерфейсы' },
        
        { id: 'adobe', name: 'Adobe Suite', x: 1250, y: 200, unlocked: false, connections: ['motion'], level: 3,
          description: 'Photoshop, Illustrator, InDesign',
          detailedDescription: 'Профессиональные инструменты дизайнера. Расширенные техники обработки.',
          prerequisites: 'Графический дизайн',
          outcomes: 'Профессиональная работа' },
        
        { id: 'branding', name: 'Брендинг', x: 1250, y: 350, unlocked: false, connections: ['creative-dir'], level: 3,
          description: 'Создание брендов',
          detailedDescription: 'Айдентика, brand book, позиционирование, стратегия бренда.',
          prerequisites: 'Графический дизайн',
          outcomes: 'Комплексные бренд-решения' },
        
        { id: 'figma', name: 'Figma Expert', x: 1250, y: 550, unlocked: false, connections: ['product'], level: 3,
          description: 'Современное прототипирование',
          detailedDescription: 'Auto Layout, компоненты, variables, advanced prototyping, design systems.',
          prerequisites: 'UI/UX основы',
          outcomes: 'Интерактивные прототипы' },
        
        { id: 'motion', name: 'Motion Design', x: 1250, y: 700, unlocked: false, connections: ['creative-dir'], level: 3,
          description: 'Анимация и видео',
          detailedDescription: 'After Effects, анимация интерфейсов, видео-графика, титры.',
          prerequisites: 'Adobe Suite',
          outcomes: 'Живые визуальные истории' },
        
        { id: 'product', name: 'Product Design', x: 1400, y: 600, unlocked: false, connections: ['creative-dir'], level: 4,
          description: 'Дизайн продуктов',
          detailedDescription: 'От исследований до запуска продукта. Design thinking, A/B тесты, метрики.',
          prerequisites: 'UI/UX + Figma',
          outcomes: 'Успешные цифровые продукты' },
        
        { id: 'creative-dir', name: 'Creative Director', x: 1400, y: 350, unlocked: false, connections: [], level: 4,
          description: 'Креативное лидерство',
          detailedDescription: 'Управление командой дизайнеров, стратегическое видение, презентации клиентам.',
          prerequisites: 'Branding + Motion/Product',
          outcomes: 'Руководство креативом' },
      ]
    },
    {
      id: 'business',
      name: t('business'),
      nameKz: 'Бизнес және Экономика',
      icon: Briefcase,
      color: '#f59e0b',
      skills: [
        { id: 'center', name: 'Старт', x: 700, y: 450, unlocked: true, connections: ['basics'], level: 0,
          description: 'Путь предпринимателя',
          detailedDescription: 'Научись создавать и управлять бизнесом.',
          prerequisites: 'Нет',
          outcomes: 'Предпринимательское мышление' },
        
        { id: 'basics', name: 'Основы экономики', x: 900, y: 450, unlocked: false, connections: ['micro', 'finance'], level: 1,
          description: 'Спрос и предложение',
          detailedDescription: 'Базовые экономические концепции: спрос, предложение, рынки, цены, конкуренция.',
          prerequisites: 'Математика',
          outcomes: 'Понимание экономики' },
        
        { id: 'micro', name: 'Микроэкономика', x: 1050, y: 300, unlocked: false, connections: ['marketing', 'macro'], level: 2,
          description: 'Поведение фирм',
          detailedDescription: 'Теория потребителя, издержки, прибыль, рыночные структуры.',
          prerequisites: 'Основы экономики',
          outcomes: 'Бизнес-аналитика' },
        
        { id: 'finance', name: 'Финансы', x: 1050, y: 600, unlocked: false, connections: ['accounting', 'investment'], level: 2,
          description: 'Управление деньгами',
          detailedDescription: 'Финансовая грамотность, бюджетирование, личные финансы, кредиты.',
          prerequisites: 'Основы экономики',
          outcomes: 'Финансовое планирование' },
        
        { id: 'marketing', name: 'Маркетинг', x: 1250, y: 200, unlocked: false, connections: ['startup'], level: 3,
          description: '4P и продвижение',
          detailedDescription: 'Product, Price, Place, Promotion. Digital маркетинг, SEO, SMM, контент.',
          prerequisites: 'Микроэкономика',
          outcomes: 'Продвижение продуктов' },
        
        { id: 'macro', name: 'Макроэкономика', x: 1250, y: 350, unlocked: false, connections: ['policy'], level: 3,
          description: 'Экономика стран',
          detailedDescription: 'ВВП, инфляция, безработица, монетарная и фискальная политика.',
          prerequisites: 'Микроэкономика',
          outcomes: 'Анализ экономических трендов' },
        
        { id: 'accounting', name: 'Бухучет', x: 1250, y: 550, unlocked: false, connections: ['cfo'], level: 3,
          description: 'Финансовая отчетность',
          detailedDescription: 'Баланс, P&L, cash flow, налоги, МСФО.',
          prerequisites: 'Финансы',
          outcomes: 'Финансовый учет' },
        
        { id: 'investment', name: 'Инвестиции', x: 1250, y: 700, unlocked: false, connections: ['cfo'], level: 3,
          description: 'Фондовый рынок',
          detailedDescription: 'Акции, облигации, портфельные инвестиции, криптовалюты, риск-менеджмент.',
          prerequisites: 'Финансы',
          outcomes: 'Управление капиталом' },
        
        { id: 'startup', name: 'Стартап', x: 1400, y: 250, unlocked: false, connections: ['ceo'], level: 4,
          description: 'От идеи к продукту',
          detailedDescription: 'Lean startup, MVP, питчинг инвесторам, бизнес-модели, Unit-экономика.',
          prerequisites: 'Маркетинг + Финансы',
          outcomes: 'Запуск своего проекта' },
        
        { id: 'policy', name: 'Экономическая политика', x: 1400, y: 400, unlocked: false, connections: ['ceo'], level: 4,
          description: 'Государство и экономика',
          detailedDescription: 'Регулирование, международная торговля, экономический рост.',
          prerequisites: 'Макроэкономика',
          outcomes: 'Стратегическое мышление' },
        
        { id: 'cfo', name: 'CFO Skills', x: 1400, y: 600, unlocked: false, connections: ['ceo'], level: 4,
          description: 'Финансовый директор',
          detailedDescription: 'Финансовое планирование компании, привлечение капитала, оптимизация.',
          prerequisites: 'Бухучет + Инвестиции',
          outcomes: 'Управление финансами компании' },
        
        { id: 'ceo', name: 'CEO/Entrepreneur', x: 1550, y: 400, unlocked: false, connections: [], level: 5,
          description: 'Генеральный директор',
          detailedDescription: 'Комплексное управление бизнесом, стратегия, лидерство, масштабирование.',
          prerequisites: 'Все бизнес-навыки',
          outcomes: 'Создание и управление компанией' },
      ]
    },
    {
      id: 'science',
      name: t('science'),
      nameKz: 'Жаратылыстану',
      icon: Atom,
      color: '#06b6d4',
      skills: [
        { id: 'center', name: 'Старт', x: 700, y: 450, unlocked: true, connections: ['basics'], level: 0,
          description: 'Исследователь природы',
          detailedDescription: 'Познавай законы Вселенной через науку.',
          prerequisites: 'Нет',
          outcomes: 'Научное любопытство' },
        
        { id: 'basics', name: 'Научный метод', x: 900, y: 450, unlocked: false, connections: ['physics', 'chemistry', 'biology'], level: 1,
          description: 'Как работает наука',
          detailedDescription: 'Гипотеза, эксперимент, анализ, выводы. Критическое мышление.',
          prerequisites: 'Логика',
          outcomes: 'Научный подход' },
        
        { id: 'physics', name: 'Физика', x: 1050, y: 250, unlocked: false, connections: ['mechanics', 'quantum'], level: 2,
          description: 'Законы природы',
          detailedDescription: 'Механика, термодинамика, электричество, оптика, колебания и волны.',
          prerequisites: 'Научный метод + Математика',
          outcomes: 'Понимание физических процессов' },
        
        { id: 'chemistry', name: 'Химия', x: 1050, y: 450, unlocked: false, connections: ['organic', 'biochem'], level: 2,
          description: 'Наука о веществах',
          detailedDescription: 'Атомы, молекулы, реакции, периодическая система, химические связи.',
          prerequisites: 'Научный метод',
          outcomes: 'Понимание химии' },
        
        { id: 'biology', name: 'Биология', x: 1050, y: 650, unlocked: false, connections: ['genetics', 'biochem'], level: 2,
          description: 'Наука о жизни',
          detailedDescription: 'Клетки, ткани, органы, эволюция, экология, фотосинтез.',
          prerequisites: 'Научный метод',
          outcomes: 'Понимание живых систем' },
        
        { id: 'mechanics', name: 'Классическая механика', x: 1250, y: 150, unlocked: false, connections: ['research'], level: 3,
          description: 'Законы движения',
          detailedDescription: 'Ньютоновская механика, динамика, статика, законы сохранения.',
          prerequisites: 'Физика + Высшая математика',
          outcomes: 'Решение сложных задач' },
        
        { id: 'quantum', name: 'Квантовая физика', x: 1250, y: 300, unlocked: false, connections: ['research'], level: 3,
          description: 'Мир частиц',
          detailedDescription: 'Квантовая механика, принцип неопределенности, волновая функция.',
          prerequisites: 'Физика продвинутая',
          outcomes: 'Понимание микромира' },
        
        { id: 'organic', name: 'Органическая химия', x: 1250, y: 450, unlocked: false, connections: ['biochem'], level: 3,
          description: 'Химия углерода',
          detailedDescription: 'Углеводороды, функциональные группы, реакции органических веществ.',
          prerequisites: 'Химия',
          outcomes: 'Синтез органики' },
        
        { id: 'genetics', name: 'Генетика', x: 1250, y: 600, unlocked: false, connections: ['biotech'], level: 3,
          description: 'ДНК и наследственность',
          detailedDescription: 'Гены, мутации, наследование признаков, генная инженерия.',
          prerequisites: 'Биология',
          outcomes: 'Понимание генетики' },
        
        { id: 'biochem', name: 'Биохимия', x: 1250, y: 750, unlocked: false, connections: ['biotech'], level: 3,
          description: 'Химия живых систем',
          detailedDescription: 'Белки, ферменты, метаболизм, биоэнергетика.',
          prerequisites: 'Биология + Химия',
          outcomes: 'Молекулярная биология' },
        
        { id: 'research', name: 'Научные исследования', x: 1400, y: 250, unlocked: false, connections: [], level: 4,
          description: 'Передний край науки',
          detailedDescription: 'Работа в лаборатории, публикации, гранты, конференции.',
          prerequisites: 'Физика продвинутая',
          outcomes: 'Научная карьера' },
        
        { id: 'biotech', name: 'Биотехнологии', x: 1400, y: 650, unlocked: false, connections: [], level: 4,
          description: 'Прикладная биология',
          detailedDescription: 'CRISPR, клонирование, биопроизводство, медицинские технологии.',
          prerequisites: 'Генетика + Биохимия',
          outcomes: 'Биотех инновации' },
      ]
    },
    {
      id: 'engineering',
      name: t('engineering'),
      nameKz: 'Инженерия',
      icon: Wrench,
      color: '#ef4444',
      skills: [
        { id: 'center', name: 'Старт', x: 700, y: 450, unlocked: true, connections: ['basics'], level: 0,
          description: 'Создатель технологий',
          detailedDescription: 'Инженеры меняют мир через технологии.',
          prerequisites: 'Нет',
          outcomes: 'Техническое мышление' },
        
        { id: 'basics', name: 'Инженерное мышление', x: 900, y: 450, unlocked: false, connections: ['mechanical', 'electrical'], level: 1,
          description: 'Решение технических задач',
          detailedDescription: 'Черчение, чтение схем, базовые принципы конструирования.',
          prerequisites: 'Физика + Математика',
          outcomes: 'Техническая грамотность' },
        
        { id: 'mechanical', name: 'Механика', x: 1050, y: 300, unlocked: false, connections: ['cad', 'robotics'], level: 2,
          description: 'Механические системы',
          detailedDescription: 'Детали машин, механизмы, передачи, сопромат.',
          prerequisites: 'Инженерное мышление',
          outcomes: 'Проектирование механизмов' },
        
        { id: 'electrical', name: 'Электротехника', x: 1050, y: 600, unlocked: false, connections: ['electronics', 'robotics'], level: 2,
          description: 'Электрические цепи',
          detailedDescription: 'Закон Ома, цепи постоянного и переменного тока, трансформаторы.',
          prerequisites: 'Инженерное мышление',
          outcomes: 'Работа с электричеством' },
        
        { id: 'cad', name: 'CAD/CAM', x: 1250, y: 200, unlocked: false, connections: ['manufacturing'], level: 3,
          description: '3D моделирование',
          detailedDescription: 'SolidWorks, AutoCAD, параметрическое моделирование, чертежи.',
          prerequisites: 'Механика',
          outcomes: 'Проектирование в 3D' },
        
        { id: 'electronics', name: 'Электроника', x: 1250, y: 500, unlocked: false, connections: ['embedded'], level: 3,
          description: 'Микросхемы и платы',
          detailedDescription: 'Транзисторы, микросхемы, Arduino, макетирование плат.',
          prerequisites: 'Электротехника',
          outcomes: 'Создание электронных устройств' },
        
        { id: 'robotics', name: 'Робототехника', x: 1250, y: 700, unlocked: false, connections: ['automation'], level: 3,
          description: 'Роботы и автоматика',
          detailedDescription: 'Сервоприводы, датчики, программирование роботов, кинематика.',
          prerequisites: 'Механика + Электротехника',
          outcomes: 'Сборка и программирование роботов' },
        
        { id: 'embedded', name: 'Встроенные системы', x: 1400, y: 450, unlocked: false, connections: ['iot'], level: 4,
          description: 'Программирование железа',
          detailedDescription: 'Микроконтроллеры, прошивки, real-time системы, RTOS.',
          prerequisites: 'Электроника + Программирование',
          outcomes: 'IoT устройства' },
        
        { id: 'manufacturing', name: 'Производство', x: 1400, y: 250, unlocked: false, connections: ['automation'], level: 4,
          description: 'Промышленное производство',
          detailedDescription: 'Технологии изготовления, материаловедение, качество, lean.',
          prerequisites: 'CAD/CAM',
          outcomes: 'Запуск в производство' },
        
        { id: 'automation', name: 'Автоматизация', x: 1550, y: 500, unlocked: false, connections: ['iot'], level: 4,
          description: 'Промышленная автоматика',
          detailedDescription: 'ПЛК, SCADA системы, промышленные сети.',
          prerequisites: 'Робототехника + Производство',
          outcomes: 'Автоматизированные линии' },
        
        { id: 'iot', name: 'Internet of Things', x: 1550, y: 600, unlocked: false, connections: [], level: 5,
          description: 'Умные системы',
          detailedDescription: 'Сенсорные сети, облачные платформы, big data от устройств.',
          prerequisites: 'Embedded + Автоматизация',
          outcomes: 'Комплексные IoT решения' },
      ]
    },
    {
      id: 'arts',
      name: t('arts'),
      nameKz: 'Өнер және Шығармашылық',
      icon: Music,
      color: '#a855f7',
      skills: [
        { id: 'center', name: 'Старт', x: 700, y: 450, unlocked: true, connections: ['basics'], level: 0,
          description: 'Творческий путь',
          detailedDescription: 'Искусство - это выражение души и эмоций.',
          prerequisites: 'Нет',
          outcomes: 'Креативное мышление' },
        
        { id: 'basics', name: 'Основы искусства', x: 900, y: 450, unlocked: false, connections: ['drawing', 'music'], level: 1,
          description: 'Композиция и гармония',
          detailedDescription: 'Базовые принципы композиции, цвета, ритма. История искусства.',
          prerequisites: 'Эстетическое восприятие',
          outcomes: 'Понимание искусства' },
        
        { id: 'drawing', name: 'Рисование', x: 1050, y: 300, unlocked: false, connections: ['painting', 'digital-art'], level: 2,
          description: 'Графика и скетчинг',
          detailedDescription: 'Карандаш, перспектива, светотень, пропорции, анатомия.',
          prerequisites: 'Основы искусства',
          outcomes: 'Академический рисунок' },
        
        { id: 'music', name: 'Музыка', x: 1050, y: 600, unlocked: false, connections: ['theory', 'production'], level: 2,
          description: 'Игра на инструменте',
          detailedDescription: 'Фортепиано/гитара, ноты, ритм, мелодия, гармония.',
          prerequisites: 'Основы искусства',
          outcomes: 'Исполнительское мастерство' },
        
        { id: 'painting', name: 'Живопись', x: 1250, y: 200, unlocked: false, connections: ['fine-arts'], level: 3,
          description: 'Масло, акрил, акварель',
          detailedDescription: 'Техники живописи, цветоведение, мазки, композиция картин.',
          prerequisites: 'Рисование',
          outcomes: 'Создание картин' },
        
        { id: 'digital-art', name: 'Digital Art', x: 1250, y: 350, unlocked: false, connections: ['illustration'], level: 3,
          description: 'Цифровое рисование',
          detailedDescription: 'Графический планшет, Procreate, layers, brushes, concept art.',
          prerequisites: 'Рисование',
          outcomes: 'Цифровые иллюстрации' },
        
        { id: 'theory', name: 'Теория музыки', x: 1250, y: 550, unlocked: false, connections: ['composition'], level: 3,
          description: 'Гармония и сольфеджио',
          detailedDescription: 'Аккорды, тональности, модуляции, музыкальный анализ.',
          prerequisites: 'Музыка',
          outcomes: 'Понимание музыкальной структуры' },
        
        { id: 'production', name: 'Music Production', x: 1250, y: 700, unlocked: false, connections: ['composition'], level: 3,
          description: 'Звукозапись и сведение',
          detailedDescription: 'DAW (Ableton/Logic), микширование, мастеринг, звуковой дизайн.',
          prerequisites: 'Музыка',
          outcomes: 'Создание треков' },
        
        { id: 'fine-arts', name: 'Изобразительное искусство', x: 1400, y: 250, unlocked: false, connections: ['artist'], level: 4,
          description: 'Профессиональный художник',
          detailedDescription: 'Стиль, выставки, галереи, арт-рынок, портфолио.',
          prerequisites: 'Живопись + Digital Art',
          outcomes: 'Художественная карьера' },
        
        { id: 'illustration', name: 'Иллюстрация', x: 1400, y: 400, unlocked: false, connections: ['artist'], level: 4,
          description: 'Коммерческая иллюстрация',
          detailedDescription: 'Книжная, журнальная иллюстрация, character design, сторибординг.',
          prerequisites: 'Digital Art',
          outcomes: 'Работа иллюстратором' },
        
        { id: 'composition', name: 'Композиция', x: 1400, y: 650, unlocked: false, connections: ['musician'], level: 4,
          description: 'Сочинение музыки',
          detailedDescription: 'Написание песен, саундтреков, оркестровка.',
          prerequisites: 'Теория + Production',
          outcomes: 'Создание оригинальной музыки' },
        
        { id: 'artist', name: 'Профессиональный артист', x: 1550, y: 350, unlocked: false, connections: [], level: 5,
          description: 'Признанный художник',
          detailedDescription: 'Персональные выставки, продажа работ, международное признание.',
          prerequisites: 'Fine Arts + Illustration',
          outcomes: 'Художественное признание' },
        
        { id: 'musician', name: 'Профессиональный музыкант', x: 1550, y: 650, unlocked: false, connections: [], level: 5,
          description: 'Музыкальная карьера',
          detailedDescription: 'Концерты, альбомы, коллаборации, музыкальное продюсирование.',
          prerequisites: 'Композиция',
          outcomes: 'Музыкальная индустрия' },
      ]
    },
  ];

  const currentDirectionData = directions.find(d => d.id === currentDirection)!;
  const [skills, setSkills] = useState<SkillNode[]>(currentDirectionData.skills);

  // Update skills when direction changes
  useEffect(() => {
    const newDirection = directions.find(d => d.id === currentDirection)!;
    setSkills(newDirection.skills);
    setSelectedSkill(null);
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  }, [currentDirection]);

  // Generate animated stars
  const [stars] = useState(() => {
    const starArray = [];
    for (let i = 0; i < 300; i++) {
      starArray.push({
        x: Math.random() * 1400,
        y: Math.random() * 900,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      });
    }
    return starArray;
  });

  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(f => f + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setCanvasSize({ width, height });
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [skills, zoom, offset, hoveredSkill, animationFrame]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Deep space background
    const gradient = ctx.createRadialGradient(700, 450, 0, 700, 450, 800);
    gradient.addColorStop(0, '#0a0e27');
    gradient.addColorStop(0.5, '#050810');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw twinkling stars
    stars.forEach((star, index) => {
      const twinkle = Math.sin(animationFrame * star.twinkleSpeed + index) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      
      if (star.size > 2) {
        const glowGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2);
        glowGradient.addColorStop(0, `rgba(147, 197, 253, ${star.opacity * twinkle * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(147, 197, 253, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw connections
    skills.forEach(skill => {
      if (skill.unlocked) {
        skill.connections.forEach(connId => {
          const connectedSkill = skills.find(s => s.id === connId);
          if (connectedSkill) {
            const flowOffset = (animationFrame * 2) % 20;
            
            ctx.strokeStyle = connectedSkill.unlocked 
              ? 'rgba(96, 165, 250, 0.6)' 
              : 'rgba(100, 116, 139, 0.3)';
            ctx.lineWidth = connectedSkill.unlocked ? 3 : 1.5;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(skill.x, skill.y);
            ctx.lineTo(connectedSkill.x, connectedSkill.y);
            ctx.stroke();
            
            if (connectedSkill.unlocked) {
              ctx.strokeStyle = 'rgba(147, 197, 253, 0.8)';
              ctx.lineWidth = 2;
              ctx.setLineDash([10, 10]);
              ctx.lineDashOffset = -flowOffset;
              ctx.beginPath();
              ctx.moveTo(skill.x, skill.y);
              ctx.lineTo(connectedSkill.x, connectedSkill.y);
              ctx.stroke();
            }
          }
        });
      }
    });
    ctx.setLineDash([]);

    // Draw skill nodes
    skills.forEach(skill => {
      const isHovered = hoveredSkill === skill.id;
      const isCenter = skill.id === 'center';
      const radius = isCenter ? 35 : 22;
      
      if (skill.unlocked) {
        const pulseSize = Math.sin(animationFrame * 0.05) * 5 + 20;
        const gradient = ctx.createRadialGradient(skill.x, skill.y, 0, skill.x, skill.y, radius + pulseSize);
        gradient.addColorStop(0, isCenter 
          ? 'rgba(139, 92, 246, 0.6)' 
          : 'rgba(96, 165, 250, 0.5)');
        gradient.addColorStop(0.5, isCenter 
          ? 'rgba(139, 92, 246, 0.3)' 
          : 'rgba(96, 165, 250, 0.2)');
        gradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(skill.x, skill.y, radius + pulseSize, 0, Math.PI * 2);
        ctx.fill();
      }

      if (skill.unlocked) {
        const circleGradient = ctx.createRadialGradient(
          skill.x - radius * 0.3, 
          skill.y - radius * 0.3, 
          0, 
          skill.x, 
          skill.y, 
          radius
        );
        if (isCenter) {
          circleGradient.addColorStop(0, '#a78bfa');
          circleGradient.addColorStop(0.5, '#8b5cf6');
          circleGradient.addColorStop(1, '#6d28d9');
        } else {
          circleGradient.addColorStop(0, '#93c5fd');
          circleGradient.addColorStop(0.5, '#60a5fa');
          circleGradient.addColorStop(1, '#3b82f6');
        }
        ctx.fillStyle = circleGradient;
      } else {
        ctx.fillStyle = 'rgba(71, 85, 105, 0.6)';
      }
      
      const displayRadius = isHovered ? radius + 4 : radius;
      ctx.beginPath();
      ctx.arc(skill.x, skill.y, displayRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = skill.unlocked 
        ? (isCenter ? '#c4b5fd' : '#93c5fd')
        : 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = isHovered ? 4 : 2.5;
      ctx.stroke();

      if (skill.unlocked) {
        const shimmer = Math.sin(animationFrame * 0.08) * 0.2 + 0.8;
        ctx.strokeStyle = `rgba(255, 255, 255, ${shimmer * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(skill.x, skill.y, displayRadius - 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (isCenter) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', skill.x, skill.y);
      }

      ctx.fillStyle = skill.unlocked ? '#ffffff' : 'rgba(148, 163, 184, 0.7)';
      ctx.font = isCenter ? 'bold 16px sans-serif' : (skill.level === 1 ? 'bold 13px sans-serif' : '12px sans-serif');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (skill.unlocked) {
        ctx.shadowColor = isCenter ? 'rgba(139, 92, 246, 0.8)' : 'rgba(96, 165, 250, 0.8)';
        ctx.shadowBlur = 8;
      }
      
      const textY = skill.y + radius + 18;
      const skillName = getSkillTranslation(skill.id, language, 'name') || skill.name;
      ctx.fillText(skillName, skill.x, textY);
      
      ctx.shadowBlur = 0;

      if (!isCenter && skill.level <= 3) {
        ctx.fillStyle = skill.unlocked ? '#fbbf24' : 'rgba(156, 163, 175, 0.5)';
        ctx.font = '10px sans-serif';
        ctx.fillText(`L${skill.level}`, skill.x, skill.y + radius + 32);
      }
    });

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    const clickedSkill = skills.find(skill => {
      const radius = skill.id === 'center' ? 35 : 22;
      const distance = Math.sqrt((x - skill.x) ** 2 + (y - skill.y) ** 2);
      return distance <= radius;
    });

    if (clickedSkill) {
      // Show dialog for any skill
      setSelectedSkill(clickedSkill);
    } else {
      setSelectedSkill(null);
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    const hoveredSkillNode = skills.find(skill => {
      const radius = skill.id === 'center' ? 35 : 22;
      const distance = Math.sqrt((x - skill.x) ** 2 + (y - skill.y) ** 2);
      return distance <= radius;
    });

    setHoveredSkill(hoveredSkillNode?.id || null);

    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      setOffset({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers
  const getTouchDistance = (e: React.TouchEvent) => {
    if (e.touches.length < 2) return 0;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      setTouchStartDistance(getTouchDistance(e));
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || e.touches.length !== 1) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left - offset.x) / zoom;
    const y = (touch.clientY - rect.top - offset.y) / zoom;

    const clickedSkill = skills.find(skill => {
      const radius = skill.id === 'center' ? 35 : 22;
      const distance = Math.sqrt((x - skill.x) ** 2 + (y - skill.y) ** 2);
      return distance <= radius;
    });

    if (clickedSkill) {
      setSelectedSkill(clickedSkill);
    } else {
      setIsDragging(true);
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && touchStartDistance > 0) {
      const currentDistance = getTouchDistance(e);
      const delta = currentDistance - touchStartDistance;
      const zoomDelta = delta * 0.01;
      const newZoom = Math.max(0.3, Math.min(3, zoom + zoomDelta));
      setZoom(newZoom);
      setTouchStartDistance(currentDistance);
      return;
    }

    if (!isDragging || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    setOffset({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStartDistance(0);
  };

  // Detect mobile and set initial zoom
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Set initial zoom based on device type if zoom is at default
      if (zoom === 1 || zoom === 0.6) {
        setZoom(mobile ? 0.6 : 1);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const unlockSkill = (skillId: string) => {
    setSkills(skills.map(skill => 
      skill.id === skillId ? { ...skill, unlocked: true } : skill
    ));
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      toast.success(`⭐ ${skill.name} ${t('skillMastered')}`, {
        description: t('continueExploring')
      });
    }
  };

  const handleMarkAsLearned = () => {
    if (!selectedSkill) return;
    
    if (selectedSkill.id === 'center') {
      toast.info(t('startingSkillUnlocked'));
      setSelectedSkill(null);
      return;
    }

    if (selectedSkill.unlocked) {
      toast.info(t('skillAlreadyLearned'));
      setSelectedSkill(null);
      return;
    }

    const hasUnlockedParent = skills.some(skill => 
      skill.unlocked && skill.connections.includes(selectedSkill.id)
    );
    
    if (!hasUnlockedParent) {
      toast.error(t('learnPrevious'), {
        description: t('followPath')
      });
      return;
    }

    unlockSkill(selectedSkill.id);
    setSelectedSkill(null);
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.3));
  const handleReset = () => {
    setZoom(isMobile ? 0.6 : 1);
    setOffset({ x: 0, y: 0 });
  };

  const unlockedCount = skills.filter(s => s.unlocked).length;
  const totalCount = skills.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  const navigate = useNavigate();

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-2 md:py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-2 md:mb-3">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                <h1 className="text-lg md:text-2xl bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {t('skills')}
                </h1>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                <Star className="w-3 h-3 mr-1" />
                {unlockedCount} / {totalCount}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs hidden sm:inline-flex">
                {progress}% {t('progressCompleted')}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 hidden md:flex"
              >
                <Info className="w-4 h-4 mr-2" />
                {t('hint')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-red-300 hover:bg-red-500/20 hover:text-red-200"
              >
                <X className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t('exit')}</span>
              </Button>
            </div>
          </div>
          
          {/* Direction Selector - Scrollable tabs */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              {directions.map(dir => {
                const IconComponent = dir.icon;
                const isActive = currentDirection === dir.id;
                return (
                  <button
                    key={dir.id}
                    onClick={() => setCurrentDirection(dir.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                    style={isActive ? { 
                      boxShadow: `0 0 20px ${dir.color}40` 
                    } : {}}
                  >
                    <IconComponent className="w-4 h-4" style={{ color: isActive ? 'white' : dir.color }} />
                    <span className="text-sm">{dir.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full cursor-move touch-none"
        style={{ touchAction: 'none' }}
      />

      {/* Controls */}
      <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 flex flex-col gap-2 z-10">
        <Button
          size="icon"
          onClick={handleZoomIn}
          className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-blue-500/30 shadow-lg shadow-blue-500/20 w-10 h-10 md:w-12 md:h-12"
        >
          <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
        <Button
          size="icon"
          onClick={handleZoomOut}
          className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-blue-500/30 shadow-lg shadow-blue-500/20 w-10 h-10 md:w-12 md:h-12"
        >
          <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
        <Button
          size="icon"
          onClick={handleReset}
          className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-blue-500/30 shadow-lg shadow-blue-500/20 w-10 h-10 md:w-12 md:h-12"
        >
          <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      </div>

      {/* Zoom Indicator */}
      <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-10">
        <Badge className="bg-slate-900/80 backdrop-blur-md border-blue-500/30 text-blue-300 text-xs">
          {Math.round(zoom * 100)}%
        </Badge>
      </div>

      {/* Skill Dialog */}
      <Dialog open={selectedSkill !== null} onOpenChange={(open) => !open && setSelectedSkill(null)}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw] h-[85vh] max-h-[85vh]' : 'max-w-2xl'} bg-slate-900/95 backdrop-blur-xl border-2 border-blue-500/30 overflow-y-auto`}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selectedSkill?.id === 'center' ? (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg md:text-2xl text-white truncate">
                  {selectedSkill && (getSkillTranslation(selectedSkill.id, language, 'name') || selectedSkill.name)}
                </DialogTitle>
                <DialogDescription className="text-sm md:text-base text-blue-400">
                  {selectedSkill && (getSkillTranslation(selectedSkill.id, language, 'description') || selectedSkill.description)}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedSkill && (
            <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${selectedSkill.unlocked ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-slate-700/50 text-slate-400'}`}>
                  {selectedSkill.unlocked ? `✓ ${t('mastered')}` : `🔒 ${t('locked')}`}
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                  {t('level')} {selectedSkill.level}
                </Badge>
              </div>

              <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <h4 className="flex items-center gap-2 mb-2 text-sm md:text-base text-blue-900 dark:text-blue-300">
                  <Info className="w-4 h-4" />
                  {t('detailedDescription')}
                </h4>
                <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200">
                  {getSkillTranslation(selectedSkill.id, language, 'detailedDescription') || selectedSkill.detailedDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {selectedSkill.prerequisites && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <div className="text-xs md:text-sm text-orange-700 dark:text-orange-400 mb-1">{t('requirements')}</div>
                    <div className="text-xs md:text-sm text-orange-900 dark:text-orange-200">
                      {getSkillTranslation(selectedSkill.id, language, 'prerequisites') || selectedSkill.prerequisites}
                    </div>
                  </div>
                )}
                {selectedSkill.outcomes && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div className="text-xs md:text-sm text-green-700 dark:text-green-400 mb-1">{t('results')}</div>
                    <div className="text-xs md:text-sm text-green-900 dark:text-green-200">
                      {getSkillTranslation(selectedSkill.id, language, 'outcomes') || selectedSkill.outcomes}
                    </div>
                  </div>
                )}
              </div>

              {selectedSkill.connections.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">{t('opensPathTo')}:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.connections.map(connId => {
                      const connSkill = skills.find(s => s.id === connId);
                      return connSkill ? (
                        <Badge 
                          key={connId}
                          className={connSkill.unlocked 
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                            : 'bg-slate-700/30 text-slate-400 border-slate-600/30'
                          }
                        >
                          {getSkillTranslation(connSkill.id, language, 'name') || connSkill.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 pt-3 md:pt-4 border-t border-slate-700">
                <div className="text-xs md:text-sm text-slate-400">
                  {selectedSkill.unlocked ? t('skillAlreadyStudied') : selectedSkill.id === 'center' ? t('startingSkill') : t('clickToStudy')}
                </div>
                {!selectedSkill.unlocked && selectedSkill.id !== 'center' && (
                  <Button 
                    onClick={handleMarkAsLearned}
                    size={isMobile ? "sm" : "default"}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 w-full md:w-auto"
                  >
                    <BookOpen className="w-4 h-4" />
                    {t('studied')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
