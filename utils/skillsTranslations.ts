// ===================================
// 🌐 SKILLS TRANSLATIONS  
// Переводы всех навыков для Skills Map (86 навыков × 3 языка)
// ===================================

import { Language } from './i18n';

interface SkillTranslation {
  name: string;
  description: string;
  detailedDescription: string;
  prerequisites?: string;
  outcomes?: string;
}

type SkillTranslations = {
  [skillId: string]: {
    ru: SkillTranslation;
    kk: SkillTranslation;
    en: SkillTranslation;
  };
};

export const skillsTranslations: SkillTranslations = {
  // ========== ОБЩИЙ СТАРТОВЫЙ НАВЫК ==========
  center: {
    ru: {
      name: 'Старт',
      description: 'Начало пути',
      detailedDescription: 'Познай красоту этого направления. Первые шаги к мастерству.',
      prerequisites: 'Нет',
      outcomes: 'Базовое понимание'
    },
    kk: {
      name: 'Бастау',
      description: 'Жолдың басы',
      detailedDescription: 'Осы бағыттың сұлулығын танып біліңіз. Шеберлікке алғашқы қадамдар.',
      prerequisites: 'Жоқ',
      outcomes: 'Базалық түсінік'
    },
    en: {
      name: 'Start',
      description: 'Beginning of the journey',
      detailedDescription: 'Discover the beauty of this field. First steps to mastery.',
      prerequisites: 'None',
      outcomes: 'Basic understanding'
    }
  },

  // ========== PROGRAMMING (10 навыков) ==========
  basics: {
    ru: {
      name: 'Основы программирования',
      description: 'Базовые концепции',
      detailedDescription: 'Переменные, циклы, условия, функции. Основы алгоритмического мышления.',
      prerequisites: 'Старт',
      outcomes: 'Понимание базовых конструкций'
    },
    kk: {
      name: 'Бағдарламалау негіздері',
      description: 'Базалық ұғымдар',
      detailedDescription: 'Айнымалылар, циклдер, шарттар, функциялар. Алгоритмдік ойлаудың негіздері.',
      prerequisites: 'Бастау',
      outcomes: 'Базалық конструкцияларды түсіну'
    },
    en: {
      name: 'Programming Basics',
      description: 'Basic concepts',
      detailedDescription: 'Variables, loops, conditions, functions. Fundamentals of algorithmic thinking.',
      prerequisites: 'Start',
      outcomes: 'Understanding of basic constructs'
    }
  },

  python: {
    ru: {
      name: 'Python',
      description: 'Язык для всего',
      detailedDescription: 'Универсальный язык программирования. Веб, анализ данных, машинное обучение, автоматизация.',
      prerequisites: 'Основы программирования',
      outcomes: 'Навыки разработки на Python'
    },
    kk: {
      name: 'Python',
      description: 'Барлық нәрсеге арналған тіл',
      detailedDescription: 'Әмбебап бағдарламалау тілі. Веб, деректер талдауы, машиналық оқыту, автоматтандыру.',
      prerequisites: 'Бағдарламалау негіздері',
      outcomes: 'Python-да әзірлеу дағдылары'
    },
    en: {
      name: 'Python',
      description: 'Language for everything',
      detailedDescription: 'Universal programming language. Web, data analysis, machine learning, automation.',
      prerequisites: 'Programming Basics',
      outcomes: 'Python development skills'
    }
  },

  javascript: {
    ru: {
      name: 'JavaScript',
      description: 'Язык веба',
      detailedDescription: 'Основной язык для фронтенда и Node.js для бэкенда. ES6+, async/await, DOM.',
      prerequisites: 'Основы программирования',
      outcomes: 'Разработка веб-приложений'
    },
    kk: {
      name: 'JavaScript',
      description: 'Веб тілі',
      detailedDescription: 'Фронтенд үшін негізгі тіл және бэкенд үшін Node.js. ES6+, async/await, DOM.',
      prerequisites: 'Бағдарламалау негіздері',
      outcomes: 'Веб-қосымшаларды әзірлеу'
    },
    en: {
      name: 'JavaScript',
      description: 'Language of the web',
      detailedDescription: 'Main language for frontend and Node.js for backend. ES6+, async/await, DOM.',
      prerequisites: 'Programming Basics',
      outcomes: 'Web application development'
    }
  },

  django: {
    ru: {
      name: 'Django',
      description: 'Python веб-фреймворк',
      detailedDescription: 'Мощный фреймворк для создания веб-приложений на Python. ORM, админка, безопасность.',
      prerequisites: 'Python',
      outcomes: 'Backend разработка на Django'
    },
    kk: {
      name: 'Django',
      description: 'Python веб-фреймворк',
      detailedDescription: 'Python-да веб-қосымшаларды жасауға арналған қуатты фреймворк. ORM, админ панель, қауіпсіздік.',
      prerequisites: 'Python',
      outcomes: 'Django-да Backend әзірлеу'
    },
    en: {
      name: 'Django',
      description: 'Python web framework',
      detailedDescription: 'Powerful framework for building web applications in Python. ORM, admin panel, security.',
      prerequisites: 'Python',
      outcomes: 'Backend development with Django'
    }
  },

  'data-science': {
    ru: {
      name: 'Data Science',
      description: 'Наука о данных',
      detailedDescription: 'Анализ данных, статистика, визуализация. pandas, NumPy, matplotlib.',
      prerequisites: 'Python',
      outcomes: 'Анализ больших данных'
    },
    kk: {
      name: 'Data Science',
      description: 'Деректер туралы ғылым',
      detailedDescription: 'Деректерді талдау, статистика, визуализация. pandas, NumPy, matplotlib.',
      prerequisites: 'Python',
      outcomes: 'Үлкен деректерді талдау'
    },
    en: {
      name: 'Data Science',
      description: 'Science of data',
      detailedDescription: 'Data analysis, statistics, visualization. pandas, NumPy, matplotlib.',
      prerequisites: 'Python',
      outcomes: 'Big data analysis'
    }
  },

  react: {
    ru: {
      name: 'React',
      description: 'Современный фронтенд',
      detailedDescription: 'Библиотека для создания пользовательских интерфейсов. Компоненты, hooks, состояние.',
      prerequisites: 'JavaScript',
      outcomes: 'Современные веб-интерфейсы'
    },
    kk: {
      name: 'React',
      description: 'Заманауи фронтенд',
      detailedDescription: 'Пайдаланушы интерфейстерін жасауға арналған кітапхана. Компоненттер, hooks, күй.',
      prerequisites: 'JavaScript',
      outcomes: 'Заманауи веб-интерфейстер'
    },
    en: {
      name: 'React',
      description: 'Modern frontend',
      detailedDescription: 'Library for building user interfaces. Components, hooks, state management.',
      prerequisites: 'JavaScript',
      outcomes: 'Modern web interfaces'
    }
  },

  nodejs: {
    ru: {
      name: 'Node.js',
      description: 'JavaScript на сервере',
      detailedDescription: 'Серверная разработка на JavaScript. Express, API, базы данных.',
      prerequisites: 'JavaScript',
      outcomes: 'Backend на JavaScript'
    },
    kk: {
      name: 'Node.js',
      description: 'Серверде JavaScript',
      detailedDescription: 'JavaScript-те серверлік әзірлеу. Express, API, дерекқорлар.',
      prerequisites: 'JavaScript',
      outcomes: 'JavaScript-те Backend'
    },
    en: {
      name: 'Node.js',
      description: 'JavaScript on server',
      detailedDescription: 'Server-side development in JavaScript. Express, API, databases.',
      prerequisites: 'JavaScript',
      outcomes: 'Backend in JavaScript'
    }
  },

  ml: {
    ru: {
      name: 'Machine Learning',
      description: 'Машинное обучение',
      detailedDescription: 'TensorFlow, PyTorch, scikit-learn. Нейронные сети, обработка данных, предсказательные модели.',
      prerequisites: 'Data Science',
      outcomes: 'ML модели и AI'
    },
    kk: {
      name: 'Machine Learning',
      description: 'Машиналық оқыту',
      detailedDescription: 'TensorFlow, PyTorch, scikit-learn. Нейрондық желілер, деректерді өңдеу, болжамды модельдер.',
      prerequisites: 'Data Science',
      outcomes: 'ML үлгілері және AI'
    },
    en: {
      name: 'Machine Learning',
      description: 'ML and AI',
      detailedDescription: 'TensorFlow, PyTorch, scikit-learn. Neural networks, data processing, predictive models.',
      prerequisites: 'Data Science',
      outcomes: 'ML models and AI'
    }
  },

  fullstack: {
    ru: {
      name: 'Full-Stack',
      description: 'Комплексная разработка',
      detailedDescription: 'Frontend + Backend + DevOps. Полноценные приложения от начала до конца.',
      prerequisites: 'React + Node.js',
      outcomes: 'Полный цикл разработки'
    },
    kk: {
      name: 'Full-Stack',
      description: 'Кешенді әзірлеу',
      detailedDescription: 'Frontend + Backend + DevOps. Басынан аяғына дейін толық қосымшалар.',
      prerequisites: 'React + Node.js',
      outcomes: 'Әзірлеудің толық циклі'
    },
    en: {
      name: 'Full-Stack',
      description: 'Complete development',
      detailedDescription: 'Frontend + Backend + DevOps. Full applications from start to finish.',
      prerequisites: 'React + Node.js',
      outcomes: 'Full development cycle'
    }
  },

  // ========== MATHEMATICS (9 навыков) ==========
  arithmetic: {
    ru: {
      name: 'Арифметика',
      description: 'Основы математики',
      detailedDescription: 'Числа, операции, дроби, проценты. Фундамент всей математики.',
      prerequisites: 'Старт',
      outcomes: 'Математическое мышление'
    },
    kk: {
      name: 'Арифметика',
      description: 'Математика негіздері',
      detailedDescription: 'Сандар, операциялар, бөлшектер, пайыздар. Барлық математиканың іргетасы.',
      prerequisites: 'Бастау',
      outcomes: 'Математикалық ойлау'
    },
    en: {
      name: 'Arithmetic',
      description: 'Math fundamentals',
      detailedDescription: 'Numbers, operations, fractions, percentages. Foundation of all mathematics.',
      prerequisites: 'Start',
      outcomes: 'Mathematical thinking'
    }
  },

  algebra: {
    ru: {
      name: 'Алгебра',
      description: 'Работа с символами',
      detailedDescription: 'Уравнения, неравенства, функции, преобразования. Абстрактное мышление.',
      prerequisites: 'Арифметика',
      outcomes: 'Решение уравнений'
    },
    kk: {
      name: 'Алгебра',
      description: 'Символдармен жұмыс',
      detailedDescription: 'Теңдеулер, теңсіздіктер, функциялар, түрлендірулер. Абстрактілі ойлау.',
      prerequisites: 'Арифметика',
      outcomes: 'Теңдеулерді шешу'
    },
    en: {
      name: 'Algebra',
      description: 'Working with symbols',
      detailedDescription: 'Equations, inequalities, functions, transformations. Abstract thinking.',
      prerequisites: 'Arithmetic',
      outcomes: 'Solving equations'
    }
  },

  geometry: {
    ru: {
      name: 'Геометрия',
      description: 'Наука о фигурах',
      detailedDescription: 'Точки, прямые, углы, треугольники, окружности. Пространственное мышление.',
      prerequisites: 'Арифметика',
      outcomes: 'Геометрические доказательства'
    },
    kk: {
      name: 'Геометрия',
      description: 'Фигуралар туралы ғылым',
      detailedDescription: 'Нүктелер, түзулер, бұрыштар, үшбұрыштар, шеңберлер. Кеңістіктік ойлау.',
      prerequisites: 'Арифметика',
      outcomes: 'Геометриялық дәлелдемелер'
    },
    en: {
      name: 'Geometry',
      description: 'Science of shapes',
      detailedDescription: 'Points, lines, angles, triangles, circles. Spatial thinking.',
      prerequisites: 'Arithmetic',
      outcomes: 'Geometric proofs'
    }
  },

  'linear-algebra': {
    ru: {
      name: 'Линейная алгебра',
      description: 'Векторы и матрицы',
      detailedDescription: 'Системы уравнений, векторные пространства, собственные значения.',
      prerequisites: 'Алгебра',
      outcomes: 'Работа с матрицами'
    },
    kk: {
      name: 'Сызықтық алгебра',
      description: 'Векторлар мен матрицалар',
      detailedDescription: 'Теңдеулер жүйесі, векторлық кеңістіктер, меншікті мәндер.',
      prerequisites: 'Алгебра',
      outcomes: 'Матрицалармен жұмыс'
    },
    en: {
      name: 'Linear Algebra',
      description: 'Vectors and matrices',
      detailedDescription: 'Systems of equations, vector spaces, eigenvalues.',
      prerequisites: 'Algebra',
      outcomes: 'Working with matrices'
    }
  },

  calculus: {
    ru: {
      name: 'Математический анализ',
      description: 'Пределы и производные',
      detailedDescription: 'Дифференциальное и интегральное исчисление, пределы, ряды.',
      prerequisites: 'Алгебра',
      outcomes: 'Анализ функций'
    },
    kk: {
      name: 'Математикалық талдау',
      description: 'Шектер мен туындылар',
      detailedDescription: 'Дифференциалдық және интегралдық есептеулер, шектер, қатарлар.',
      prerequisites: 'Алгебра',
      outcomes: 'Функцияларды талдау'
    },
    en: {
      name: 'Calculus',
      description: 'Limits and derivatives',
      detailedDescription: 'Differential and integral calculus, limits, series.',
      prerequisites: 'Algebra',
      outcomes: 'Function analysis'
    }
  },

  trig: {
    ru: {
      name: 'Тригонометрия',
      description: 'Углы и треугольники',
      detailedDescription: 'Синус, косинус, тангенс. Тригонометрические функции и уравнения.',
      prerequisites: 'Геометрия',
      outcomes: 'Решение тригонометрических задач'
    },
    kk: {
      name: 'Тригонометрия',
      description: 'Бұрыштар мен үшбұрыштар',
      detailedDescription: 'Синус, косинус, тангенс. Тригонометриялық функциялар мен теңдеулер.',
      prerequisites: 'Геометрия',
      outcomes: 'Тригонометриялық есептерді шешу'
    },
    en: {
      name: 'Trigonometry',
      description: 'Angles and triangles',
      detailedDescription: 'Sine, cosine, tangent. Trigonometric functions and equations.',
      prerequisites: 'Geometry',
      outcomes: 'Solving trigonometric problems'
    }
  },

  'analytic-geo': {
    ru: {
      name: 'Аналитическая геометрия',
      description: 'Геометрия через алгебру',
      detailedDescription: 'Координаты, прямые, кривые, конические сечения.',
      prerequisites: 'Геометрия + Алгебра',
      outcomes: 'Аналитические методы'
    },
    kk: {
      name: 'Аналитикалық геометрия',
      description: 'Алгебра арқылы геометрия',
      detailedDescription: 'Координаталар, түзулер, қисықтар, конустық қималар.',
      prerequisites: 'Геометрия + Алгебра',
      outcomes: 'Аналитикалық әдістер'
    },
    en: {
      name: 'Analytic Geometry',
      description: 'Geometry through algebra',
      detailedDescription: 'Coordinates, lines, curves, conic sections.',
      prerequisites: 'Geometry + Algebra',
      outcomes: 'Analytical methods'
    }
  },

  'advanced-math': {
    ru: {
      name: 'Высшая математика',
      description: 'Продвинутая математика',
      detailedDescription: 'Комплексные числа, ряды, дифференциальные уравнения, топология.',
      prerequisites: 'Математический анализ',
      outcomes: 'Глубокое понимание математики'
    },
    kk: {
      name: 'Жоғары математика',
      description: 'Қосымша математика',
      detailedDescription: 'Комплекс сандар, қатарлар, дифференциалдық теңдеулер, топология.',
      prerequisites: 'Математикалық талдау',
      outcomes: 'Математиканы терең түсіну'
    },
    en: {
      name: 'Higher Mathematics',
      description: 'Advanced mathematics',
      detailedDescription: 'Complex numbers, series, differential equations, topology.',
      prerequisites: 'Calculus',
      outcomes: 'Deep understanding of mathematics'
    }
  },

  // ========== LANGUAGES (8 навыков) ==========
  english: {
    ru: {
      name: 'Английский (базовый)',
      description: 'Основы английского',
      detailedDescription: 'Грамматика, лексика, чтение, письмо. Уровни A1-B1.',
      prerequisites: 'Основы языков',
      outcomes: 'Базовое общение на английском'
    },
    kk: {
      name: 'Ағылшын (базалық)',
      description: 'Ағылшынның негіздері',
      detailedDescription: 'Грамматика, лексика, оқу, жазу. A1-B1 деңгейлері.',
      prerequisites: 'Тілдердің негіздері',
      outcomes: 'Ағылшын тілінде базалық қарым-қатынас'
    },
    en: {
      name: 'English (Basic)',
      description: 'English fundamentals',
      detailedDescription: 'Grammar, vocabulary, reading, writing. Levels A1-B1.',
      prerequisites: 'Language basics',
      outcomes: 'Basic English communication'
    }
  },

  chinese: {
    ru: {
      name: 'Китайский (базовый)',
      description: 'Основы китайского',
      detailedDescription: 'Иероглифы, пиньинь, базовая грамматика. HSK 1-3.',
      prerequisites: 'Основы языков',
      outcomes: 'Базовое общение на китайском'
    },
    kk: {
      name: 'Қытай (базалық)',
      description: 'Қытайдың негіздері',
      detailedDescription: 'Иероглифтер, пиньинь, базалық грамматика. HSK 1-3.',
      prerequisites: 'Тілдердің негіздері',
      outcomes: 'Қытай тілінде базалық қарым-қатынас'
    },
    en: {
      name: 'Chinese (Basic)',
      description: 'Chinese fundamentals',
      detailedDescription: 'Characters, pinyin, basic grammar. HSK 1-3.',
      prerequisites: 'Language basics',
      outcomes: 'Basic Chinese communication'
    }
  },

  'english-advanced': {
    ru: {
      name: 'Английский (продвинутый)',
      description: 'Продвинутый английский',
      detailedDescription: 'Свободное владение, академический английский, бизнес-коммуникация. B2-C1.',
      prerequisites: 'Английский базовый',
      outcomes: 'Свободное владение английским'
    },
    kk: {
      name: 'Ағылшын (қосымша)',
      description: 'Қосымша ағылшын',
      detailedDescription: 'Еркін меңгеру, академиялық ағылшын, бизнес-коммуникация. B2-C1.',
      prerequisites: 'Базалық ағылшын',
      outcomes: 'Ағылшын тілін еркін меңгеру'
    },
    en: {
      name: 'English (Advanced)',
      description: 'Advanced English',
      detailedDescription: 'Fluent proficiency, academic English, business communication. B2-C1.',
      prerequisites: 'Basic English',
      outcomes: 'Fluent English proficiency'
    }
  },

  ielts: {
    ru: {
      name: 'Подготовка к IELTS',
      description: 'IELTS экзамен',
      detailedDescription: 'Подготовка к международному экзамену IELTS. Все 4 модуля: Listening, Reading, Writing, Speaking.',
      prerequisites: 'Английский базовый',
      outcomes: 'Высокий балл IELTS'
    },
    kk: {
      name: 'IELTS-қа дайындық',
      description: 'IELTS емтиханы',
      detailedDescription: 'IELTS халықаралық емтиханына дайындық. Барлық 4 модуль: Listening, Reading, Writing, Speaking.',
      prerequisites: 'Базалық ағылшын',
      outcomes: 'IELTS-тің жоғары балы'
    },
    en: {
      name: 'IELTS Preparation',
      description: 'IELTS exam',
      detailedDescription: 'Preparation for IELTS international exam. All 4 modules: Listening, Reading, Writing, Speaking.',
      prerequisites: 'Basic English',
      outcomes: 'High IELTS score'
    }
  },

  'chinese-advanced': {
    ru: {
      name: 'Китайский (продвинутый)',
      description: 'Продвинутый китайский',
      detailedDescription: 'Свободное владение, чтение литературы, деловой китайский. HSK 4-6.',
      prerequisites: 'Китайский базовый',
      outcomes: 'Свободное владение китайским'
    },
    kk: {
      name: 'Қытай (қосымша)',
      description: 'Қосымша қытай',
      detailedDescription: 'Еркін меңгеру, әдебиетті оқу, іскерлік қытай. HSK 4-6.',
      prerequisites: 'Базалық қытай',
      outcomes: 'Қытай тілін еркін меңгеру'
    },
    en: {
      name: 'Chinese (Advanced)',
      description: 'Advanced Chinese',
      detailedDescription: 'Fluent proficiency, reading literature, business Chinese. HSK 4-6.',
      prerequisites: 'Basic Chinese',
      outcomes: 'Fluent Chinese proficiency'
    }
  },

  spanish: {
    ru: {
      name: 'Испанский (A1-B2)',
      description: 'Испанский язык',
      detailedDescription: 'Грамматика, лексика, разговорная практика. От начального до среднего уровня.',
      prerequisites: 'Основы языков',
      outcomes: 'Общение на испанском'
    },
    kk: {
      name: 'Испан (A1-B2)',
      description: 'Испан тілі',
      detailedDescription: 'Грамматика, лексика, сөйлесу тәжірибесі. Бастауыш деңгейден орташаға дейін.',
      prerequisites: 'Тілдердің негіздері',
      outcomes: 'Испан тілінде қарым-қатынас'
    },
    en: {
      name: 'Spanish (A1-B2)',
      description: 'Spanish language',
      detailedDescription: 'Grammar, vocabulary, conversational practice. From beginner to intermediate level.',
      prerequisites: 'Language basics',
      outcomes: 'Spanish communication'
    }
  },

  polyglot: {
    ru: {
      name: 'Полиглот',
      description: 'Мастер языков',
      detailedDescription: 'Владение 3+ языками на высоком уровне. Межкультурная коммуникация.',
      prerequisites: 'Продвинутые языки',
      outcomes: 'Многоязычность'
    },
    kk: {
      name: 'Полиглот',
      description: 'Тілдер шебері',
      detailedDescription: '3+ тілді жоғары деңгейде меңгеру. Мәдениетаралық коммуникация.',
      prerequisites: 'Қосымша тілдер',
      outcomes: 'Көптілділік'
    },
    en: {
      name: 'Polyglot',
      description: 'Master of languages',
      detailedDescription: 'Proficiency in 3+ languages at high level. Intercultural communication.',
      prerequisites: 'Advanced languages',
      outcomes: 'Multilingualism'
    }
  },

  // ========== DESIGN (9 навыков) ==========
  graphic: {
    ru: {
      name: 'Графический дизайн',
      description: 'Визуальная коммуникация',
      detailedDescription: 'Типографика, композиция, цвет, макетирование. Принципы дизайна.',
      prerequisites: 'Основы дизайна',
      outcomes: 'Создание графики'
    },
    kk: {
      name: 'Графикалық дизайн',
      description: 'Визуалды коммуникация',
      detailedDescription: 'Типографика, композиция, түс, макеттеу. Дизайн принциптері.',
      prerequisites: 'Дизайн негіздері',
      outcomes: 'Графика жасау'
    },
    en: {
      name: 'Graphic Design',
      description: 'Visual communication',
      detailedDescription: 'Typography, composition, color, layout. Design principles.',
      prerequisites: 'Design basics',
      outcomes: 'Creating graphics'
    }
  },

  'ui-ux': {
    ru: {
      name: 'UI/UX Дизайн',
      description: 'Дизайн интерфейсов',
      detailedDescription: 'Пользовательский опыт, интерфейсы, юзабилити, прототипирование.',
      prerequisites: 'Основы дизайна',
      outcomes: 'Дизайн приложений'
    },
    kk: {
      name: 'UI/UX Дизайн',
      description: 'Интерфейс дизайны',
      detailedDescription: 'Пайдаланушы тәжірибесі, интерфейстер, юзабилити, прототиптеу.',
      prerequisites: 'Дизайн негіздері',
      outcomes: 'Қосымшалар дизайны'
    },
    en: {
      name: 'UI/UX Design',
      description: 'Interface design',
      detailedDescription: 'User experience, interfaces, usability, prototyping.',
      prerequisites: 'Design basics',
      outcomes: 'App design'
    }
  },

  adobe: {
    ru: {
      name: 'Adobe Suite',
      description: 'Инструменты Adobe',
      detailedDescription: 'Photoshop, Illustrator, InDesign. Профессиональные инструменты дизайна.',
      prerequisites: 'Графический дизайн',
      outcomes: 'Владение Adobe'
    },
    kk: {
      name: 'Adobe Suite',
      description: 'Adobe құралдары',
      detailedDescription: 'Photoshop, Illustrator, InDesign. Кәсіби дизайн құралдары.',
      prerequisites: 'Графикалық дизайн',
      outcomes: 'Adobe-ны меңгеру'
    },
    en: {
      name: 'Adobe Suite',
      description: 'Adobe tools',
      detailedDescription: 'Photoshop, Illustrator, InDesign. Professional design tools.',
      prerequisites: 'Graphic design',
      outcomes: 'Adobe mastery'
    }
  },

  branding: {
    ru: {
      name: 'Брендинг',
      description: 'Создание брендов',
      detailedDescription: 'Айдентика, логотипы, фирменный стиль, brand book.',
      prerequisites: 'Графический дизайн',
      outcomes: 'Разработка брендов'
    },
    kk: {
      name: 'Брендинг',
      description: 'Брендтерді жасау',
      detailedDescription: 'Айдентика, логотиптер, корпоративтік стиль, brand book.',
      prerequisites: 'Графикалық дизайн',
      outcomes: 'Брендтерді әзірлеу'
    },
    en: {
      name: 'Branding',
      description: 'Creating brands',
      detailedDescription: 'Identity, logos, corporate style, brand book.',
      prerequisites: 'Graphic design',
      outcomes: 'Brand development'
    }
  },

  figma: {
    ru: {
      name: 'Figma Expert',
      description: 'Мастер Figma',
      detailedDescription: 'Профессиональная работа в Figma. UI дизайн, прототипы, компоненты.',
      prerequisites: 'UI/UX Design',
      outcomes: 'Экспертное владение Figma'
    },
    kk: {
      name: 'Figma Expert',
      description: 'Figma шебері',
      detailedDescription: 'Figma-да кәсіби жұмыс. UI дизайн, прототиптер, компоненттер.',
      prerequisites: 'UI/UX Design',
      outcomes: 'Figma-ны сарапшы деңгейде меңгеру'
    },
    en: {
      name: 'Figma Expert',
      description: 'Figma master',
      detailedDescription: 'Professional work in Figma. UI design, prototypes, components.',
      prerequisites: 'UI/UX Design',
      outcomes: 'Expert Figma proficiency'
    }
  },

  motion: {
    ru: {
      name: 'Motion Design',
      description: 'Анимация и моушн',
      detailedDescription: 'After Effects, анимация интерфейсов, видео-дизайн.',
      prerequisites: 'Adobe Suite',
      outcomes: 'Создание анимации'
    },
    kk: {
      name: 'Motion Design',
      description: 'Анимация және моушн',
      detailedDescription: 'After Effects, интерфейс анимациясы, видео-дизайн.',
      prerequisites: 'Adobe Suite',
      outcomes: 'Анимация жасау'
    },
    en: {
      name: 'Motion Design',
      description: 'Animation and motion',
      detailedDescription: 'After Effects, interface animation, video design.',
      prerequisites: 'Adobe Suite',
      outcomes: 'Creating animation'
    }
  },

  product: {
    ru: {
      name: 'Product Design',
      description: 'Продуктовый дизайн',
      detailedDescription: 'Дизайн цифровых продуктов. От исследований до финального дизайна.',
      prerequisites: 'Figma + UI/UX',
      outcomes: 'Создание продуктов'
    },
    kk: {
      name: 'Product Design',
      description: 'Өнім дизайны',
      detailedDescription: 'Цифрлық өнімдер дизайны. Зерттеуден соңғы дизайнға дейін.',
      prerequisites: 'Figma + UI/UX',
      outcomes: 'Өнімдер жасау'
    },
    en: {
      name: 'Product Design',
      description: 'Product design',
      detailedDescription: 'Design of digital products. From research to final design.',
      prerequisites: 'Figma + UI/UX',
      outcomes: 'Creating products'
    }
  },

  'creative-dir': {
    ru: {
      name: 'Creative Director',
      description: 'Креативный директор',
      detailedDescription: 'Управление креативными проектами, команда, стратегия, видение.',
      prerequisites: 'Product Design + Брендинг',
      outcomes: 'Креативное руководство'
    },
    kk: {
      name: 'Creative Director',
      description: 'Креативті директор',
      detailedDescription: 'Креативті жобаларды басқару, команда, стратегия, көрініс.',
      prerequisites: 'Product Design + Брендинг',
      outcomes: 'Креативті басшылық'
    },
    en: {
      name: 'Creative Director',
      description: 'Creative director',
      detailedDescription: 'Managing creative projects, team, strategy, vision.',
      prerequisites: 'Product Design + Branding',
      outcomes: 'Creative leadership'
    }
  },

  // ========== BUSINESS (11 навыков) ==========
  micro: {
    ru: {
      name: 'Микроэкономика',
      description: 'Экономика рынков',
      detailedDescription: 'Спрос и предложение, рыночное равновесие, поведение потребителей.',
      prerequisites: 'Основы экономики',
      outcomes: 'Понимание рынков'
    },
    kk: {
      name: 'Микроэкономика',
      description: 'Нарықтар экономикасы',
      detailedDescription: 'Сұраныс пен ұсыныс, нарықтық тепе-теңдік, тұтынушылардың мінез-құлқы.',
      prerequisites: 'Экономика негіздері',
      outcomes: 'Нарықтарды түсіну'
    },
    en: {
      name: 'Microeconomics',
      description: 'Market economics',
      detailedDescription: 'Supply and demand, market equilibrium, consumer behavior.',
      prerequisites: 'Economics basics',
      outcomes: 'Understanding markets'
    }
  },

  finance: {
    ru: {
      name: 'Финансы',
      description: 'Финансовая грамотность',
      detailedDescription: 'Деньги, кредиты, инвестиции, финансовые инструменты.',
      prerequisites: 'Основы экономики',
      outcomes: 'Финансовое планирование'
    },
    kk: {
      name: 'Қаржы',
      description: 'Қаржылық сауаттылық',
      detailedDescription: 'Ақша, несиелер, инвестициялар, қаржылық құралдар.',
      prerequisites: 'Экономика негіздері',
      outcomes: 'Қаржылық жоспарлау'
    },
    en: {
      name: 'Finance',
      description: 'Financial literacy',
      detailedDescription: 'Money, loans, investments, financial instruments.',
      prerequisites: 'Economics basics',
      outcomes: 'Financial planning'
    }
  },

  marketing: {
    ru: {
      name: 'Маркетинг',
      description: 'Продвижение продуктов',
      detailedDescription: '4P, целевая аудитория, позиционирование, digital-маркетинг.',
      prerequisites: 'Микроэкономика',
      outcomes: 'Маркетинговые стратегии'
    },
    kk: {
      name: 'Маркетинг',
      description: 'Өнімдерді жылжыту',
      detailedDescription: '4P, мақсатты аудитория, позициялау, digital-маркетинг.',
      prerequisites: 'Микроэкономика',
      outcomes: 'Маркетингтік стратегиялар'
    },
    en: {
      name: 'Marketing',
      description: 'Product promotion',
      detailedDescription: '4P, target audience, positioning, digital marketing.',
      prerequisites: 'Microeconomics',
      outcomes: 'Marketing strategies'
    }
  },

  macro: {
    ru: {
      name: 'Макроэкономика',
      description: 'Экономика стран',
      detailedDescription: 'ВВП, инфляция, безработица, денежная политика.',
      prerequisites: 'Микроэкономика',
      outcomes: 'Понимание экономики'
    },
    kk: {
      name: 'Макроэкономика',
      description: 'Елдер экономикасы',
      detailedDescription: 'ЖІӨ, инфляция, жұмыссыздық, ақша-несие саясаты.',
      prerequisites: 'Микроэкономика',
      outcomes: 'Экономиканы түсіну'
    },
    en: {
      name: 'Macroeconomics',
      description: 'National economics',
      detailedDescription: 'GDP, inflation, unemployment, monetary policy.',
      prerequisites: 'Microeconomics',
      outcomes: 'Understanding economy'
    }
  },

  accounting: {
    ru: {
      name: 'Бухгалтерский учет',
      description: 'Учет и отчетность',
      detailedDescription: 'Баланс, P&L, финансовая отчетность, налоги.',
      prerequisites: 'Финансы',
      outcomes: 'Ведение учета'
    },
    kk: {
      name: 'Бухгалтерлік есеп',
      description: 'Есеп және есептілік',
      detailedDescription: 'Баланс, P&L, қаржылық есептілік, салықтар.',
      prerequisites: 'Қаржы',
      outcomes: 'Есепті жүргізу'
    },
    en: {
      name: 'Accounting',
      description: 'Accounting and reporting',
      detailedDescription: 'Balance sheet, P&L, financial reporting, taxes.',
      prerequisites: 'Finance',
      outcomes: 'Maintaining records'
    }
  },

  investment: {
    ru: {
      name: 'Инвестиции',
      description: 'Управление капиталом',
      detailedDescription: 'Акции, облигации, портфель, риск-менеджмент.',
      prerequisites: 'Финансы',
      outcomes: 'Инвестиционные решения'
    },
    kk: {
      name: 'Инвестициялар',
      description: 'Капиталды басқару',
      detailedDescription: 'Акциялар, облигациялар, портфель, тәуекелдерді басқару.',
      prerequisites: 'Қаржы',
      outcomes: 'Инвестициялық шешімдер'
    },
    en: {
      name: 'Investments',
      description: 'Capital management',
      detailedDescription: 'Stocks, bonds, portfolio, risk management.',
      prerequisites: 'Finance',
      outcomes: 'Investment decisions'
    }
  },

  startup: {
    ru: {
      name: 'Стартап',
      description: 'Создание стартапа',
      detailedDescription: 'Идея, MVP, привлечение инвестиций, масштабирование.',
      prerequisites: 'Маркетинг',
      outcomes: 'Запуск стартапа'
    },
    kk: {
      name: 'Стартап',
      description: 'Стартапты жасау',
      detailedDescription: 'Идея, MVP, инвестицияларды тарту, масштабтау.',
      prerequisites: 'Маркетинг',
      outcomes: 'Стартапты іске қосу'
    },
    en: {
      name: 'Startup',
      description: 'Creating a startup',
      detailedDescription: 'Idea, MVP, fundraising, scaling.',
      prerequisites: 'Marketing',
      outcomes: 'Launching startup'
    }
  },

  policy: {
    ru: {
      name: 'Экономическая политика',
      description: 'Политика и экономика',
      detailedDescription: 'Государственное регулирование, фискальная политика, международная торговля.',
      prerequisites: 'Макроэкономика',
      outcomes: 'Понимание политики'
    },
    kk: {
      name: 'Экономикалық саясат',
      description: 'Саясат және экономика',
      detailedDescription: 'Мемлекеттік реттеу, фискалдық саясат, халықаралық сауда.',
      prerequisites: 'Макроэкономика',
      outcomes: 'Саясатты түсіну'
    },
    en: {
      name: 'Economic Policy',
      description: 'Policy and economics',
      detailedDescription: 'Government regulation, fiscal policy, international trade.',
      prerequisites: 'Macroeconomics',
      outcomes: 'Understanding policy'
    }
  },

  cfo: {
    ru: {
      name: 'CFO Skills',
      description: 'Финансовый директор',
      detailedDescription: 'Финансовое управление компанией, стратегия, бюджетирование.',
      prerequisites: 'Бухучет + Инвестиции',
      outcomes: 'Управление финансами'
    },
    kk: {
      name: 'CFO Skills',
      description: 'Қаржы директоры',
      detailedDescription: 'Компанияны қаржылық басқару, стратегия, бюджеттеу.',
      prerequisites: 'Бухесеп + Инвестициялар',
      outcomes: 'Қаржыны басқару'
    },
    en: {
      name: 'CFO Skills',
      description: 'Chief Financial Officer',
      detailedDescription: 'Company financial management, strategy, budgeting.',
      prerequisites: 'Accounting + Investments',
      outcomes: 'Financial management'
    }
  },

  ceo: {
    ru: {
      name: 'CEO/Entrepreneur',
      description: 'Предприниматель',
      detailedDescription: 'Управление компанией, лидерство, стратегия, принятие решений.',
      prerequisites: 'Все бизнес навыки',
      outcomes: 'Управление бизнесом'
    },
    kk: {
      name: 'CEO/Entrepreneur',
      description: 'Кәсіпкер',
      detailedDescription: 'Компанияны басқару, көшбасшылық, стратегия, шешімдер қабылдау.',
      prerequisites: 'Барлық бизнес дағдылары',
      outcomes: 'Бизнесті басқару'
    },
    en: {
      name: 'CEO/Entrepreneur',
      description: 'Entrepreneur',
      detailedDescription: 'Company management, leadership, strategy, decision making.',
      prerequisites: 'All business skills',
      outcomes: 'Business management'
    }
  },

  // ========== SCIENCE (10 навыков) ==========
  physics: {
    ru: {
      name: 'Физика',
      description: 'Законы природы',
      detailedDescription: 'Механика, термодинамика, электричество, оптика, колебания и волны.',
      prerequisites: 'Научный метод',
      outcomes: 'Понимание физических процессов'
    },
    kk: {
      name: 'Физика',
      description: 'Табиғат заңдары',
      detailedDescription: 'Механика, термодинамика, электр, оптика, тербелістер мен толқындар.',
      prerequisites: 'Ғылыми әдіс',
      outcomes: 'Физикалық процестерді түсіну'
    },
    en: {
      name: 'Physics',
      description: 'Laws of nature',
      detailedDescription: 'Mechanics, thermodynamics, electricity, optics, oscillations and waves.',
      prerequisites: 'Scientific method',
      outcomes: 'Understanding physical processes'
    }
  },

  chemistry: {
    ru: {
      name: 'Химия',
      description: 'Наука о веществах',
      detailedDescription: 'Атомы, молекулы, реакции, периодическая система, химические связи.',
      prerequisites: 'Научный метод',
      outcomes: 'Понимание химии'
    },
    kk: {
      name: 'Химия',
      description: 'Заттар туралы ғылым',
      detailedDescription: 'Атомдар, молекулалар, реакциялар, периодтық жүйе, химиялық байланыстар.',
      prerequisites: 'Ғылыми әдіс',
      outcomes: 'Химияны түсіну'
    },
    en: {
      name: 'Chemistry',
      description: 'Science of substances',
      detailedDescription: 'Atoms, molecules, reactions, periodic table, chemical bonds.',
      prerequisites: 'Scientific method',
      outcomes: 'Understanding chemistry'
    }
  },

  biology: {
    ru: {
      name: 'Биология',
      description: 'Наука о жизни',
      detailedDescription: 'Клетки, ткани, органы, эволюция, экология, фотосинтез.',
      prerequisites: 'Научный метод',
      outcomes: 'Понимание живых систем'
    },
    kk: {
      name: 'Биология',
      description: 'Өмір туралы ғылым',
      detailedDescription: 'Жасушалар, тіндер, мүшелер, эволюция, экология, фотосинтез.',
      prerequisites: 'Ғылыми әдіс',
      outcomes: 'Тірі жүйелерді түсіну'
    },
    en: {
      name: 'Biology',
      description: 'Science of life',
      detailedDescription: 'Cells, tissues, organs, evolution, ecology, photosynthesis.',
      prerequisites: 'Scientific method',
      outcomes: 'Understanding living systems'
    }
  },

  mechanics: {
    ru: {
      name: 'Классическая механика',
      description: 'Законы движения',
      detailedDescription: 'Ньютоновская механика, динамика, статика, законы сохранения.',
      prerequisites: 'Физика',
      outcomes: 'Решение сложных задач'
    },
    kk: {
      name: 'Классикалық механика',
      description: 'Қозғалыс заңдары',
      detailedDescription: 'Ньютон механикасы, динамика, статика, сақталу заңдары.',
      prerequisites: 'Физика',
      outcomes: 'Күрделі есептерді шешу'
    },
    en: {
      name: 'Classical Mechanics',
      description: 'Laws of motion',
      detailedDescription: 'Newtonian mechanics, dynamics, statics, conservation laws.',
      prerequisites: 'Physics',
      outcomes: 'Solving complex problems'
    }
  },

  quantum: {
    ru: {
      name: 'Квантовая физика',
      description: 'Мир частиц',
      detailedDescription: 'Квантовая механика, принцип неопределенности, волновая функция.',
      prerequisites: 'Физика',
      outcomes: 'Понимание микромира'
    },
    kk: {
      name: 'Кванттық физика',
      description: 'Бөлшектер әлемі',
      detailedDescription: 'Кванттық механика, белгісіздік принципі, толқындық функция.',
      prerequisites: 'Физика',
      outcomes: 'Микроәлемді түсіну'
    },
    en: {
      name: 'Quantum Physics',
      description: 'World of particles',
      detailedDescription: 'Quantum mechanics, uncertainty principle, wave function.',
      prerequisites: 'Physics',
      outcomes: 'Understanding microworld'
    }
  },

  organic: {
    ru: {
      name: 'Органическая химия',
      description: 'Химия углерода',
      detailedDescription: 'Углеводороды, функциональные группы, реакции органических веществ.',
      prerequisites: 'Химия',
      outcomes: 'Синтез органики'
    },
    kk: {
      name: 'Органикалық химия',
      description: 'Көміртек химиясы',
      detailedDescription: 'Көмірсутектер, функционалдық топтар, органикалық заттардың реакциялары.',
      prerequisites: 'Химия',
      outcomes: 'Органиканы синтездеу'
    },
    en: {
      name: 'Organic Chemistry',
      description: 'Chemistry of carbon',
      detailedDescription: 'Hydrocarbons, functional groups, reactions of organic compounds.',
      prerequisites: 'Chemistry',
      outcomes: 'Organic synthesis'
    }
  },

  genetics: {
    ru: {
      name: 'Генетика',
      description: 'ДНК и наследственность',
      detailedDescription: 'Гены, мутации, наследование признаков, генная инженерия.',
      prerequisites: 'Биология',
      outcomes: 'Понимание генетики'
    },
    kk: {
      name: 'Генетика',
      description: 'ДНҚ және тұқым қуалаушылық',
      detailedDescription: 'Гендер, мутациялар, белгілердің тұқым қуалауы, гендік инженерия.',
      prerequisites: 'Биология',
      outcomes: 'Генетиканы түсіну'
    },
    en: {
      name: 'Genetics',
      description: 'DNA and heredity',
      detailedDescription: 'Genes, mutations, trait inheritance, genetic engineering.',
      prerequisites: 'Biology',
      outcomes: 'Understanding genetics'
    }
  },

  biochem: {
    ru: {
      name: 'Биохимия',
      description: 'Химия живых систем',
      detailedDescription: 'Белки, ферменты, метаболизм, биоэнергетика.',
      prerequisites: 'Биология + Химия',
      outcomes: 'Молекулярная биология'
    },
    kk: {
      name: 'Биохимия',
      description: 'Тірі жүйелердің химиясы',
      detailedDescription: 'Ақуыздар, ферменттер, метаболизм, биоэнергетика.',
      prerequisites: 'Биология + Химия',
      outcomes: 'Молекулалық биология'
    },
    en: {
      name: 'Biochemistry',
      description: 'Chemistry of living systems',
      detailedDescription: 'Proteins, enzymes, metabolism, bioenergetics.',
      prerequisites: 'Biology + Chemistry',
      outcomes: 'Molecular biology'
    }
  },

  research: {
    ru: {
      name: 'Научные исследования',
      description: 'Передний край науки',
      detailedDescription: 'Работа в лаборатории, публикации, гранты, конференции.',
      prerequisites: 'Продвинутая физика',
      outcomes: 'Научная карьера'
    },
    kk: {
      name: 'Ғылыми зерттеулер',
      description: 'Ғылымның алдыңғы қатары',
      detailedDescription: 'Зертханада жұмыс, жарияланымдар, гранттар, конференциялар.',
      prerequisites: 'Қосымша физика',
      outcomes: 'Ғылыми мансап'
    },
    en: {
      name: 'Scientific Research',
      description: 'Cutting edge of science',
      detailedDescription: 'Lab work, publications, grants, conferences.',
      prerequisites: 'Advanced physics',
      outcomes: 'Scientific career'
    }
  },

  biotech: {
    ru: {
      name: 'Биотехнологии',
      description: 'Прикладная биология',
      detailedDescription: 'CRISPR, клонирование, биопроизводство, медицинские технологии.',
      prerequisites: 'Генетика + Биохимия',
      outcomes: 'Биотех инновации'
    },
    kk: {
      name: 'Биотехнологиялар',
      description: 'Қолданбалы биология',
      detailedDescription: 'CRISPR, клондау, биоөндіріс, медициналық технологиялар.',
      prerequisites: 'Генетика + Биохимия',
      outcomes: 'Биотех инновациялар'
    },
    en: {
      name: 'Biotechnology',
      description: 'Applied biology',
      detailedDescription: 'CRISPR, cloning, bioproduction, medical technologies.',
      prerequisites: 'Genetics + Biochemistry',
      outcomes: 'Biotech innovations'
    }
  },

  // ========== ENGINEERING (10 навыков) ==========
  mechanical: {
    ru: {
      name: 'Механика',
      description: 'Механические системы',
      detailedDescription: 'Детали машин, механизмы, кинематика, динамика.',
      prerequisites: 'Инженерное мышление',
      outcomes: 'Проектирование механизмов'
    },
    kk: {
      name: 'Механика',
      description: 'Механикалық жүйелер',
      detailedDescription: 'Машина бөлшектері, механизмдер, кинематика, динамика.',
      prerequisites: 'Инженерлік ойлау',
      outcomes: 'Механизмдерді жобалау'
    },
    en: {
      name: 'Mechanics',
      description: 'Mechanical systems',
      detailedDescription: 'Machine parts, mechanisms, kinematics, dynamics.',
      prerequisites: 'Engineering thinking',
      outcomes: 'Designing mechanisms'
    }
  },

  electrical: {
    ru: {
      name: 'Электротехника',
      description: 'Электрические системы',
      detailedDescription: 'Цепи, трансформаторы, двигатели, электропривод.',
      prerequisites: 'Инженерное мышление',
      outcomes: 'Работа с электричеством'
    },
    kk: {
      name: 'Электротехника',
      description: 'Электр жүйелері',
      detailedDescription: 'Тізбектер, трансформаторлар, қозғалтқыштар, электржетек.',
      prerequisites: 'Инженерлік ойлау',
      outcomes: 'Электрмен жұмыс'
    },
    en: {
      name: 'Electrical Engineering',
      description: 'Electrical systems',
      detailedDescription: 'Circuits, transformers, motors, electric drive.',
      prerequisites: 'Engineering thinking',
      outcomes: 'Working with electricity'
    }
  },

  cad: {
    ru: {
      name: 'CAD/CAM',
      description: 'Компьютерное проектирование',
      detailedDescription: 'AutoCAD, SolidWorks, 3D моделирование, чертежи.',
      prerequisites: 'Механика',
      outcomes: 'Цифровое проектирование'
    },
    kk: {
      name: 'CAD/CAM',
      description: 'Компьютерлік жобалау',
      detailedDescription: 'AutoCAD, SolidWorks, 3D модельдеу, сызбалар.',
      prerequisites: 'Механика',
      outcomes: 'Цифрлық жобалау'
    },
    en: {
      name: 'CAD/CAM',
      description: 'Computer-aided design',
      detailedDescription: 'AutoCAD, SolidWorks, 3D modeling, drawings.',
      prerequisites: 'Mechanics',
      outcomes: 'Digital design'
    }
  },

  electronics: {
    ru: {
      name: 'Электроника',
      description: 'Электронные компоненты',
      detailedDescription: 'Транзисторы, микросхемы, платы, схемотехника.',
      prerequisites: 'Электротехника',
      outcomes: 'Разработка электроники'
    },
    kk: {
      name: 'Электроника',
      description: 'Электрондық компоненттер',
      detailedDescription: 'Транзисторлар, микросхемалар, платалар, сызбатехника.',
      prerequisites: 'Электротехника',
      outcomes: 'Электрониканы әзірлеу'
    },
    en: {
      name: 'Electronics',
      description: 'Electronic components',
      detailedDescription: 'Transistors, microchips, boards, circuit design.',
      prerequisites: 'Electrical engineering',
      outcomes: 'Electronics development'
    }
  },

  robotics: {
    ru: {
      name: 'Робототехника',
      description: 'Роботы и автоматика',
      detailedDescription: 'Сенсоры, актуаторы, контроллеры, программирование роботов.',
      prerequisites: 'Механика + Электротехника',
      outcomes: 'Создание роботов'
    },
    kk: {
      name: 'Робототехника',
      description: 'Роботтар және автоматика',
      detailedDescription: 'Сенсорлар, актуаторлар, контроллерлер, роботтарды бағдарламалау.',
      prerequisites: 'Механика + Электротехника',
      outcomes: 'Роботтарды жасау'
    },
    en: {
      name: 'Robotics',
      description: 'Robots and automation',
      detailedDescription: 'Sensors, actuators, controllers, robot programming.',
      prerequisites: 'Mechanics + Electrical',
      outcomes: 'Creating robots'
    }
  },

  embedded: {
    ru: {
      name: 'Встроенные системы',
      description: 'Embedded programming',
      detailedDescription: 'Микроконтроллеры, RTOS, низкоуровневое программирование.',
      prerequisites: 'Электроника',
      outcomes: 'Программирование устройств'
    },
    kk: {
      name: 'Енгізілген жүйелер',
      description: 'Embedded бағдарламалау',
      detailedDescription: 'Микроконтроллерлер, RTOS, төменгі деңгейлі бағдарламалау.',
      prerequisites: 'Электроника',
      outcomes: 'Құрылғыларды бағдарламалау'
    },
    en: {
      name: 'Embedded Systems',
      description: 'Embedded programming',
      detailedDescription: 'Microcontrollers, RTOS, low-level programming.',
      prerequisites: 'Electronics',
      outcomes: 'Device programming'
    }
  },

  manufacturing: {
    ru: {
      name: 'Производство',
      description: 'Производственные процессы',
      detailedDescription: 'Технологии производства, качество, оптимизация процессов.',
      prerequisites: 'CAD/CAM',
      outcomes: 'Управление производством'
    },
    kk: {
      name: 'Өндіріс',
      description: 'Өндірістік процестер',
      detailedDescription: 'Өндіріс технологиялары, сапа, процестерді оңтайландыру.',
      prerequisites: 'CAD/CAM',
      outcomes: 'Өндірісті басқару'
    },
    en: {
      name: 'Manufacturing',
      description: 'Manufacturing processes',
      detailedDescription: 'Production technologies, quality, process optimization.',
      prerequisites: 'CAD/CAM',
      outcomes: 'Production management'
    }
  },

  automation: {
    ru: {
      name: 'Автоматизация',
      description: 'Промышленная автоматика',
      detailedDescription: 'ПЛК, SCADA, промышленные сети, автоматизация производства.',
      prerequisites: 'Робототехника + Производство',
      outcomes: 'Автоматизация систем'
    },
    kk: {
      name: 'Автоматтандыру',
      description: 'Өнеркәсіптік автоматика',
      detailedDescription: 'ПЛК, SCADA, өнеркәсіптік желілер, өндірісті автоматтандыру.',
      prerequisites: 'Робототехника + Өндіріс',
      outcomes: 'Жүйелерді автоматтандыру'
    },
    en: {
      name: 'Automation',
      description: 'Industrial automation',
      detailedDescription: 'PLC, SCADA, industrial networks, production automation.',
      prerequisites: 'Robotics + Manufacturing',
      outcomes: 'Systems automation'
    }
  },

  iot: {
    ru: {
      name: 'Internet of Things',
      description: 'IoT и умные устройства',
      detailedDescription: 'Интернет вещей, облачные платформы, сенсорные сети, IoT безопасность.',
      prerequisites: 'Встроенные системы + Автоматизация',
      outcomes: 'Создание IoT решений'
    },
    kk: {
      name: 'Internet of Things',
      description: 'IoT және ақылды құрылғылар',
      detailedDescription: 'Заттар интернеті, бұлтты платформалар, сенсорлық желілер, IoT қауіпсіздігі.',
      prerequisites: 'Енгізілген жүйелер + Автоматтандыру',
      outcomes: 'IoT шешімдерін жасау'
    },
    en: {
      name: 'Internet of Things',
      description: 'IoT and smart devices',
      detailedDescription: 'Internet of Things, cloud platforms, sensor networks, IoT security.',
      prerequisites: 'Embedded Systems + Automation',
      outcomes: 'Creating IoT solutions'
    }
  },

  // ========== ARTS & CREATIVITY (9 навыков) ==========
  drawing: {
    ru: {
      name: 'Рисование',
      description: 'Основы рисунка',
      detailedDescription: 'Линия, форма, перспектива, светотень, композиция.',
      prerequisites: 'Основы искусства',
      outcomes: 'Навыки рисования'
    },
    kk: {
      name: 'Сурет салу',
      description: 'Сурет негіздері',
      detailedDescription: 'Сызық, пішін, перспектива, көлеңке, композиция.',
      prerequisites: 'Өнер негіздері',
      outcomes: 'Сурет салу дағдылары'
    },
    en: {
      name: 'Drawing',
      description: 'Drawing fundamentals',
      detailedDescription: 'Line, form, perspective, light and shadow, composition.',
      prerequisites: 'Art basics',
      outcomes: 'Drawing skills'
    }
  },

  music: {
    ru: {
      name: 'Музыка',
      description: 'Музыкальные основы',
      detailedDescription: 'Ноты, ритм, гармония, инструменты, слух.',
      prerequisites: 'Основы искусства',
      outcomes: 'Музыкальные навыки'
    },
    kk: {
      name: 'Музыка',
      description: 'Музыкалық негіздер',
      detailedDescription: 'Ноталар, ырғақ, гармония, аспаптар, есту.',
      prerequisites: 'Өнер негіздері',
      outcomes: 'Музыкалық дағдылар'
    },
    en: {
      name: 'Music',
      description: 'Music fundamentals',
      detailedDescription: 'Notes, rhythm, harmony, instruments, ear training.',
      prerequisites: 'Art basics',
      outcomes: 'Musical skills'
    }
  },

  painting: {
    ru: {
      name: 'Живопись',
      description: 'Работа с красками',
      detailedDescription: 'Масло, акрил, акварель. Цвет, смешивание, техники.',
      prerequisites: 'Рисование',
      outcomes: 'Создание картин'
    },
    kk: {
      name: 'Кескіндеме',
      description: 'Бояулармен жұмыс',
      detailedDescription: 'Май, акрил, акварель. Түс, араластыру, техникалар.',
      prerequisites: 'Сурет салу',
      outcomes: 'Картиналар жасау'
    },
    en: {
      name: 'Painting',
      description: 'Working with paints',
      detailedDescription: 'Oil, acrylic, watercolor. Color, mixing, techniques.',
      prerequisites: 'Drawing',
      outcomes: 'Creating paintings'
    }
  },

  'digital-art': {
    ru: {
      name: 'Digital Art',
      description: 'Цифровое искусство',
      detailedDescription: 'Планшет, Photoshop, Procreate. Цифровая живопись и рисунок.',
      prerequisites: 'Рисование',
      outcomes: 'Цифровые работы'
    },
    kk: {
      name: 'Digital Art',
      description: 'Цифрлық өнер',
      detailedDescription: 'Планшет, Photoshop, Procreate. Цифрлық кескіндеме және сурет.',
      prerequisites: 'Сурет салу',
      outcomes: 'Цифрлық жұмыстар'
    },
    en: {
      name: 'Digital Art',
      description: 'Digital art',
      detailedDescription: 'Tablet, Photoshop, Procreate. Digital painting and drawing.',
      prerequisites: 'Drawing',
      outcomes: 'Digital artworks'
    }
  },

  theory: {
    ru: {
      name: 'Теория музыки',
      description: 'Музыкальная теория',
      detailedDescription: 'Гаммы, аккорды, тональности, музыкальный анализ.',
      prerequisites: 'Музыка',
      outcomes: 'Понимание музыки'
    },
    kk: {
      name: 'Музыка теориясы',
      description: 'Музыкалық теория',
      detailedDescription: 'Гаммалар, аккордтар, тональдықтар, музыкалық талдау.',
      prerequisites: 'Музыка',
      outcomes: 'Музыканы түсіну'
    },
    en: {
      name: 'Music Theory',
      description: 'Musical theory',
      detailedDescription: 'Scales, chords, keys, musical analysis.',
      prerequisites: 'Music',
      outcomes: 'Understanding music'
    }
  },

  production: {
    ru: {
      name: 'Music Production',
      description: 'Создание музыки',
      detailedDescription: 'DAW, сведение, мастеринг, звукозапись.',
      prerequisites: 'Музыка',
      outcomes: 'Производство треков'
    },
    kk: {
      name: 'Music Production',
      description: 'Музыка жасау',
      detailedDescription: 'DAW, араластыру, мастеринг, дыбыс жазу.',
      prerequisites: 'Музыка',
      outcomes: 'Трек өндіру'
    },
    en: {
      name: 'Music Production',
      description: 'Creating music',
      detailedDescription: 'DAW, mixing, mastering, sound recording.',
      prerequisites: 'Music',
      outcomes: 'Track production'
    }
  },

  'fine-arts': {
    ru: {
      name: 'Изобразительное искусство',
      description: 'Профессиональное искусство',
      detailedDescription: 'Портрет, пейзаж, натюрморт. Профессиональные техники.',
      prerequisites: 'Живопись',
      outcomes: 'Художественное мастерство'
    },
    kk: {
      name: 'Бейнелеу өнері',
      description: 'Кәсіби өнер',
      detailedDescription: 'Портрет, пейзаж, натюрморт. Кәсіби техникалар.',
      prerequisites: 'Кескіндеме',
      outcomes: 'Көркемдік шеберлік'
    },
    en: {
      name: 'Fine Arts',
      description: 'Professional art',
      detailedDescription: 'Portrait, landscape, still life. Professional techniques.',
      prerequisites: 'Painting',
      outcomes: 'Artistic mastery'
    }
  },

  illustration: {
    ru: {
      name: 'Иллюстрация',
      description: 'Коммерческая иллюстрация',
      detailedDescription: 'Книжная иллюстрация, концепт-арт, персонажи.',
      prerequisites: 'Digital Art',
      outcomes: 'Профессиональная иллюстрация'
    },
    kk: {
      name: 'Иллюстрация',
      description: 'Коммерциялық иллюстрация',
      detailedDescription: 'Кітап иллюстрациясы, концепт-арт, кейіпкерлер.',
      prerequisites: 'Digital Art',
      outcomes: 'Кәсіби иллюстрация'
    },
    en: {
      name: 'Illustration',
      description: 'Commercial illustration',
      detailedDescription: 'Book illustration, concept art, characters.',
      prerequisites: 'Digital Art',
      outcomes: 'Professional illustration'
    }
  },

  composition: {
    ru: {
      name: 'Композиция',
      description: 'Сочинение музыки',
      detailedDescription: 'Создание оригинальной музыки, аранжировка, оркестровка.',
      prerequisites: 'Теория музыки + Production',
      outcomes: 'Создание произведений'
    },
    kk: {
      name: 'Композиция',
      description: 'Музыка шығару',
      detailedDescription: 'Түпнұсқа музыка жасау, аранжировка, оркестрлеу.',
      prerequisites: 'Музыка теориясы + Production',
      outcomes: 'Шығармаларды жасау'
    },
    en: {
      name: 'Composition',
      description: 'Music composition',
      detailedDescription: 'Creating original music, arranging, orchestration.',
      prerequisites: 'Music Theory + Production',
      outcomes: 'Creating compositions'
    }
  },

  artist: {
    ru: {
      name: 'Профессиональный художник',
      description: 'Мастер искусства',
      detailedDescription: 'Выставки, продажа работ, художественная карьера.',
      prerequisites: 'Изобразительное искусство + Иллюстрация',
      outcomes: 'Карьера художника'
    },
    kk: {
      name: 'Кәсіби суретші',
      description: 'Өнер шебері',
      detailedDescription: 'Көрмелер, жұмыстарды сату, көркемдік мансап.',
      prerequisites: 'Бейнелеу өнері + Иллюстрация',
      outcomes: 'Суретші мансабы'
    },
    en: {
      name: 'Professional Artist',
      description: 'Master of art',
      detailedDescription: 'Exhibitions, selling artworks, artistic career.',
      prerequisites: 'Fine Arts + Illustration',
      outcomes: 'Artist career'
    }
  },

  musician: {
    ru: {
      name: 'Профессиональный музыкант',
      description: 'Мастер музыки',
      detailedDescription: 'Концерты, альбомы, музыкальная карьера.',
      prerequisites: 'Композиция',
      outcomes: 'Карьера музыканта'
    },
    kk: {
      name: 'Кәсіби музыкант',
      description: 'Музыка шебері',
      detailedDescription: 'Концерттер, альбомдар, музыкалық мансап.',
      prerequisites: 'Композиция',
      outcomes: 'Музыкант мансабы'
    },
    en: {
      name: 'Professional Musician',
      description: 'Master of music',
      detailedDescription: 'Concerts, albums, musical career.',
      prerequisites: 'Composition',
      outcomes: 'Musician career'
    }
  },
};

// Функция для получения перевода навыка
export function getSkillTranslation(
  skillId: string,
  language: Language,
  field: keyof SkillTranslation
): string {
  const skill = skillsTranslations[skillId];
  if (!skill || !skill[language]) {
    return '';
  }
  return skill[language][field] || '';
}

// Функция для получения полного перевода навыка
export function getFullSkillTranslation(
  skillId: string,
  language: Language
): SkillTranslation | null {
  const skill = skillsTranslations[skillId];
  if (!skill || !skill[language]) {
    return null;
  }
  return skill[language];
}
