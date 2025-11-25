/**
 * Certificate Verification System
 * Проверяет сертификаты республиканского и международного уровня через Gemini Vision API
 */

import { getSupabaseClient } from './supabase/client';

export interface VerificationResult {
  verified: boolean;
  confidence: number; // 0-100
  sources: string[];
  reason: string;
  extractedData?: {
    name: string | null;
    issuer: string | null;
    issueDate: string | null;
    certNumber: string | null;
  };
}

// Cache for API key
let cachedApiKey: string | null = null;

// Get Gemini API key from Supabase env table
async function getGeminiApiKey(): Promise<string> {
  if (cachedApiKey) {
    return cachedApiKey;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('env')
      .select('VITE_GEMINI_API_KEY')
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error fetching Gemini API key:', error);
      throw new Error('Failed to fetch Gemini API key');
    }

    if (!data?.VITE_GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in env table');
    }

    cachedApiKey = data.VITE_GEMINI_API_KEY;
    console.log('✅ Gemini API key loaded from database');
    return cachedApiKey;
  } catch (error) {
    console.error('❌ Failed to get Gemini API key:', error);
    throw error;
  }
}

/**
 * Проверяет сертификат через Gemini Vision API
 */
export async function verifyCertificateOnline(
  certificateName: string,
  description: string,
  level: 'city' | 'republic' | 'international',
  imageBase64?: string
): Promise<VerificationResult> {
  // Если есть изображение - используем Vision API для ВСЕХ уровней (включая городской)
  if (imageBase64) {
    try {
      console.log('🔍 ===============================================');
      console.log('🔍 STARTING CERTIFICATE VERIFICATION');
      console.log('🔍 Level:', level === 'city' ? 'CITY (soft check)' : level === 'republic' ? 'REPUBLIC (strict)' : 'INTERNATIONAL (very strict)');
      console.log('🔍 ===============================================');
      console.log('📝 Certificate Name:', certificateName);
      console.log('📝 Description:', description);
      console.log('📝 Level:', level);
      console.log('📸 Image provided:', imageBase64 ? 'YES' : 'NO');
      
      // Get API key from database
      const apiKey = await getGeminiApiKey();
      console.log('🔑 API Key loaded successfully');
      
      // Remove data:image prefix if present
      const base64Data = imageBase64.includes(',') 
        ? imageBase64.split(',')[1] 
        : imageBase64;
      
      // Detect image MIME type
      const mimeType = imageBase64.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
      
      // Create prompt based on level (city = soft, republic/international = strict)
      const isCityLevel = level === 'city';
      const strictnessLevel = isCityLevel ? 'УМЕРЕННЫЙ' : 'МАКСИМАЛЬНО СТРОГИЙ';
      
      const prompt = `Ты - ${strictnessLevel} эксперт по проверке сертификатов и дипломов. Твоя задача - проверить что изображение ДЕЙСТВИТЕЛЬНО показывает сертификат И содержание изображения ТОЧНО соответствует заявленному названию и описанию.

🎯 ЗАЯВЛЕНО ПОЛЬЗОВАТЕЛЕМ:
- Название: "${certificateName}"
- Описание: "${description}"
- Уровень: ${level === 'international' ? 'МЕЖДУНАРОДНЫЙ' : level === 'republic' ? 'РЕСПУБЛИКАНСКИЙ' : 'ГОРОДСКОЙ'}

⛔ ОБЯЗАТЕЛЬНО ОТКЛОНЯЙ (verified: false, confidence: 0):

1. ❌ На изображении ВООБЩЕ НЕ сертификат (аниме, селфи, природа, предметы, и т.д.)
2. ❌ Изображение НЕ СООТВЕТСТВУЕТ названию:
   - Пользователь написал "Олимпиада по математике", но на фото аниме персонаж → REJECT
   - Пользователь написал "Победитель", но на фото просто картинка без диплома → REJECT
   - Пользователь написал название олимпиады, но на фото что-то другое → REJECT
3. ❌ Это фото экрана/монитора (скриншот)
4. ❌ Изображение размытое - текст НЕВОЗМОЖНО прочитать

🔍 СТРОГАЯ ПРОВЕРКА СООТВЕТСТВИЯ:
1. Прочитай текст на изображении (если это сертификат)
2. Сравни с заявленным названием "${certificateName}"
3. Если НЕ совпадает → matchesProvided: false, verified: false
4. Если на фото вообще не сертификат → isCertificate: false, verified: false

КРИТЕРИИ ПРИНЯТИЯ:
✓ isCertificate: true - это диплом/сертификат/грамота (НЕ аниме, НЕ селфи, НЕ просто картинка)
✓ isHighQuality: true - текст читаем, изображение достаточно четкое
✓ matchesProvided: true - название на сертификате СОВПАДАЕТ с "${certificateName}"
✓ notScreenshot: true - это НЕ фото экрана

${isCityLevel ? 
`⚠️ ГОРОДСКОЙ УРОВЕНЬ - МЯГКИЕ КРИТЕРИИ:
- Печать необязательна (hasOfficialSeal может быть false)
- Подпись необязательна (hasSignature может быть false)
- Логотип необязателен (hasOfficialLogo может быть false)
- Может быть грамота, благодарность, сертификат участника
- Главное: это КАКОЙ-ТО документ о достижении (не аниме, не селфи)` :
`⚠️ ${level === 'republic' ? 'РЕСПУБЛИКАНСКИЙ' : 'МЕЖДУНАРОДНЫЙ'} УРОВЕНЬ - СТРОГИЕ КРИТЕРИИ:
✓ hasOfficialSeal: true - ОБЯЗАТЕЛЬНА ЧЕТКАЯ печать организации
✓ hasSignature: true - ОБЯЗАТЕЛЬНА подпись уполномоченного лица
✓ hasOfficialLogo: true - ОБЯЗАТЕЛЕН логотип организации
✓ matchesLevel: true - уровень должен соответствовать
✓ notFake: true - НЕ должен выглядеть как подделка
${level === 'international' ? 
`✓ hasInternationalOrg: true - видно название ИЗВЕСТНОЙ м��ждународной организации (IMO, IOI, IPhO, etc)
✓ hasEnglishText: true - есть текст на английском языке
✓ hasProfessionalDesign: true - профессиональный дизайн мирового уровня` :
`✓ hasGovernmentSeal: true - есть печать государственного органа РК
✓ hasKazakhSymbols: true - есть символика Казахстана или официального органа  
✓ hasOfficialFormat: true - официальный государственный формат`}`}

⚠️ ВАЖНО - ПРОВЕРКА СООТВЕТСТВИЯ:
- Если пользователь написал название олимпиады, но на изображении совсем другое → matchesProvided: false
- Если это вообще не сертификат (аниме, селфи, мем) → isCertificate: false
- Если не можешь прочитать название на сертификате → isHighQuality: false
- ЛЮБОЕ несоответствие между заявленным и фактическим → verified: false

Ответь СТРОГО в формате JSON (БЕЗ markdown):

{
  "isCertificate": true/false,
  "hasOfficialSeal": true/false,
  "hasSignature": true/false,
  "hasOfficialLogo": true/false,
  "isHighQuality": true/false,
  "matchesProvided": true/false,
  "matchesLevel": true/false,
  "notScreenshot": true/false,
  "notFake": true/false,
  "verified": true/false,
  "confidence": число от 0 до 100,
  "reason": "подробное объяснение на русском - ОБЯЗАТЕЛЬНО укажи соответствует ли изображение заявленному названию '${certificateName}'",
  "extractedName": "ТОЧНОЕ название с сертификата или null если не сертификат",
  "extractedIssuer": "организация-выдавший или null",
  "extractedDate": "дата выдачи или null",
  "qualityIssues": ["все найденные проблемы"]
}

ПОМНИ: 
1. Если на изображении НЕ сертификат (аниме, фото, мем) → isCertificate: false, verified: false
2. Если название на сертификате НЕ совпадает с "${certificateName}" → matchesProvided: false, verified: false
3. Лучше ОТКЛОНИТЬ сомнительный, чем принять поддельный!`;

      // Call Gemini Vision API
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }]
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('❌ Gemini Vision API Error:', response.status, errorText);
        throw new Error(`Vision API Error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('No response from Vision API');
      }

      console.log('📊 Raw Vision API Response:', responseText);

      // Parse JSON response
      let analysis;
      try {
        // Extract JSON from response (may have markdown formatting)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        analysis = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('❌ Failed to parse Vision API response:', parseError);
        throw new Error('Invalid Vision API response format');
      }

      console.log('📊 ===============================================');
      console.log('📊 GEMINI VISION API ANALYSIS RESULT:');
      console.log('📊 ===============================================');
      console.log('📊 Full analysis:', JSON.stringify(analysis, null, 2));
      console.log('');
      console.log(`🔍 STARTING ${isCityLevel ? 'SOFT (city)' : 'STRICT'} CHECKS...`);
      console.log('');

      // СТРОГИЕ ПРОВЕРКИ - для городского уровня некоторые опциональны

      // 1. Проверка что это сертификат (ОБЯЗАТЕЛЬНО ДЛЯ ВСЕХ УРОВНЕЙ)
      console.log('1️⃣ Check: isCertificate =', analysis.isCertificate);
      if (!analysis.isCertificate) {
        console.log('❌ REJECTED: Not a certificate!');
        console.log('===============================================');
        return {
          verified: false,
          confidence: 0,
          sources: [],
          reason: '❌ На изображении не обнаружен сертификат/диплом/грамота. Это должен быть ДОКУМЕНТ о достижении, а не аниме, селфи или просто картинка.',
          extractedData: { name: null, issuer: null, issueDate: null, certNumber: null }
        };
      }

      // 2. Проверка наличия официальной печати (ОБЯЗАТЕЛЬНО только для republic/international)
      console.log('2️⃣ Check: hasOfficialSeal =', analysis.hasOfficialSeal);
      if (!isCityLevel && !analysis.hasOfficialSeal) {
        console.log('❌ REJECTED: No official seal (required for republic/international)!');
        console.log('===============================================');
        return {
          verified: false,
          confidence: 0,
          sources: [],
          reason: `❌ Для ${level === 'republic' ? 'республиканского' : 'международного'} уровня ОБЯЗАТЕЛЬНА официальная печать организации. На сертификате печать не обнаружена.`,
          extractedData: { name: null, issuer: null, issueDate: null, certNumber: null }
        };
      }
      if (isCityLevel && !analysis.hasOfficialSeal) {
        console.log('⚠️ No seal, but OK for city level');
      }

      // 3. Проверка наличия подписи (ОБЯЗАТЕЛЬНО только для republic/international)
      console.log('3️⃣ Check: hasSignature =', analysis.hasSignature);
      if (!isCityLevel && !analysis.hasSignature) {
        console.log('❌ REJECTED: No signature (required for republic/international)!');
        console.log('===============================================');
        return {
          verified: false,
          confidence: 0,
          sources: [],
          reason: `❌ Для ${level === 'republic' ? 'республиканского' : 'международного'} уровня ОБЯЗАТЕЛЬНА подпись уполномоченного лица. На сертификате подпись не обнаружена.`,
          extractedData: { name: null, issuer: null, issueDate: null, certNumber: null }
        };
      }
      if (isCityLevel && !analysis.hasSignature) {
        console.log('⚠️ No signature, but OK for city level');
      }

      // 4. Проверка наличия логотипа организации (ОБЯЗАТЕЛЬНО только для republic/international)
      console.log('4️⃣ Check: hasOfficialLogo =', analysis.hasOfficialLogo);
      if (!isCityLevel && !analysis.hasOfficialLogo) {
        console.log('❌ REJECTED: No logo (required for republic/international)!');
        console.log('===============================================');
        return {
          verified: false,
          confidence: 0,
          sources: [],
          reason: `❌ Для ${level === 'republic' ? 'республиканского' : 'международного'} уровня ОБЯЗАТЕЛЕН логотип организации. На сертификате логотип не обнаружен.`,
          extractedData: { name: null, issuer: null, issueDate: null, certNumber: null }
        };
      }
      if (isCityLevel && !analysis.hasOfficialLogo) {
        console.log('⚠️ No logo, but OK for city level');
      }

      // 5. Проверка качества изображения (ОБЯЗАТЕЛЬНО ДЛЯ ВСЕХ)
      console.log('5️⃣ Check: isHighQuality =', analysis.isHighQuality);
      if (!analysis.isHighQuality) {
        console.log('❌ REJECTED: Poor quality!');
        console.log('===============================================');
        return {
          verified: false,
          confidence: 0,
          sources: [],
          reason: '❌ Качество изображения недостаточное: текст нечитаем или изображение размытое. Сделайте более четкое фото.',
          extractedData: { name: null, issuer: null, issueDate: null, certNumber: null }
        };
      }

      // 6. Проверка что это не скриншот (ОБЯЗАТЕЛЬНО ДЛЯ ВСЕХ)
      console.log('6️⃣ Check: notScreenshot =', analysis.notScreenshot);
      if (!analysis.notScreenshot) {
        console.log('❌ REJECTED: Screenshot detected!');
        console.log('===============================================');
        return {
          verified: false,
          confidence: 0,
          sources: [],
          reason: '❌ Обнаружен скриншот экрана. Загрузите фото ФИЗИЧЕСКОГО сертификата, а не фото монитора.',
          extractedData: { name: null, issuer: null, issueDate: null, certNumber: null }
        };
      }

      // 7. Проверка что это не подделка (ОБЯЗАТЕЛЬНО только для republic/international)
      console.log('7️⃣ Check: notFake =', analysis.notFake);
      if (!isCityLevel && !analysis.notFake) {
        console.log('❌ REJECTED: Looks fake (required check for republic/international)!');
        console.log('===============================================');
        return {
          verified: false,
          confidence: 0,
          sources: [],
          reason: `❌ Для ${level === 'republic' ? 'республиканского' : 'международного'} уровня сертификат не должен выглядеть как подделка. Обнаружены признаки любительской распечатки.`,
          extractedData: { name: null, issuer: null, issueDate: null, certNumber: null }
        };
      }
      if (isCityLevel && !analysis.notFake) {
        console.log('⚠️ Might look fake, but more lenient for city level');
      }

      // 8. Проверка совпадения названия (ОБЯЗАТЕЛЬНО ДЛЯ ВСЕХ)
      console.log('8️⃣ Check: matchesProvided =', analysis.matchesProvided);
      if (!analysis.matchesProvided) {
        console.log('❌ REJECTED: Name mismatch!');
        console.log('===============================================');
        const extractedName = analysis.extractedName || 'неизвестно';
        return {
          verified: false,
          confidence: 0,
          sources: [],
          reason: `❌ Название на сертификате "${extractedName}" не совпадает с указанным "${certificateName}". Укажите точное название как на сертификате.`,
          extractedData: {
            name: analysis.extractedName || null,
            issuer: analysis.extractedIssuer || null,
            issueDate: analysis.extractedDate || null,
            certNumber: null
          }
        };
      }

      // 9. Проверка соответствия уровня (ОБЯЗАТЕЛЬНО)
      if (!analysis.matchesLevel) {
        return {
          verified: false,
          confidence: 0,
          sources: [],
          reason: `❌ Сертификат не соответствует заявленному уровню (${level === 'international' ? 'международный' : 'республиканский'}). Проверьте правильность выбранного уровня.`,
          extractedData: {
            name: analysis.extractedName || null,
            issuer: analysis.extractedIssuer || null,
            issueDate: analysis.extractedDate || null,
            certNumber: null
          }
        };
      }

      // 10. Проверка минимального уровня уверенности
      const minConfidence = level === 'international' ? 80 : 70;
      if ((analysis.confidence || 0) < minConfidence) {
        return {
          verified: false,
          confidence: analysis.confidence || 0,
          sources: [],
          reason: `❌ Недостаточная уверенность в легитимности сертификата (${analysis.confidence}% < ${minConfidence}%). ${analysis.reason || 'Загрузите более четкое фото или проверьте подлинность сертификата.'}`,
          extractedData: {
            name: analysis.extractedName || null,
            issuer: analysis.extractedIssuer || null,
            issueDate: analysis.extractedDate || null,
            certNumber: null
          }
        };
      }

      // 11. Финальная проверка - verified должен быть true от Gemini
      if (!analysis.verified) {
        return {
          verified: false,
          confidence: analysis.confidence || 0,
          sources: [],
          reason: `❌ ${analysis.reason || 'Сертификат не прошел проверку легитимности.'}`,
          extractedData: {
            name: analysis.extractedName || null,
            issuer: analysis.extractedIssuer || null,
            issueDate: analysis.extractedDate || null,
            certNumber: null
          }
        };
      }

      // ✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ - СЕРТИФИКАТ ВЕРИФИЦИРОВАН
      console.log('');
      console.log('✅✅✅ ALL 11 CHECKS PASSED! ✅✅✅');
      console.log('🎉 Certificate VERIFIED with confidence:', analysis.confidence, '%');
      console.log('===============================================');
      return {
        verified: true,
        confidence: analysis.confidence || 0,
        sources: [],
        reason: `✅ ${analysis.reason || 'Сертификат успешно верифицирован!'}`,
        extractedData: {
          name: analysis.extractedName || null,
          issuer: analysis.extractedIssuer || null,
          issueDate: analysis.extractedDate || null,
          certNumber: null
        }
      };

    } catch (error) {
      console.error('❌ Vision API Error:', error);
      // Fallback to text search
      return await verifyByTextSearch(certificateName, description, level);
    }
  }

  // Если нет изображения - ОТКЛОНЯЕМ для республиканского и международного уровней
  console.warn('⚠️ No image provided for certificate verification');
  return {
    verified: false,
    confidence: 0,
    sources: [],
    reason: `❌ Для ${level === 'international' ? 'международного' : 'республиканского'} уровня обязательно загрузите фото сертификата. Проверка без фото невозможна.`,
    extractedData: {
      name: null,
      issuer: null,
      issueDate: null,
      certNumber: null
    }
  };
}

/**
 * Проверка через текстовый поиск (фолбэк метод - используется только при ошибках Vision API)
 * ВАЖНО: Этот метод тоже строгий - не пропускает всё подряд
 */
async function verifyByTextSearch(
  certificateName: string,
  description: string,
  level: string
): Promise<VerificationResult> {
  console.warn('⚠️ Vision API failed, using text search fallback');
  
  // Для международного и республиканского уровней БЕЗ фото - ОТКЛОНЯЕМ
  if (level === 'international' || level === 'republic') {
    return {
      verified: false,
      confidence: 0,
      sources: [],
      reason: `❌ Не удалось проверить фото через Vision API. Для ${level === 'international' ? 'международного' : 'республиканского'} уровня необходима проверка фото сертификата. Попробуйте позже или обратитесь к администратору.`,
      extractedData: {
        name: null,
        issuer: null,
        issueDate: null,
        certNumber: null
      }
    };
  }
  
  // Для городского уровня можем использовать текстовый поиск
  try {
    const searchQuery = buildSearchQuery(certificateName, description, level);
    const searchResults = await searchWeb(searchQuery);
    const analysis = analyzeSearchResults(searchResults, certificateName, description);
    return analysis;
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return {
      verified: false,
      confidence: 0,
      sources: [],
      reason: '❌ Не удалось проверить сертификат. Попробуйте позже.'
    };
  }
}

/**
 * Формирует поисковый запрос для проверки сертификата
 */
function buildSearchQuery(name: string, description: string, level: string): string {
  const levelKeywords = {
    republic: 'Казахстан республиканский национальный',
    international: 'international world global championship'
  };
  
  const keywords = levelKeywords[level as 'republic' | 'international'] || '';
  
  // Создаем запрос с названием, описанием и уровнем
  return `"${name}" ${description} ${keywords} competition olympiad contest`;
}

/**
 * Выполняет поиск в интернете используя бесплатный API
 */
async function searchWeb(query: string): Promise<any[]> {
  try {
    // Используем Wikipedia API для поиска известных олимпиад и конкурсов
    const wikiResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&format=json&origin=*`
    );
    
    if (!wikiResponse.ok) {
      throw new Error('Wikipedia API failed');
    }
    
    const wikiData = await wikiResponse.json();
    const wikiResults = wikiData[1] || []; // Titles
    const wikiUrls = wikiData[3] || []; // URLs
    
    // Также проверяем через российскую Wikipedia
    const ruWikiResponse = await fetch(
      `https://ru.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&format=json&origin=*`
    );
    
    const ruWikiData = await ruWikiResponse.json();
    const ruWikiResults = ruWikiData[1] || [];
    const ruWikiUrls = ruWikiData[3] || [];
    
    // Объединяем результаты
    const results = [
      ...wikiResults.map((title: string, i: number) => ({
        title,
        url: wikiUrls[i],
        source: 'wikipedia'
      })),
      ...ruWikiResults.map((title: string, i: number) => ({
        title,
        url: ruWikiUrls[i],
        source: 'ru.wikipedia'
      }))
    ];
    
    return results;
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

/**
 * Анализирует результаты поиска для определения легитимности сертификата
 */
function analyzeSearchResults(
  results: any[],
  certificateName: string,
  description: string
): VerificationResult {
  if (results.length === 0) {
    return {
      verified: false,
      confidence: 20,
      sources: [],
      reason: 'Сертификат не найден в открытых источниках. Это может быть редкое соревнование или ошибка в названии.'
    };
  }
  
  // Проверяем совпадения по названию
  const nameWords = certificateName.toLowerCase().split(' ').filter(w => w.length > 3);
  const descWords = description.toLowerCase().split(' ').filter(w => w.length > 3);
  const allWords = [...new Set([...nameWords, ...descWords])];
  
  let bestMatch = 0;
  let matchedSources: string[] = [];
  
  for (const result of results) {
    const resultTitle = result.title.toLowerCase();
    
    // Подсчитываем совпадающие слова
    let matchCount = 0;
    for (const word of allWords) {
      if (resultTitle.includes(word)) {
        matchCount++;
      }
    }
    
    const matchPercent = (matchCount / allWords.length) * 100;
    
    if (matchPercent > bestMatch) {
      bestMatch = matchPercent;
    }
    
    if (matchPercent > 30) {
      matchedSources.push(result.url);
    }
  }
  
  // Определяем результат на основе совпадений (БОЛЕЕ СТРОГИЕ ПОРОГИ)
  if (bestMatch >= 80) {
    // Очень высокое совпадение - скорее всего известное соревнование
    return {
      verified: true,
      confidence: Math.min(90, bestMatch),
      sources: matchedSources,
      reason: '✅ Сертификат подтвержден через Wikipedia - это известное соревнование!'
    };
  } else if (bestMatch >= 60) {
    // Хорошее совпадение - но требуем фото для финальной проверки
    return {
      verified: false,
      confidence: bestMatch,
      sources: matchedSources,
      reason: '⚠️ Соревнование найдено в открытых источниках, но требуется проверка фото сертификата для подтверждения.'
    };
  } else if (bestMatch >= 40) {
    // Среднее совпадение - не принимаем
    return {
      verified: false,
      confidence: bestMatch,
      sources: matchedSources,
      reason: '❌ Найдены упоминания, но недостаточно данных для подтверждения. Проверьте правильность названия и загрузите фото сертификата.'
    };
  } else {
    // Низкое совпадение - отклоняем
    return {
      verified: false,
      confidence: bestMatch,
      sources: [],
      reason: '❌ Сертификат не найден в открытых источниках. Убедитесь, что название указано правильно, и загрузите фото сертификата.'
    };
  }
}

/**
 * Проверяет список известных олимпиад и конкурсов
 */
export function isWellKnownCompetition(name: string, level: string): boolean {
  const internationalCompetitions = [
    'IMO', 'International Mathematical Olympiad',
    'IOI', 'International Olympiad in Informatics',
    'IPhO', 'International Physics Olympiad',
    'IChO', 'International Chemistry Olympiad',
    'IBO', 'International Biology Olympiad',
    'IYPT', 'International Young Physicists',
    'IJSO', 'International Junior Science Olympiad',
    'ACM ICPC', 'International Collegiate Programming',
    'Google Code Jam',
    'Facebook Hacker Cup',
    'TopCoder',
    'Codeforces',
    'AtCoder',
    'USACO',
    'Intel ISEF',
    'Google Science Fair'
  ];
  
  const republicCompetitions = [
    'Республиканская олимпиада',
    'Национальная олимпиада',
    'Абай олимпиадасы',
    'Назарбаев Интеллектуальные школы',
    'НИШ олимпиада',
    'Дарын',
    'Зерде'
  ];
  
  const nameLower = name.toLowerCase();
  
  if (level === 'international') {
    return internationalCompetitions.some(comp => 
      nameLower.includes(comp.toLowerCase())
    );
  } else if (level === 'republic') {
    return republicCompetitions.some(comp => 
      nameLower.includes(comp.toLowerCase())
    );
  }
  
  return false;
}