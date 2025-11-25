/**
 * Analyze admission chances for universities
 */

import { getSupabaseClient } from './supabase/client';

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
 * Generate text using Gemini API
 */
export async function generateText(prompt: string): Promise<string> {
  try {
    const apiKey = await getGeminiApiKey();
    
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
            parts: [{ text: prompt }]
          }]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('❌ Gemini API Error:', response.status, errorText);
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    return responseText;
  } catch (error) {
    console.error('❌ Failed to generate text:', error);
    throw error;
  }
}

/**
 * Analyze admission chances for universities
 */
export async function analyzeAdmissionChances(
  universities: Array<{
    name: string;
    ranking: number;
    country: string;
    category: string;
  }>,
  userPortfolio: {
    gpa: number;
    ieltsScore?: number;
    satScore?: number;
    achievements: number; // Number of achievements
    direction: string;
  }
): Promise<Array<{
  universityName: string;
  probability: number;
  category: 'SAFETY' | 'TARGET' | 'REACH' | 'DREAM';
  reasoning: string;
}>> {
  try {
    console.log('�� Starting AI analysis for', universities.length, 'universities');
    console.log('📊 User portfolio:', userPortfolio);

    const prompt = `You are an expert university admissions consultant. Analyze the admission chances for a student with the following profile:

STUDENT PROFILE:
- GPA: ${userPortfolio.gpa.toFixed(2)} / 5.0
${userPortfolio.ieltsScore ? `- IELTS: ${userPortfolio.ieltsScore}` : '- IELTS: Not taken'}
${userPortfolio.satScore ? `- SAT: ${userPortfolio.satScore}` : '- SAT: Not taken'}
- Verified Achievements: ${userPortfolio.achievements}
- Direction: ${userPortfolio.direction}

UNIVERSITIES TO ANALYZE:
${universities.map((u, i) => `${i + 1}. ${u.name} (QS Rank: #${u.ranking}, ${u.country})`).join('\n')}

For EACH university, provide:
1. Admission probability (0-100%) - BE REALISTIC based on the student's ACTUAL portfolio
2. Category (SAFETY/TARGET/REACH/DREAM)
3. Brief reasoning (1-2 sentences)

IMPORTANT RULES:
- A student with GPA ${userPortfolio.gpa} and ${userPortfolio.ieltsScore || 0} IELTS and ${userPortfolio.satScore || 0} SAT should have REALISTIC chances
- Missing test scores (IELTS/SAT) = MAJOR penalty
- Top 10 universities (rank < 10): Usually 5-20% for average students
- Top 50 universities (rank < 50): Usually 10-40% for good students
- Top 100 universities (rank < 100): Usually 20-60% for good students
- Lower ranked universities (rank > 100): Higher chances for qualified students
- GPA < 3.5: Significant penalty for top universities
- No IELTS: <25% for international universities
- No SAT: <30% for top US universities
- Each student's chances should VARY based on their portfolio vs university requirements

Format your response EXACTLY like this:

UNIVERSITY: [University Name]
PROBABILITY: [number 0-100]
CATEGORY: [SAFETY/TARGET/REACH/DREAM]
REASONING: [Your reasoning]
---

UNIVERSITY: [Next University Name]
PROBABILITY: [number 0-100]
CATEGORY: [SAFETY/TARGET/REACH/DREAM]
REASONING: [Your reasoning]
---`;

    console.log('📤 Sending prompt to Gemini...');
    
    const aiResponse = await generateText(prompt);
    
    console.log('📥 Received AI response');
    console.log('📝 Response length:', aiResponse.length);
    console.log('📝 Full response:', aiResponse);

    // Parse response
    const results = parseAdmissionResponse(aiResponse, universities);
    
    console.log('✅ Parsed results:', results.length);
    console.log('📝 Results:', results);
    
    if (results.length === 0) {
      console.warn('⚠️ No results from AI, using fallback');
      throw new Error('No valid results from AI');
    }

    return results;
  } catch (error) {
    console.log('ℹ️ AI analysis unavailable, using fallback algorithm');
    throw error; // Let caller handle fallback
  }
}

/**
 * Parse AI response for admission chances
 */
function parseAdmissionResponse(
  aiText: string,
  universities: Array<{ name: string; ranking: number; country: string; category: string }>
): Array<{ universityName: string; probability: number; category: 'SAFETY' | 'TARGET' | 'REACH' | 'DREAM'; reasoning: string }> {
  const results: Array<{ universityName: string; probability: number; category: 'SAFETY' | 'TARGET' | 'REACH' | 'DREAM'; reasoning: string }> = [];
  
  // Remove markdown formatting (**, *, etc)
  const cleanText = aiText.replace(/\*\*/g, '').replace(/\*/g, '');
  
  console.log('🔍 Parsing admission response...');
  console.log('📝 Clean text:', cleanText.substring(0, 500));
  
  const blocks = cleanText.split('---').filter(b => b.trim());
  
  console.log('📦 Total blocks found:', blocks.length);

  for (const block of blocks) {
    try {
      console.log('🔎 Processing block:', block.substring(0, 100));
      
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      
      let universityName = '';
      let probability = 0;
      let category: 'SAFETY' | 'TARGET' | 'REACH' | 'DREAM' = 'TARGET';
      let reasoning = '';
      
      for (const line of lines) {
        if (line.startsWith('UNIVERSITY:')) {
          universityName = line.replace('UNIVERSITY:', '').trim();
        } else if (line.startsWith('PROBABILITY:')) {
          const probStr = line.replace('PROBABILITY:', '').trim().replace('%', '');
          probability = parseInt(probStr) || 0;
        } else if (line.startsWith('CATEGORY:')) {
          const catStr = line.replace('CATEGORY:', '').trim().toUpperCase();
          if (catStr === 'SAFETY' || catStr === 'TARGET' || catStr === 'REACH' || catStr === 'DREAM') {
            category = catStr;
          }
        } else if (line.startsWith('REASONING:')) {
          reasoning = line.replace('REASONING:', '').trim();
        }
      }
      
      // Find matching university
      const matchingUniversity = universities.find(u => 
        universityName.toLowerCase().includes(u.name.toLowerCase()) ||
        u.name.toLowerCase().includes(universityName.toLowerCase())
      );
      
      if (matchingUniversity && probability > 0) {
        console.log('✅ Found match:', matchingUniversity.name, probability);
        results.push({
          universityName: matchingUniversity.name,
          probability,
          category,
          reasoning: reasoning || 'Based on profile analysis'
        });
      } else {
        console.warn('⚠️ No match found for:', universityName, 'probability:', probability);
      }
    } catch (err) {
      console.warn('⚠️ Failed to parse block:', err);
    }
  }
  
  console.log('📊 Final results:', results.length, 'out of', universities.length);

  return results;
}

/**
 * Recalculate admission chance for a specific target university
 */
export async function recalculateTargetUniversityChance(
  university: {
    name: string;
    nameRu?: string;
    rank: number;
    location?: string;
  },
  userProfile: {
    gpa: number;
    ieltsScore?: number;
    satScore?: number;
    achievements?: Array<{ level: string; name: string }>;
  }
): Promise<number> {
  try {
    console.log('🤖 Recalculating admission chance for target university');
    console.log('🎯 University:', university);
    console.log('📊 User profile:', userProfile);

    const achievements = userProfile.achievements || [];
    
    const prompt = `You are an expert university admissions consultant. Calculate the realistic admission probability for this specific university:

STUDENT PROFILE:
- GPA: ${userProfile.gpa.toFixed(2)} / 5.0
${userProfile.ieltsScore ? `- IELTS: ${userProfile.ieltsScore}` : '- IELTS: Not taken'}
${userProfile.satScore ? `- SAT: ${userProfile.satScore}` : '- SAT: Not taken'}
- Achievements: ${achievements.length > 0 ? achievements.map(a => `${a.name} (${a.level})`).join(', ') : 'None'}

TARGET UNIVERSITY:
- Name: ${university.name}
- QS Ranking: #${university.rank}
${university.location ? `- Location: ${university.location}` : ''}

Calculate the admission probability (0-100%) based on:
1. Student's GPA compared to university's typical requirements
2. Test scores (IELTS/SAT) if provided
3. Quality and quantity of achievements
4. University's selectivity based on QS ranking

IMPORTANT RULES:
- Be REALISTIC - don't inflate chances
- Top 10 universities (rank < 10): Usually 5-20% for average students, 20-40% for excellent students
- Top 50 universities (rank < 50): Usually 15-45% for good students, 45-70% for excellent students  
- Top 100 universities (rank < 100): Usually 30-60% for good students, 60-85% for excellent students
- Missing IELTS: Reduce chance by 20-30% for international universities
- Missing SAT: Reduce chance by 15-25% for top US universities
- Strong achievements (international/republic level): Can increase chances by 10-20%

Return ONLY a single number (0-100) representing the probability percentage. No explanation, just the number.`;

    console.log('📤 Sending prompt to Gemini...');
    
    const aiResponse = await generateText(prompt);
    
    console.log('📥 Received AI response:', aiResponse);

    // Parse the number from response
    const probabilityMatch = aiResponse.match(/(\d+(?:\.\d+)?)/);
    if (!probabilityMatch) {
      throw new Error('No probability number found in AI response');
    }

    let probability = parseFloat(probabilityMatch[1]);
    
    // Ensure probability is within 0-100 range
    probability = Math.max(0, Math.min(100, probability));
    
    console.log('✅ Calculated probability:', probability);
    
    return probability;
  } catch (error) {
    console.error('❌ Error recalculating admission chance:', error);
    
    // Fallback calculation
    console.log('ℹ️ Using fallback calculation');
    
    const achievements = userProfile.achievements || [];
    let baseChance = 50;
    
    // Adjust based on GPA
    if (userProfile.gpa >= 4.5) baseChance += 20;
    else if (userProfile.gpa >= 4.0) baseChance += 10;
    else if (userProfile.gpa >= 3.5) baseChance += 0;
    else if (userProfile.gpa >= 3.0) baseChance -= 15;
    else baseChance -= 30;
    
    // Adjust based on university rank
    if (university.rank <= 10) baseChance -= 30;
    else if (university.rank <= 50) baseChance -= 20;
    else if (university.rank <= 100) baseChance -= 10;
    else if (university.rank <= 200) baseChance += 0;
    else baseChance += 10;
    
    // Adjust based on test scores
    if (userProfile.ieltsScore) {
      if (userProfile.ieltsScore >= 7.5) baseChance += 10;
      else if (userProfile.ieltsScore >= 7.0) baseChance += 5;
      else if (userProfile.ieltsScore >= 6.5) baseChance += 0;
      else baseChance -= 10;
    } else {
      baseChance -= 15; // No IELTS penalty
    }
    
    if (userProfile.satScore) {
      if (userProfile.satScore >= 1500) baseChance += 15;
      else if (userProfile.satScore >= 1400) baseChance += 10;
      else if (userProfile.satScore >= 1300) baseChance += 5;
      else if (userProfile.satScore >= 1200) baseChance += 0;
      else baseChance -= 5;
    }
    
    // Adjust based on achievements
    const internationalCount = achievements.filter(a => a.level === 'international').length;
    const republicCount = achievements.filter(a => a.level === 'republic').length;
    const cityCount = achievements.filter(a => a.level === 'city').length;
    
    baseChance += internationalCount * 10;
    baseChance += republicCount * 5;
    baseChance += cityCount * 2;
    
    // Ensure within range
    const finalChance = Math.max(5, Math.min(95, baseChance));
    
    console.log('✅ Fallback probability:', finalChance);
    
    return finalChance;
  }
}