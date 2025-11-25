import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { MessageSquare, Send, Paperclip, Sparkles, Plus, User as UserIcon, BookOpen, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as gemini from '../utils/gemini';
import * as api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function SuperAIPage() {
  const { activeUserId } = useAuth();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: t('superAIGreeting'),
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations] = useState([
    { id: 1, title: t('portfolioAnalysis'), preview: t('whichUniversitiesSuit') },
    { id: 2, title: t('bookHelp'), preview: t('explainDeepWork') },
    { id: 3, title: t('examPreparation'), preview: t('mathStudyPlan') }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const quickActions = [
    { icon: FileText, label: t('portfolioAnalysis'), prompt: t('analyzeMyPortfolio') },
    { icon: BookOpen, label: t('bookAnalysis'), prompt: t('helpWithBook') },
    { icon: Sparkles, label: t('generateIdeas'), prompt: t('helpGenerateIdeas') }
  ];

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Save user message
      if (activeUserId) {
        await api.saveChatMessage({ role: 'user', content: messageToSend });
      }

      // Get AI response
      const aiText = await gemini.getChatResponse(messageToSend);
      
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);

      // Save AI response
      if (activeUserId) {
        await api.saveChatMessage({ role: 'assistant', content: aiText });
      }
    } catch (error: any) {
      console.error('AI response failed:', error);
      
      let errorMessage = 'Извините, произошла ошибка при обработке запроса. ';
      
      // Check if it's an API key error
      if (error?.message?.includes('API key') || error?.message?.includes('configured')) {
        errorMessage += 'API ключ Gemini не настроен. Пожалуйста, добавьте GEMINI_API_KEY в таблицу env_variables.';
      } else if (error?.message?.includes('Failed to generate')) {
        errorMessage += 'Не удалось получить ответ от AI. Проверьте подключение к интернету.';
      } else {
        errorMessage += 'Пожалуйста, попробуйте еще раз.';
      }
      
      const errorResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      toast.error('Ошибка AI: ' + (error?.message || 'Неизвестная ошибка'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
  };

  const startNewChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: 'Новый чат начат. Чем могу помочь?',
        timestamp: new Date()
      }
    ]);
    toast.success('Новый чат создан');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">СуперИИ-ассистент</h1>
        <p className="text-muted-foreground text-lg">
          Умный помощник для учёбы и анализа
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">История чатов</CardTitle>
                <Button size="icon" variant="ghost" onClick={startNewChat}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <p className="text-sm truncate mb-1">{conv.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.preview}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            {/* Header */}
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Чат с ИИ
                  </CardTitle>
                  <CardDescription>Задавайте вопросы и получайте умные ответы</CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini 2.5
                </Badge>
              </div>
            </CardHeader>

            {/* Quick Actions */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleQuickAction(action.prompt)}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          ИИ
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="bg-blue-500 text-white">
                          <UserIcon className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Button variant="outline" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Введите сообщение..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                  disabled={isLoading}
                />
                <Button onClick={handleSend} size="icon" disabled={isLoading}>
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                СуперИИ может допускать ошибки. Проверяйте важную информацию.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}