import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Sparkles, Quote, Lightbulb, Tag, Upload, Plus, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as gemini from '../utils/gemini';
import * as api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface Note {
  id: number;
  text: string;
  highlight?: string;
}

export function BookNotesPage() {
  const { activeUserId } = useAuth();
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookText, setBookText] = useState('');
  const [bookId] = useState(Date.now()); // For this session
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const mockInsights = {
    summary: 'Книга исследует концепцию "глубокой работы" - способности фокусироваться без отвлечений на когнитивно сложных задачах. Автор утверждает, что эта способность становится всё более редкой и ценной в современной экономике знаний.',
    keyIdeas: [
      'Глубокая работа редка и ценна в современном мире',
      'Постоянные отвлечения разрушают способность концентрироваться',
      'Необходимо создавать ритуалы и структуру для глубокой работы',
      'Отдых и восстановление критически важны для продуктивности'
    ],
    quotes: [
      'Способность к глубокой концентрации - суперсила XXI века',
      'Лучшие моменты обычно происходят, когда тело или разум напряжены до предела',
      'Кто умеет быстро осваивать сложные вещи - тот будет процветать'
    ],
    themes: ['Продуктивность', 'Концентрация', 'Фокус', 'Когнитивные способности', 'Саморазвитие']
  };

  useEffect(() => {
    const loadData = async () => {
      if (activeUserId && bookId) {
        try {
          const [notesData, analysisData] = await Promise.all([
            api.getNotes(bookId, activeUserId),
            api.getAnalysis(bookId, activeUserId),
          ]);
          if (notesData) setNotes(notesData);
          if (analysisData) {
            setInsights(analysisData);
            setShowInsights(true);
          }
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      }
    };
    loadData();
  }, [activeUserId, bookId]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
    }
  };

  const addNote = async () => {
    if (currentNote.trim()) {
      const newNote: Note = {
        id: Date.now(),
        text: currentNote,
        highlight: selectedText || undefined
      };
      setNotes([...notes, newNote]);
      setCurrentNote('');
      setSelectedText('');
      toast.success(t('noteAdded'));

      // Save to database
      if (activeUserId) {
        try {
          await api.addNote(bookId, newNote, activeUserId);
        } catch (error) {
          console.error('Failed to save note:', error);
        }
      }
    }
  };

  const deleteNote = async (noteId: number) => {
    setNotes(notes.filter(n => n.id !== noteId));
    if (activeUserId) {
      try {
        await api.deleteNote(bookId, noteId, activeUserId);
        toast.success(t('noteDeleted'));
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const generateInsights = async () => {
    if (!bookText.trim()) {
      toast.error('Добавьте текст книги');
      return;
    }
    if (!bookTitle.trim()) {
      toast.error('Введите название книги');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await gemini.analyzeBook(bookTitle, bookAuthor || 'Неизвестный автор', bookText);
      setInsights(analysis);
      setShowInsights(true);
      toast.success('ИИ-анализ готов!');

      // Save analysis
      if (activeUserId) {
        await api.saveAnalysis(bookId, analysis, activeUserId);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Ошибка анализа. Используем примерные данные.');
      setInsights(mockInsights);
      setShowInsights(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const mockInsights = {
    summary: 'Книга исследует концепцию "глубокой работы" - способности фокусироваться без отвлечений на когнитивно сложных задачах.',
    keyIdeas: [
      'Глубокая работа редка и ценна в современном мире',
      'Постоянные отвлечения разрушают способность концентрироваться',
    ],
    quotes: [
      'Способность к глубокой концентрации - суперсила XXI века',
    ],
    themes: ['Продуктивность', 'Концентрация']
  };

  const displayInsights = insights || mockInsights;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Умные заметки по книгам</h1>
        <p className="text-muted-foreground text-lg">
          Делайте заметки и получайте ИИ-генерацию инсайтов
        </p>
      </div>

      {/* Book Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Информация о книге</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Название книги</Label>
              <Input
                id="title"
                placeholder="Deep Work"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="author">Автор</Label>
              <Input
                id="author"
                placeholder="Cal Newport"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Загрузить PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Загрузить EPUB
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Book Text */}
          <Card>
            <CardHeader>
              <CardTitle>Текст книги</CardTitle>
              <CardDescription>Выделяйте текст для создания заметок</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Вставьте или введите текст книги..."
                rows={12}
                value={bookText}
                onChange={(e) => setBookText(e.target.value)}
                onMouseUp={handleTextSelection}
                className="font-serif resize-none"
              />
              {selectedText && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
                  <p className="text-sm mb-1">Выделенный текст:</p>
                  <p className="text-sm italic">"{selectedText}"</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={generateInsights} className="w-full gap-2" size="lg" disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Анализирую...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Сгенерировать ИИ-анализ
              </>
            )}
          </Button>

          {/* AI Insights */}
          {showInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  ИИ-анализ книги
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">Краткое</TabsTrigger>
                    <TabsTrigger value="ideas">Идеи</TabsTrigger>
                    <TabsTrigger value="quotes">Цитаты</TabsTrigger>
                    <TabsTrigger value="themes">Темы</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground">{displayInsights.summary}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="ideas" className="mt-4 space-y-3">
                    {displayInsights.keyIdeas.map((idea: string, index: number) => (
                      <div key={index} className="flex gap-3 p-3 bg-muted rounded-lg">
                        <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <p>{idea}</p>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="quotes" className="mt-4 space-y-3">
                    {displayInsights.quotes.map((quote: string, index: number) => (
                      <div key={index} className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                        <Quote className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="italic">"{quote}"</p>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="themes" className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {displayInsights.themes.map((theme: string, index: number) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          <Tag className="w-3 h-3" />
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Notes */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Мои заметки
              </CardTitle>
              <CardDescription>{notes.length} заметок</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Напишите заметку..."
                  rows={4}
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                />
                <Button onClick={addNote} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Добавить заметку
                </Button>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                {notes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Заметок пока нет</p>
                    <p className="text-xs mt-1">Создайте первую!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="p-3 bg-muted rounded-lg space-y-2 group relative">
                        {note.highlight && (
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-xs italic">
                            "{note.highlight}"
                          </div>
                        )}
                        <p className="text-sm">{note.text}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
