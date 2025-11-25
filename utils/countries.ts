/**
 * List of all countries in the world
 * Список всех стран мира с переводами
 */

export interface Country {
  code: string;
  name: string;
  nameRu: string;
  nameKk: string;
}

export const countries: Country[] = [
  { code: 'AF', name: 'Afghanistan', nameRu: 'Афганистан', nameKk: 'Ауғанстан' },
  { code: 'AL', name: 'Albania', nameRu: 'Албания', nameKk: 'Албания' },
  { code: 'DZ', name: 'Algeria', nameRu: 'Алжир', nameKk: 'Алжир' },
  { code: 'AD', name: 'Andorra', nameRu: 'Андорра', nameKk: 'Андорра' },
  { code: 'AO', name: 'Angola', nameRu: 'Ангола', nameKk: 'Ангола' },
  { code: 'AR', name: 'Argentina', nameRu: 'Аргентина', nameKk: 'Аргентина' },
  { code: 'AM', name: 'Armenia', nameRu: 'Армения', nameKk: 'Армения' },
  { code: 'AU', name: 'Australia', nameRu: 'Австралия', nameKk: 'Австралия' },
  { code: 'AT', name: 'Austria', nameRu: 'Австрия', nameKk: 'Австрия' },
  { code: 'AZ', name: 'Azerbaijan', nameRu: 'Азербайджан', nameKk: 'Әзірбайжан' },
  { code: 'BS', name: 'Bahamas', nameRu: 'Багамы', nameKk: 'Багам аралдары' },
  { code: 'BH', name: 'Bahrain', nameRu: 'Бахрейн', nameKk: 'Бахрейн' },
  { code: 'BD', name: 'Bangladesh', nameRu: 'Бангладеш', nameKk: 'Бангладеш' },
  { code: 'BB', name: 'Barbados', nameRu: 'Барбадос', nameKk: 'Барбадос' },
  { code: 'BY', name: 'Belarus', nameRu: 'Беларусь', nameKk: 'Беларусь' },
  { code: 'BE', name: 'Belgium', nameRu: 'Бельгия', nameKk: 'Бельгия' },
  { code: 'BZ', name: 'Belize', nameRu: 'Белиз', nameKk: 'Белиз' },
  { code: 'BJ', name: 'Benin', nameRu: 'Бенин', nameKk: 'Бенин' },
  { code: 'BT', name: 'Bhutan', nameRu: 'Бутан', nameKk: 'Бутан' },
  { code: 'BO', name: 'Bolivia', nameRu: 'Боливия', nameKk: 'Боливия' },
  { code: 'BA', name: 'Bosnia and Herzegovina', nameRu: 'Босния и Герцеговина', nameKk: 'Босния және Герцеговина' },
  { code: 'BW', name: 'Botswana', nameRu: 'Ботсвана', nameKk: 'Ботсвана' },
  { code: 'BR', name: 'Brazil', nameRu: 'Бразилия', nameKk: 'Бразилия' },
  { code: 'BN', name: 'Brunei', nameRu: 'Бруней', nameKk: 'Бруней' },
  { code: 'BG', name: 'Bulgaria', nameRu: 'Болгария', nameKk: 'Болгария' },
  { code: 'BF', name: 'Burkina Faso', nameRu: 'Буркина-Фасо', nameKk: 'Буркина-Фасо' },
  { code: 'BI', name: 'Burundi', nameRu: 'Бурунди', nameKk: 'Бурунди' },
  { code: 'KH', name: 'Cambodia', nameRu: 'Камбоджа', nameKk: 'Камбоджа' },
  { code: 'CM', name: 'Cameroon', nameRu: 'Камерун', nameKk: 'Камерун' },
  { code: 'CA', name: 'Canada', nameRu: 'Канада', nameKk: 'Канада' },
  { code: 'CV', name: 'Cape Verde', nameRu: 'Кабо-Верде', nameKk: 'Кабо-Верде' },
  { code: 'CF', name: 'Central African Republic', nameRu: 'Центральноафриканская Республика', nameKk: 'Орталық Африка Республикасы' },
  { code: 'TD', name: 'Chad', nameRu: 'Чад', nameKk: 'Чад' },
  { code: 'CL', name: 'Chile', nameRu: 'Чили', nameKk: 'Чили' },
  { code: 'CN', name: 'China', nameRu: 'Китай', nameKk: 'Қытай' },
  { code: 'CO', name: 'Colombia', nameRu: 'Колумбия', nameKk: 'Колумбия' },
  { code: 'KM', name: 'Comoros', nameRu: 'Коморы', nameKk: 'Комор аралдары' },
  { code: 'CG', name: 'Congo', nameRu: 'Конго', nameKk: 'Конго' },
  { code: 'CR', name: 'Costa Rica', nameRu: 'Коста-Рика', nameKk: 'Коста-Рика' },
  { code: 'HR', name: 'Croatia', nameRu: 'Хорватия', nameKk: 'Хорватия' },
  { code: 'CU', name: 'Cuba', nameRu: 'Куба', nameKk: 'Куба' },
  { code: 'CY', name: 'Cyprus', nameRu: 'Кипр', nameKk: 'Кипр' },
  { code: 'CZ', name: 'Czech Republic', nameRu: 'Чехия', nameKk: 'Чехия' },
  { code: 'DK', name: 'Denmark', nameRu: 'Дания', nameKk: 'Дания' },
  { code: 'DJ', name: 'Djibouti', nameRu: 'Джибути', nameKk: 'Джибути' },
  { code: 'DM', name: 'Dominica', nameRu: 'Доминика', nameKk: 'Доминика' },
  { code: 'DO', name: 'Dominican Republic', nameRu: 'Доминиканская Республика', nameKk: 'Доминикан Республикасы' },
  { code: 'EC', name: 'Ecuador', nameRu: 'Эквадор', nameKk: 'Эквадор' },
  { code: 'EG', name: 'Egypt', nameRu: 'Египет', nameKk: 'Египет' },
  { code: 'SV', name: 'El Salvador', nameRu: 'Сальвадор', nameKk: 'Сальвадор' },
  { code: 'GQ', name: 'Equatorial Guinea', nameRu: 'Экваториальная Гвинея', nameKk: 'Экваторлық Гвинея' },
  { code: 'ER', name: 'Eritrea', nameRu: 'Эритрея', nameKk: 'Эритрея' },
  { code: 'EE', name: 'Estonia', nameRu: 'Эстония', nameKk: 'Эстония' },
  { code: 'ET', name: 'Ethiopia', nameRu: 'Эфиопия', nameKk: 'Эфиопия' },
  { code: 'FJ', name: 'Fiji', nameRu: 'Фиджи', nameKk: 'Фиджи' },
  { code: 'FI', name: 'Finland', nameRu: 'Финляндия', nameKk: 'Финляндия' },
  { code: 'FR', name: 'France', nameRu: 'Франция', nameKk: 'Франция' },
  { code: 'GA', name: 'Gabon', nameRu: 'Габон', nameKk: 'Габон' },
  { code: 'GM', name: 'Gambia', nameRu: 'Гамбия', nameKk: 'Гамбия' },
  { code: 'GE', name: 'Georgia', nameRu: 'Грузия', nameKk: 'Грузия' },
  { code: 'DE', name: 'Germany', nameRu: 'Германия', nameKk: 'Германия' },
  { code: 'GH', name: 'Ghana', nameRu: 'Гана', nameKk: 'Гана' },
  { code: 'GR', name: 'Greece', nameRu: 'Греция', nameKk: 'Греция' },
  { code: 'GD', name: 'Grenada', nameRu: 'Гренада', nameKk: 'Гренада' },
  { code: 'GT', name: 'Guatemala', nameRu: 'Гватемала', nameKk: 'Гватемала' },
  { code: 'GN', name: 'Guinea', nameRu: 'Гвинея', nameKk: 'Гвинея' },
  { code: 'GW', name: 'Guinea-Bissau', nameRu: 'Гвинея-Бисау', nameKk: 'Гвинея-Бисау' },
  { code: 'GY', name: 'Guyana', nameRu: 'Гайана', nameKk: 'Гайана' },
  { code: 'HT', name: 'Haiti', nameRu: 'Гаити', nameKk: 'Гаити' },
  { code: 'HN', name: 'Honduras', nameRu: 'Гондурас', nameKk: 'Гондурас' },
  { code: 'HU', name: 'Hungary', nameRu: 'Венгрия', nameKk: 'Венгрия' },
  { code: 'IS', name: 'Iceland', nameRu: 'Исландия', nameKk: 'Исландия' },
  { code: 'IN', name: 'India', nameRu: 'Индия', nameKk: 'Үндістан' },
  { code: 'ID', name: 'Indonesia', nameRu: 'Индонезия', nameKk: 'Индонезия' },
  { code: 'IR', name: 'Iran', nameRu: 'Иран', nameKk: 'Иран' },
  { code: 'IQ', name: 'Iraq', nameRu: 'Ирак', nameKk: 'Ирак' },
  { code: 'IE', name: 'Ireland', nameRu: 'Ирландия', nameKk: 'Ирландия' },
  { code: 'IL', name: 'Israel', nameRu: 'Израиль', nameKk: 'Израиль' },
  { code: 'IT', name: 'Italy', nameRu: 'Италия', nameKk: 'Италия' },
  { code: 'JM', name: 'Jamaica', nameRu: 'Ямайка', nameKk: 'Ямайка' },
  { code: 'JP', name: 'Japan', nameRu: 'Япония', nameKk: 'Жапония' },
  { code: 'JO', name: 'Jordan', nameRu: 'Иордания', nameKk: 'Иордания' },
  { code: 'KZ', name: 'Kazakhstan', nameRu: 'Казахстан', nameKk: 'Қазақстан' },
  { code: 'KE', name: 'Kenya', nameRu: 'Кения', nameKk: 'Кения' },
  { code: 'KI', name: 'Kiribati', nameRu: 'Кирибати', nameKk: 'Кирибати' },
  { code: 'KP', name: 'North Korea', nameRu: 'Северная Корея', nameKk: 'Солтүстік Корея' },
  { code: 'KR', name: 'South Korea', nameRu: 'Южная Корея', nameKk: 'Оңтүстік Корея' },
  { code: 'KW', name: 'Kuwait', nameRu: 'Кувейт', nameKk: 'Кувейт' },
  { code: 'KG', name: 'Kyrgyzstan', nameRu: 'Киргизия', nameKk: 'Қырғызстан' },
  { code: 'LA', name: 'Laos', nameRu: 'Лаос', nameKk: 'Лаос' },
  { code: 'LV', name: 'Latvia', nameRu: 'Латвия', nameKk: 'Латвия' },
  { code: 'LB', name: 'Lebanon', nameRu: 'Ливан', nameKk: 'Ливан' },
  { code: 'LS', name: 'Lesotho', nameRu: 'Лесото', nameKk: 'Лесото' },
  { code: 'LR', name: 'Liberia', nameRu: 'Либерия', nameKk: 'Либерия' },
  { code: 'LY', name: 'Libya', nameRu: 'Ливия', nameKk: 'Ливия' },
  { code: 'LI', name: 'Liechtenstein', nameRu: 'Лихтенштейн', nameKk: 'Лихтенштейн' },
  { code: 'LT', name: 'Lithuania', nameRu: 'Литва', nameKk: 'Литва' },
  { code: 'LU', name: 'Luxembourg', nameRu: 'Люксембург', nameKk: 'Люксембург' },
  { code: 'MK', name: 'North Macedonia', nameRu: 'Северная Македония', nameKk: 'Солтүстік Македония' },
  { code: 'MG', name: 'Madagascar', nameRu: 'Мадагаскар', nameKk: 'Мадагаскар' },
  { code: 'MW', name: 'Malawi', nameRu: 'Малави', nameKk: 'Малави' },
  { code: 'MY', name: 'Malaysia', nameRu: 'Малайзия', nameKk: 'Малайзия' },
  { code: 'MV', name: 'Maldives', nameRu: 'Мальдивы', nameKk: 'Мальдив аралдары' },
  { code: 'ML', name: 'Mali', nameRu: 'Мали', nameKk: 'Мали' },
  { code: 'MT', name: 'Malta', nameRu: 'Мальта', nameKk: 'Мальта' },
  { code: 'MH', name: 'Marshall Islands', nameRu: 'Маршалловы Острова', nameKk: 'Маршалл аралдары' },
  { code: 'MR', name: 'Mauritania', nameRu: 'Мавритания', nameKk: 'Мавритания' },
  { code: 'MU', name: 'Mauritius', nameRu: 'Маврикий', nameKk: 'Маврикий' },
  { code: 'MX', name: 'Mexico', nameRu: 'Мексика', nameKk: 'Мексика' },
  { code: 'FM', name: 'Micronesia', nameRu: 'Микронезия', nameKk: 'Микронезия' },
  { code: 'MD', name: 'Moldova', nameRu: 'Молдова', nameKk: 'Молдова' },
  { code: 'MC', name: 'Monaco', nameRu: 'Монако', nameKk: 'Монако' },
  { code: 'MN', name: 'Mongolia', nameRu: 'Монголия', nameKk: 'Моңғолия' },
  { code: 'ME', name: 'Montenegro', nameRu: 'Черногория', nameKk: 'Черногория' },
  { code: 'MA', name: 'Morocco', nameRu: 'Марокко', nameKk: 'Марокко' },
  { code: 'MZ', name: 'Mozambique', nameRu: 'Мозамбик', nameKk: 'Мозамбик' },
  { code: 'MM', name: 'Myanmar', nameRu: 'Мьянма', nameKk: 'Мьянма' },
  { code: 'NA', name: 'Namibia', nameRu: 'Намибия', nameKk: 'Намибия' },
  { code: 'NR', name: 'Nauru', nameRu: 'Науру', nameKk: 'Науру' },
  { code: 'NP', name: 'Nepal', nameRu: 'Непал', nameKk: 'Непал' },
  { code: 'NL', name: 'Netherlands', nameRu: 'Нидерланды', nameKk: 'Нидерланды' },
  { code: 'NZ', name: 'New Zealand', nameRu: 'Новая Зеландия', nameKk: 'Жаңа Зеландия' },
  { code: 'NI', name: 'Nicaragua', nameRu: 'Никарагуа', nameKk: 'Никарагуа' },
  { code: 'NE', name: 'Niger', nameRu: 'Нигер', nameKk: 'Нигер' },
  { code: 'NG', name: 'Nigeria', nameRu: 'Нигерия', nameKk: 'Нигерия' },
  { code: 'NO', name: 'Norway', nameRu: 'Норвегия', nameKk: 'Норвегия' },
  { code: 'OM', name: 'Oman', nameRu: 'Оман', nameKk: 'Оман' },
  { code: 'PK', name: 'Pakistan', nameRu: 'Пакистан', nameKk: 'Пәкістан' },
  { code: 'PW', name: 'Palau', nameRu: 'Палау', nameKk: 'Палау' },
  { code: 'PA', name: 'Panama', nameRu: 'Панама', nameKk: 'Панама' },
  { code: 'PG', name: 'Papua New Guinea', nameRu: 'Папуа — Новая Гвинея', nameKk: 'Папуа - Жаңа Гвинея' },
  { code: 'PY', name: 'Paraguay', nameRu: 'Парагвай', nameKk: 'Парагвай' },
  { code: 'PE', name: 'Peru', nameRu: 'Перу', nameKk: 'Перу' },
  { code: 'PH', name: 'Philippines', nameRu: 'Филиппины', nameKk: 'Филиппин' },
  { code: 'PL', name: 'Poland', nameRu: 'Польша', nameKk: 'Польша' },
  { code: 'PT', name: 'Portugal', nameRu: 'Португалия', nameKk: 'Португалия' },
  { code: 'QA', name: 'Qatar', nameRu: 'Катар', nameKk: 'Катар' },
  { code: 'RO', name: 'Romania', nameRu: 'Румыния', nameKk: 'Румыния' },
  { code: 'RU', name: 'Russia', nameRu: 'Россия', nameKk: 'Ресей' },
  { code: 'RW', name: 'Rwanda', nameRu: 'Руанда', nameKk: 'Руанда' },
  { code: 'KN', name: 'Saint Kitts and Nevis', nameRu: 'Сент-Китс и Невис', nameKk: 'Сент-Китс және Невис' },
  { code: 'LC', name: 'Saint Lucia', nameRu: 'Сент-Люсия', nameKk: 'Сент-Люсия' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', nameRu: 'Сент-Винсент и Гренадины', nameKk: 'Сент-Винсент және Гренадиндер' },
  { code: 'WS', name: 'Samoa', nameRu: 'Самоа', nameKk: 'Самоа' },
  { code: 'SM', name: 'San Marino', nameRu: 'Сан-Марино', nameKk: 'Сан-Марино' },
  { code: 'ST', name: 'Sao Tome and Principe', nameRu: 'Сан-Томе и Принсипи', nameKk: 'Сан-Томе және Принсипи' },
  { code: 'SA', name: 'Saudi Arabia', nameRu: 'Саудовская Аравия', nameKk: 'Сауд Арабиясы' },
  { code: 'SN', name: 'Senegal', nameRu: 'Сенегал', nameKk: 'Сенегал' },
  { code: 'RS', name: 'Serbia', nameRu: 'Сербия', nameKk: 'Сербия' },
  { code: 'SC', name: 'Seychelles', nameRu: 'Сейшелы', nameKk: 'Сейшел аралдары' },
  { code: 'SL', name: 'Sierra Leone', nameRu: 'Сьерра-Леоне', nameKk: 'Сьерра-Леоне' },
  { code: 'SG', name: 'Singapore', nameRu: 'Сингапур', nameKk: 'Сингапур' },
  { code: 'SK', name: 'Slovakia', nameRu: 'Словакия', nameKk: 'Словакия' },
  { code: 'SI', name: 'Slovenia', nameRu: 'Словения', nameKk: 'Словения' },
  { code: 'SB', name: 'Solomon Islands', nameRu: 'Соломоновы Острова', nameKk: 'Соломон аралдары' },
  { code: 'SO', name: 'Somalia', nameRu: 'Сомали', nameKk: 'Сомали' },
  { code: 'ZA', name: 'South Africa', nameRu: 'Южная Африка', nameKk: 'Оңтүстік Африка' },
  { code: 'SS', name: 'South Sudan', nameRu: 'Южный Судан', nameKk: 'Оңтүстік Судан' },
  { code: 'ES', name: 'Spain', nameRu: 'Испания', nameKk: 'Испания' },
  { code: 'LK', name: 'Sri Lanka', nameRu: 'Шри-Ланка', nameKk: 'Шри-Ланка' },
  { code: 'SD', name: 'Sudan', nameRu: 'Судан', nameKk: 'Судан' },
  { code: 'SR', name: 'Suriname', nameRu: 'Суринам', nameKk: 'Суринам' },
  { code: 'SZ', name: 'Swaziland', nameRu: 'Эсватини', nameKk: 'Эсватини' },
  { code: 'SE', name: 'Sweden', nameRu: 'Швеция', nameKk: 'Швеция' },
  { code: 'CH', name: 'Switzerland', nameRu: 'Швейцария', nameKk: 'Швейцария' },
  { code: 'SY', name: 'Syria', nameRu: 'Сирия', nameKk: 'Сирия' },
  { code: 'TW', name: 'Taiwan', nameRu: 'Тайвань', nameKk: 'Тайвань' },
  { code: 'TJ', name: 'Tajikistan', nameRu: 'Таджикистан', nameKk: 'Тәжікстан' },
  { code: 'TZ', name: 'Tanzania', nameRu: 'Танзания', nameKk: 'Танзания' },
  { code: 'TH', name: 'Thailand', nameRu: 'Таиланд', nameKk: 'Тайланд' },
  { code: 'TL', name: 'Timor-Leste', nameRu: 'Восточный Тимор', nameKk: 'Шығыс Тимор' },
  { code: 'TG', name: 'Togo', nameRu: 'Того', nameKk: 'Того' },
  { code: 'TO', name: 'Tonga', nameRu: 'Тонга', nameKk: 'Тонга' },
  { code: 'TT', name: 'Trinidad and Tobago', nameRu: 'Тринидад и Тобаго', nameKk: 'Тринидад және Тобаго' },
  { code: 'TN', name: 'Tunisia', nameRu: 'Тунис', nameKk: 'Тунис' },
  { code: 'TR', name: 'Turkey', nameRu: 'Турция', nameKk: 'Түркия' },
  { code: 'TM', name: 'Turkmenistan', nameRu: 'Туркменистан', nameKk: 'Түрікменстан' },
  { code: 'TV', name: 'Tuvalu', nameRu: 'Тувалу', nameKk: 'Тувалу' },
  { code: 'UG', name: 'Uganda', nameRu: 'Уганда', nameKk: 'Уганда' },
  { code: 'UA', name: 'Ukraine', nameRu: 'Украина', nameKk: 'Украина' },
  { code: 'AE', name: 'United Arab Emirates', nameRu: 'ОАЭ', nameKk: 'БАӘ' },
  { code: 'GB', name: 'United Kingdom', nameRu: 'Великобритания', nameKk: 'Ұлыбритания' },
  { code: 'US', name: 'United States', nameRu: 'США', nameKk: 'АҚШ' },
  { code: 'UY', name: 'Uruguay', nameRu: 'Уругвай', nameKk: 'Уругвай' },
  { code: 'UZ', name: 'Uzbekistan', nameRu: 'Узбекистан', nameKk: 'Өзбекстан' },
  { code: 'VU', name: 'Vanuatu', nameRu: 'Вануату', nameKk: 'Вануату' },
  { code: 'VA', name: 'Vatican City', nameRu: 'Ватикан', nameKk: 'Ватикан' },
  { code: 'VE', name: 'Venezuela', nameRu: 'Венесуэла', nameKk: 'Венесуэла' },
  { code: 'VN', name: 'Vietnam', nameRu: 'Вьетнам', nameKk: 'Вьетнам' },
  { code: 'YE', name: 'Yemen', nameRu: 'Йемен', nameKk: 'Йемен' },
  { code: 'ZM', name: 'Zambia', nameRu: 'Замбия', nameKk: 'Замбия' },
  { code: 'ZW', name: 'Zimbabwe', nameRu: 'Зимбабве', nameKk: 'Зимбабве' },
];

/**
 * Получить название страны на нужном языке
 */
export function getCountryName(code: string, language: 'en' | 'ru' | 'kk'): string {
  const country = countries.find(c => c.code === code);
  if (!country) return code;
  
  switch (language) {
    case 'ru':
      return country.nameRu;
    case 'kk':
      return country.nameKk;
    default:
      return country.name;
  }
}

/**
 * Поиск стран по запросу
 */
export function searchCountries(query: string, language: 'en' | 'ru' | 'kk'): Country[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return countries;
  
  return countries.filter(country => {
    const searchIn = [
      country.name.toLowerCase(),
      country.nameRu.toLowerCase(),
      country.nameKk.toLowerCase(),
      country.code.toLowerCase()
    ];
    
    return searchIn.some(text => text.includes(normalizedQuery));
  });
}
