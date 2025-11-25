import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6738f032`;

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

// Helper to convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Get token from localStorage (NEW TOKEN SYSTEM)
  const token = localStorage.getItem('tethys_token');

  console.log('📤 API Request:', {
    endpoint,
    method: options.method || 'GET',
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 30) + '...' : 'none'
  });

  // Convert body to snake_case if present
  let body = options.body;
  if (body && typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      const converted = toSnakeCase(parsed);
      body = JSON.stringify(converted);
    } catch {
      // Keep original body if not JSON
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    body,
    headers: {
      'Content-Type': 'application/json',
      // IMPORTANT: Use anon key for Supabase Functions auth bypass
      'Authorization': `Bearer ${publicAnonKey}`,
      // Our custom token in a separate header
      'X-User-Token': token || '',
      ...options.headers,
    },
  });

  console.log('📥 API Response:', {
    endpoint,
    status: response.status,
    ok: response.ok
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    console.error('❌ API Error:', { endpoint, status: response.status, error });
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  // Convert response to camelCase
  return toCamelCase(data);
}

// Get active user ID (handles parent viewing student data)
export async function getActiveUserId(): Promise<string | null> {
  // Read from localStorage (NEW TOKEN SYSTEM)
  try {
    const savedUser = localStorage.getItem('tethys_user');
    if (!savedUser) return null;
    
    const user = JSON.parse(savedUser);
    
    // If parent with linked student, return student ID, otherwise return user ID
    return user.role === 'parent' && user.linkedStudentId 
      ? user.linkedStudentId 
      : user.id;
  } catch (error) {
    console.error('Error getting active user ID:', error);
    return null;
  }
}

// ============= AUTH =============

export async function signUp(email: string, password: string, name: string, role: 'student' | 'parent') {
  return fetchAPI('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
}

export async function signIn(email: string, password: string) {
  return fetchAPI('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser() {
  return fetchAPI('/auth/me');
}

export async function linkStudent(parentId: string, studentEmail: string) {
  return fetchAPI('/auth/link-student', {
    method: 'POST',
    body: JSON.stringify({ parentId, studentEmail }),
  });
}

// ============= USER PROFILE =============

export async function getProfile(userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/profile/${id}`);
}

export async function updateProfile(data: any, userId?: string) {
  const id = userId || await getActiveUserId();
  
  console.log('📡 ============= API updateProfile =============');
  console.log('📡 User ID:', id);
  console.log('📡 Data to send:', data);
  
  if (!id) {
    console.error('❌ No user ID for updateProfile!');
    throw new Error('No user ID');
  }
  
  // Use API endpoint instead of direct Supabase
  return fetchAPI(`/profile/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Set target university
export async function setTargetUniversity(universityData: {
  name: string;
  nameRu: string;
  nameKk: string;
  location: string;
  locationRu: string;
  locationKk: string;
  rank: number;
  probability: number;
}, userId?: string) {
  const id = userId || await getActiveUserId();
  
  // Only save if user is logged in (no localStorage!)
  if (!id) {
    throw new Error('User must be logged in to save target university');
  }
  
  return fetchAPI(`/profile/${id}`, {
    method: 'POST',
    body: JSON.stringify({ targetUniversity: universityData }),
  });
}

// ============= FRIENDS =============

export async function getFriends(userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/friends/${id}`);
}

export async function addFriend(friend: any, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/friends/${id}/add`, {
    method: 'POST',
    body: JSON.stringify(friend),
  });
}

export async function removeFriend(friendId: string, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/friends/${id}/${friendId}`, {
    method: 'DELETE',
  });
}

// ============= LIBRARY =============

export async function getBooks(userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) {
    // Return empty books object if not logged in
    return { books: [] };
  }
  const result = await fetchAPI(`/books/${id}`);
  
  console.log('📚 getBooks result:', result);
  
  // API now returns { books: [...] }, just return it
  return result;
}

export async function addBook(book: any, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/books/${id}`, {
    method: 'POST',
    body: JSON.stringify(book),
  });
}

export async function updateBook(bookId: number, updates: any, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/books/${id}/${bookId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteBook(bookId: number, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/books/${id}/${bookId}`, {
    method: 'DELETE',
  });
}

// ============= SUPABASE STORAGE =============

