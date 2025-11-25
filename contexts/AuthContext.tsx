import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6738f032`;

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'parent';
  bio: string;
  direction?: string;
  avatar?: string | null;
  country: string;
  city: string;
  tethysPoints: number;
  rank: string;
  booksRead: number;
  linkedStudentId?: string | null;
  targetUniversity?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  activeUserId: string | null;
  signUp: (email: string, password: string, name: string, role: 'student' | 'parent') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  linkStudent: (studentEmail: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedToken = localStorage.getItem('tethys_token');
        const savedUser = localStorage.getItem('tethys_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const activeUserId = user?.role === 'parent' && user?.linkedStudentId
    ? user.linkedStudentId
    : user?.id || null;

  const signUp = async (email: string, password: string, name: string, role: 'student' | 'parent') => {
    try {
      console.log('🔐 Signing up user:', { email, name, role });
      
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Signup failed:', data);
        throw new Error(data.error || 'Sign up failed');
      }

      console.log('✅ Signup successful, signing in...');

      // После успешной регистрации - входим
      await signIn(email, password);
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Signing in user:', email);
      
      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Signin failed:', data);
        throw new Error(data.error || 'Sign in failed');
      }

      console.log('✅ Signin successful:', data);

      // ВАЖНО: Очищаем любые старые токены Supabase
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');

      // Сохраняем токен и пользователя
      const userObj: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        bio: data.user.bio || '',
        direction: data.user.direction || '',
        avatar: data.user.avatar || null,
        country: data.user.country || '',
        city: data.user.city || '',
        tethysPoints: data.user.tethys_points || 0,
        rank: data.user.rank || 'Матрос',
        booksRead: data.user.books_read || 0,
        linkedStudentId: data.user.linked_student_id || null,
        targetUniversity: data.user.target_university || null,
      };

      setToken(data.token);
      setUser(userObj);

      // Сохраняем в localStorage
      localStorage.setItem('tethys_token', data.token);
      localStorage.setItem('tethys_user', JSON.stringify(userObj));
      
      console.log('💾 Token saved:', data.token);
      console.log('💾 User saved:', userObj);
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tethys_token');
    localStorage.removeItem('tethys_user');
  };

  const linkStudent = async (studentEmail: string) => {
    if (!user || user.role !== 'parent') {
      throw new Error('Only parents can link students');
    }

    try {
      const response = await fetch(`${API_BASE}/auth/link-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || publicAnonKey}`,
        },
        body: JSON.stringify({ parentId: user.id, studentEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link student');
      }

      const updatedUser = { ...user, linkedStudentId: data.student.id };
      setUser(updatedUser);
      localStorage.setItem('tethys_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Link student error:', error);
      throw error;
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    const optimisticUser = { ...user, ...data };
    setUser(optimisticUser);
    localStorage.setItem('tethys_user', JSON.stringify(optimisticUser));

    // Обновляем данные с сервера через 500ms
    setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE}/profile/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token || publicAnonKey}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          const fullUser: User = {
            id: user.id,
            email: user.email,
            name: userData.name || '',
            role: userData.role || 'student',
            bio: userData.bio || '',
            direction: userData.direction || '',
            avatar: userData.avatar || null,
            country: userData.country || '',
            city: userData.city || '',
            tethysPoints: userData.tethys_points || 0,
            rank: userData.rank || 'Матрос',
            booksRead: userData.books_read || 0,
            linkedStudentId: userData.linked_student_id || null,
            targetUniversity: userData.target_university || null,
          };
          setUser(fullUser);
          localStorage.setItem('tethys_user', JSON.stringify(fullUser));
        }
      } catch (error) {
        console.error('Error reloading user profile:', error);
      }
    }, 500);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        activeUserId,
        signUp,
        signIn,
        signOut,
        linkStudent,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}