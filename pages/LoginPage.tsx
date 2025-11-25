import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { LogIn, Mail, Lock, Waves } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { useTranslation } from '../utils/i18n';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success(t('welcomeBack'));
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t('loginError'));
      toast.error(err.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4 relative">
      {/* Theme and Language Switchers */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              TethysMind
            </h1>
          </div>
          <p className="text-blue-600 dark:text-blue-400">
            {t('oceanOfUnlimitedGrowth')}
          </p>
        </div>

        <Card className="border-2 border-blue-300 dark:border-blue-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <LogIn className="w-5 h-5" />
              {t('login')}
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              {t('signInToAccount')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-400 bg-red-50 dark:bg-red-950/30">
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-700 dark:text-blue-300">
                  {t('email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 border-blue-300 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-700 dark:text-blue-300">
                  {t('password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 border-blue-300 focus:border-blue-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('signingIn')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    {t('signInButton')}
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-blue-600 dark:text-blue-400">
                {t('noAccount')}{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-700 dark:text-blue-300 hover:underline"
                >
                  {t('signUpButton')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}