export async function uploadPDF(file: File, bookId: number, userId?: string): Promise<string> {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');

  // Get token from localStorage
  const token = localStorage.getItem('tethys_token') || '';

  // Use server endpoint for PDF upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bookId', bookId.toString());

  const response = await fetch(`${API_BASE}/books/${id}/upload-pdf`, {
    method: 'POST',
    headers: {
      // IMPORTANT: Use anon key for Supabase Functions auth bypass
      'Authorization': `Bearer ${publicAnonKey}`,
      // Our custom token in a separate header
      'X-User-Token': token,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    console.error('Error uploading PDF:', error);
    throw new Error(error.error || 'Ошибка загрузки PDF файла');
  }

  const data = await response.json();
  return data.url;
}

export async function getPDFUrl(bookId: number, userId?: string): Promise<string | null> {
  const id = userId || await getActiveUserId();
  if (!id) return null;

  // PDFs are public on Supabase Storage, construct URL directly
  const fileName = `${id}/${bookId}/book.pdf`;
  const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/books-pdf/${fileName}`;

  // Check if file exists by trying to fetch it
  try {
    const response = await fetch(publicUrl, { method: 'HEAD' });
    if (response.ok) {
      return publicUrl;
    }
  } catch (e) {
    console.error('Error checking PDF:', e);
  }

  return null;
}

export async function deletePDF(bookId: number, userId?: string): Promise<void> {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');

  // Get token from localStorage
  const token = localStorage.getItem('tethys_token') || '';

  const response = await fetch(`${API_BASE}/books/${id}/${bookId}/pdf`, {
    method: 'DELETE',
    headers: {
      // IMPORTANT: Use anon key for Supabase Functions auth bypass
      'Authorization': `Bearer ${publicAnonKey}`,
      // Our custom token in a separate header
      'X-User-Token': token,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    console.error('Error deleting PDF:', error);
    throw new Error(error.error || 'Ошибка удаления PDF файла');
  }
}

// ============= PORTFOLIO =============

export async function getPortfolio(userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) {
    // Return empty portfolio if not logged in
    return {
      subjects: [],
      ieltsScore: '',
      satScore: '',
      diplomas: [],
      totalPoints: 0
    };
  }
  return fetchAPI(`/portfolio/${id}`);
}

export async function updatePortfolio(data: any, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/portfolio/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============= LEADERBOARD =============

export async function getGlobalLeaderboard() {
  return fetchAPI('/leaderboard/global');
}

export async function getFriendsLeaderboard(userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/leaderboard/friends/${id}`);
}

// ============= SEARCH =============

export async function searchUsers(query: string) {
  return fetchAPI(`/search/users?q=${encodeURIComponent(query)}`);
}

// ============= SKILLS MAP =============

export async function getSkills(userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/skills/${id}`);
}

export async function updateSkills(data: any, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/skills/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============= ENV VARIABLES =============

export async function getEnv(key: string) {
  return fetchAPI(`/env/${key}`);
}

export async function setEnv(key: string, value: string) {
  return fetchAPI(`/env/${key}`, {
    method: 'POST',
    body: JSON.stringify({ value }),
  });
}

// ============= BOOK NOTES =============

export async function getNotes(bookId: number, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/notes/${id}/${bookId}`);
}

export async function addNote(bookId: number, note: any, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/notes/${id}/${bookId}`, {
    method: 'POST',
    body: JSON.stringify(note),
  });
}

export async function deleteNote(bookId: number, noteId: number, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/notes/${id}/${bookId}/${noteId}`, {
    method: 'DELETE',
  });
}

// ============= AI ANALYSIS =============

export async function getAnalysis(bookId: number, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/ai/analysis/${id}/${bookId}`);
}

export async function saveAnalysis(bookId: number, analysis: any, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/ai/analysis/${id}/${bookId}`, {
    method: 'POST',
    body: JSON.stringify(analysis),
  });
}

// ============= AI CHAT =============

export async function getChatHistory(userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/ai/chat/${id}`);
}

export async function saveChatMessage(message: any, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/ai/chat/${id}`, {
    method: 'POST',
    body: JSON.stringify(message),
  });
}

// ============= AI GEMINI =============

export async function callGemini(prompt: string, model?: string) {
  return fetchAPI('/ai/gemini', {
    method: 'POST',
    body: JSON.stringify({ prompt, model }),
  });
}

// ============= USER SETTINGS =============

export async function getSettings(userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/settings/${id}`);
}

export async function updateSettings(data: any, userId?: string) {
  const id = userId || await getActiveUserId();
  if (!id) throw new Error('No user ID');
  return fetchAPI(`/settings/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}