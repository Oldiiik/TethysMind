import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Link2, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { useTranslation } from '../utils/i18n';

export function LinkStudentPage() {
  const navigate = useNavigate();
  const { linkStudent, user } = useAuth();
  const { t } = useTranslation();
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await linkStudent(studentEmail);
      toast.success(t('studentConnectedSuccess'));
      navigate('/portfolio');
    } catch (err: any) {
      setError(err.message || t('failedToConnectStudent'));
      toast.error(err.message || t('failedToConnectStudent'));
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'parent') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-blue-300 dark:border-blue-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Link2 className="w-5 h-5" />
              {t('linkStudent')}
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              {t('enterStudentEmail')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.linkedStudentId ? (
              <div className="space-y-4">
                <Alert className="border-green-400 bg-green-50 dark:bg-green-950/30">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    {t('studentAlreadyConnected')}
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => navigate('/portfolio')}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
                >
                  {t('goToPortfolio')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert className="border-red-400 bg-red-50 dark:bg-red-950/30">
                    <AlertDescription className="text-red-700 dark:text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="studentEmail" className="text-blue-700 dark:text-blue-300">
                    {t('studentEmail')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                    <Input
                      id="studentEmail"
                      type="email"
                      placeholder="student@email.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      required
                      className="pl-10 border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {t('studentMustBeRegistered')}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {t('connecting')}
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      {t('connect')}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  {t('skip')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}