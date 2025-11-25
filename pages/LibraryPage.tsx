import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { BookOpen, Plus, Search, Sparkles, Quote, Lightbulb, Star, Calendar, Upload, FileText, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/i18n';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../utils/api';
import { PDFReader } from '../components/PDFReader';

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  progress: number;
  notes: number;
  dateAdded: string;
  pdfFile?: File;
  pdfUrl?: string;
}

interface Note {
  id: number;
  bookId: number;
  page: number;
  selectedText: string;
  noteText: string;
  position: { x: number; y: number };
  color: string;
  createdAt: string;
}

interface AIInsight {
  id: number;
  book_id: number;
  user_id: string;
  insight_text: string;
  insight_type: string;
  relevance_score: number;
  created_at: string;
}

const COVER_COLORS = [
  { id: 1, gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', name: 'Синий' },
  { id: 2, gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', name: 'Голубой' },
  { id: 3, gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', name: 'Циан' },
  { id: 4, gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', name: 'Индиго' },
  { id: 5, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', name: 'Фиолетовый' },
  { id: 6, gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', name: 'Бирюзовый' },
  { id: 7, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', name: 'Изумрудный' },
  { id: 8, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', name: 'Янтарный' },
  { id: 9, gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', name: 'Красный' },
  { id: 10, gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', name: 'Розовый' },
];

// Helper function to get random color
const getRandomColor = () => {
  return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)].gradient;
};

export function LibraryPage() {
  const { t } = useTranslation();
  const { activeUserId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [loading, setLoading] = useState(true);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  
  // New book form
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState(COVER_COLORS[0].gradient);

  const [books, setBooks] = useState<Book[]>([]);
  const [bookNotes, setBookNotes] = useState<Note[]>([]);
  const [bookInsights, setBookInsights] = useState<AIInsight[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load books from API
  useEffect(() => {
    loadBooks();
  }, []);

  // Load book details when selected
  useEffect(() => {
    if (selectedBook) {
      loadBookDetails(selectedBook.id);
    }
  }, [selectedBook]);

  const loadBookDetails = async (bookId: number) => {
    setLoadingDetails(true);
    try {
      // Load notes
      const notes = await api.getNotes(bookId);
      setBookNotes(notes);

      // Load insights
      const userId = await api.getActiveUserId();
      if (userId) {
        const { projectId } = await import('../utils/supabase/info');
        const { publicAnonKey } = await import('../utils/supabase/info');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6738f032/ai/insights/${userId}/${bookId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-User-Token': localStorage.getItem('tethys_token') || '',
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setBookInsights(data.insights || []);
        }
      }
    } catch (error) {
      console.error('Error loading book details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      console.log('📚 Loading books from API...');
      const data = await api.getBooks();
      console.log('📚 Books loaded from API:', data);
      
      // API returns { books: [...] }, extract the array
      const booksArray = data?.books || [];
      console.log('📚 Books array:', booksArray);
      
      setBooks(Array.isArray(booksArray) ? booksArray : []);
      
      if (booksArray.length === 0) {
        console.log('ℹ️ No books found. Click "Add Book" button to add your first book!');
      } else {
        console.log(`✅ Loaded ${booksArray.length} books successfully`);
      }
    } catch (error) {
      // Only show error if user is logged in
      if (activeUserId) {
        console.error('❌ Error loading books:', error);
        toast.error('Ошибка загрузки книг');
      }
      // Set empty array on error
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = Array.isArray(books) ? books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedPdf(file);
      toast.success('PDF загружен');
    } else {
      toast.error('Пожалуйста, выбери PDF файл');
    }
  };

  const handleAddBook = async () => {
    if (newBookTitle && uploadedPdf) {
      try {
        // First, add book to database to get ID
        const newBookData = {
          title: newBookTitle,
          author: newBookAuthor || 'Неизвестный автор',
          cover: selectedColor,
          progress: 0,
          notes: 0,
        };
        
        const result = await api.addBook(newBookData);
        const newBook = result.book;
        
        // Then upload PDF to Supabase Storage
        toast.info('Загрузка PDF файла...');
        const pdfUrl = await api.uploadPDF(uploadedPdf, newBook.id);
        
        // Update book with PDF URL
        await api.updateBook(newBook.id, { pdfUrl });
        
        setBooks([{ ...newBook, pdfUrl }, ...books]);
        setNewBookTitle('');
        setNewBookAuthor('');
        setUploadedPdf(null);
        setSelectedColor(getRandomColor());
        setShowAddBook(false);
        toast.success('Книга добавлена в библиотеку!');
      } catch (error) {
        console.error('Error adding book:', error);
        toast.error('Ошибка добавления книги');
      }
    } else {
      toast.error('Заполни название и загрузи PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl mb-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                {t('myLibrary')}
              </h1>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {books.length} {books.length === 1 ? t('bookTitle') : t('booksRead')}
              </p>
            </div>
            <Button
              onClick={() => setShowAddBook(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('addBook')}
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder={t('searchByTitleOrAuthor')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 text-gray-700 dark:text-gray-300"
            >
              {t('allBooks')}
            </TabsTrigger>
            <TabsTrigger 
              value="reading" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 text-gray-700 dark:text-gray-300"
            >
              {t('reading')}
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 text-gray-700 dark:text-gray-300"
            >
              {t('completed')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book, index) => (
                <Card
                  key={book.id}
                  className="group cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 bg-white dark:bg-slate-800 backdrop-blur-sm transform hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedBook(book)}
                >
                  <div
                    className="h-48 relative overflow-hidden rounded-t-lg"
                    style={{ background: book.cover }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-4 transition-all duration-300 group-hover:from-black/70">
                      <div className="text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                            {book.progress}%
                          </Badge>
                          <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                            {book.notes} заметок
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 transform group-hover:scale-110 transition-transform duration-200">
                      <Star className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2 text-gray-900 dark:text-gray-100">{book.title}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">{book.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {book.dateAdded}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Book Details */}
            {selectedBook && (
              <Card className="border border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-800 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-500 shadow-lg shadow-violet-500/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div
                        className="w-24 h-32 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
                        style={{ background: selectedBook.cover }}
                      />
                      <div className="space-y-2">
                        <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">{selectedBook.title}</CardTitle>
                        <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                          {selectedBook.author}
                        </CardDescription>
                        <div className="flex gap-2">
                          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                            {selectedBook.progress}% прочитано
                          </Badge>
                          <Badge className="bg-gradient-to-r from-cyan-600 to-sky-600 text-white border-0">
                            {selectedBook.notes} заметок
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transform hover:scale-105 transition-all duration-200"
                      onClick={() => setReadingBook(selectedBook)}
                    >
                      <BookOpen className="w-4 h-4" />
                      {t('open')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="notes" className="w-full">
                    <TabsList className="bg-gray-100 dark:bg-slate-700">
                      <TabsTrigger value="notes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 text-gray-700 dark:text-gray-300">
                        {t('notes')}
                      </TabsTrigger>
                      <TabsTrigger value="insights" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 text-gray-700 dark:text-gray-300">
                        {t('insights')}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="notes" className="space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-gray-900 dark:text-gray-100">{t('recentNotes')}</h4>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transform hover:scale-105 transition-all duration-200"
                          onClick={() => setReadingBook(selectedBook)}
                        >
                          <Plus className="w-3 h-3" />
                          Новая заметка
                        </Button>
                      </div>
                      {loadingDetails ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Загрузка...
                        </div>
                      ) : bookNotes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Нет заметок. Откройте книгу и создайте первую заметку!
                        </div>
                      ) : (
                        bookNotes.slice(0, 5).map((note) => (
                          <Card key={note.id} className="p-4 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] cursor-pointer"
                            onClick={() => setReadingBook(selectedBook)}
                          >
                            <p className="text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                              {note.noteText}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Стр. {note.page}</p>
                          </Card>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-3">
                      {loadingDetails ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Загрузка...
                        </div>
                      ) : bookInsights.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Нет инсайтов. Создайте заметки и сгенерируйте инсайты в PDF-ридере!
                        </div>
                      ) : (
                        bookInsights.slice(0, 5).map((insight) => (
                          <Card key={insight.id} className="p-4 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] cursor-pointer"
                            onClick={() => setReadingBook(selectedBook)}
                          >
                            <div className="flex gap-3">
                              <Lightbulb className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">
                                {insight.insight_text}
                              </p>
                            </div>
                          </Card>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reading">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredBooks.filter(b => b.progress < 100).map((book, index) => (
                <Card 
                  key={book.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 backdrop-blur-sm border-gray-200 dark:border-gray-700 transform hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="h-48" style={{ background: book.cover }}></div>
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{book.title}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">{book.author}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredBooks.filter(b => b.progress === 100).map((book, index) => (
                <Card 
                  key={book.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 backdrop-blur-sm border-gray-200 dark:border-gray-700 transform hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="h-48" style={{ background: book.cover }}></div>
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{book.title}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">{book.author}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Book Modal */}
        <Dialog open={showAddBook} onOpenChange={setShowAddBook}>
          <DialogContent className="max-w-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-300">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Plus className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                {t('addBook')}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {t('uploadPDFChooseColor')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="book-title" className="text-gray-900 dark:text-gray-100">
                  {t('bookTitleLabel')} *
                </Label>
                <Input
                  id="book-title"
                  placeholder={`${t('forExample')}: Sapiens`}
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="book-author" className="text-gray-900 dark:text-gray-100">
                  {t('authorOptional')}
                </Label>
                <Input
                  id="book-author"
                  placeholder={`${t('forExample')}: Yuval Noah Harari`}
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">{t('coverColor')}</Label>
                <div className="grid grid-cols-6 gap-2">
                  {COVER_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.gradient)}
                      className={`w-full h-12 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                        selectedColor === color.gradient 
                          ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 scale-110' 
                          : 'hover:ring-2 hover:ring-blue-400'
                      }`}
                      style={{ background: color.gradient }}
                      title={color.name}
                    >
                      {selectedColor === color.gradient && (
                        <Check className="w-6 h-6 mx-auto text-white drop-shadow-lg" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf-upload" className="text-gray-900 dark:text-gray-100">
                  {t('uploadPDF')} *
                </Label>
                <div className="mt-2">
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 transform hover:scale-[1.02]">
                      {uploadedPdf ? (
                        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                          <FileText className="w-12 h-12 mx-auto text-green-500 dark:text-green-400" />
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                            {uploadedPdf.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(uploadedPdf.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setUploadedPdf(null);
                            }}
                            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-200"
                          >
                            <X className="w-4 h-4 mr-1" />
                            {t('delete')}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 mx-auto text-blue-500 dark:text-blue-400" />
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                            {t('clickToUploadPDF')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('maximum')} 50 MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddBook} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transform hover:scale-105 transition-all duration-200"
                  disabled={!newBookTitle || !uploadedPdf}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addBook')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddBook(false);
                    setNewBookTitle('');
                    setNewBookAuthor('');
                    setUploadedPdf(null);
                    setSelectedColor(COVER_COLORS[0].gradient);
                  }}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Book Reader */}
      {readingBook && readingBook.pdfUrl && (
        <PDFReader
          pdfUrl={readingBook.pdfUrl}
          bookId={readingBook.id}
          bookTitle={readingBook.title}
          onClose={() => setReadingBook(null)}
        />
      )}
    </div>
  );
}