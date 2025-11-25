import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';

/**
 * Component to check Gemini API key status
 * Компонент для проверки статуса API ключа Gemini
 */
export function GeminiStatusCheck() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Проверка подключения...');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    checkGeminiStatus();
  }, []);

  async function checkGeminiStatus() {
    try {
      const supabase = getSupabaseClient();
      
      console.log('🔍 Checking env table...');
      
      // Try to read from env table
      const { data, error } = await supabase
        .from('env')
        .select('VITE_GEMINI_API_KEY')
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Error fetching env:', error);
        setStatus('error');
        setMessage('Ошибка доступа к таблице env');
        setDetails(
          error.message.includes('relation "env" does not exist')
            ? 'Таблица "env" не существует. Выполните SQL скрипт из файла setup-env-table.sql'
            : `Ошибка: ${error.message}`
        );
        return;
      }

      if (!data?.VITE_GEMINI_API_KEY) {
        console.warn('⚠️ No API key found');
        setStatus('error');
        setMessage('API ключ не найден');
        setDetails('В таблице env нет записи с VITE_GEMINI_API_KEY');
        return;
      }

      const keyPreview = data.VITE_GEMINI_API_KEY.substring(0, 10) + '...';
      console.log('✅ Gemini API key found:', keyPreview);
      
      setStatus('success');
      setMessage('✅ API ключ Gemini найден');
      setDetails(`Ключ: ${keyPreview} | Модель: gemini-2.5-flash`);
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setStatus('error');
      setMessage('Неожиданная ошибка');
      setDetails(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div
      className={`rounded-lg border p-4 ${
        status === 'success'
          ? 'border-blue-500/30 bg-blue-500/10'
          : status === 'error'
          ? 'border-red-500/30 bg-red-500/10'
          : 'border-gray-500/30 bg-gray-500/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
            status === 'success'
              ? 'bg-blue-500/20 text-blue-400'
              : status === 'error'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {status === 'checking' && (
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {status === 'success' && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {status === 'error' && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p
            className={
              status === 'success'
                ? 'text-blue-100'
                : status === 'error'
                ? 'text-red-100'
                : 'text-gray-100'
            }
          >
            {message}
          </p>
          {details && (
            <p className="mt-1 text-sm opacity-70">
              {details}
            </p>
          )}
          {status === 'error' && (
            <div className="mt-3 space-y-2 text-sm">
              <p className="opacity-70">Инструкция по настройке:</p>
              <ol className="ml-4 list-decimal space-y-1 opacity-70">
                <li>Откройте Supabase Dashboard</li>
                <li>Перейдите в SQL Editor</li>
                <li>Выполните скрипт из файла setup-env-table.sql</li>
                <li>Замените YOUR_GEMINI_API_KEY_HERE на ваш ключ</li>
                <li>Перезагрузите страницу</li>
              </ol>
              <a
                href="https://ai.google.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-400 hover:text-blue-300 underline"
              >
                Получить API ключ Gemini →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
