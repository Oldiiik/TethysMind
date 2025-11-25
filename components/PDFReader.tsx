import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf@9.1.1';
import 'react-pdf@9.1.1/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf@9.1.1/dist/esm/Page/TextLayer.css';
import { Button } from './ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  X,
  StickyNote,
  BookOpen,
  Highlighter,
  Trash2,
  ArrowLeft,
  Sparkles,
  Lightbulb,
  Key,
  FileText,
  HelpCircle,
  Link as LinkIcon
} from 'lucide-react';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Note {
  id: number;
  bookId: number;
  page: number;
  selectedText: string;
  noteText: string;
  position: {
    x: number;
    y: number;
  };
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

interface PDFReaderProps {
  pdfUrl: string;
  bookId: number;
  bookTitle: string;
  onClose: () => void;
}

export function PDFReader({ pdfUrl, bookId, bookTitle, onClose }: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.1);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [highlightColor, setHighlightColor] = useState('#FFD700');
  const [loading, setLoading] = useState(true);
  const [showNotesSidebar, setShowNotesSidebar] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showNoteButton, setShowNoteButton] = useState(false);
  const [noteButtonPosition, setNoteButtonPosition] = useState({ x: 0, y: 0 });
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotes();
    loadInsights();
    
    // Detect dark theme
    const checkTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, [bookId]);

  const loadNotes = async () => {
    try {
      const loadedNotes = await api.getNotes(bookId);
      // Remove duplicates by ID
      const uniqueNotes = Array.from(
        new Map(loadedNotes.map((note: Note) => [note.id, note])).values()
      );
      setNotes(uniqueNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const userId = await api.getActiveUserId();
      if (!userId) return;
      
      const response = await fetch(
        `https://${(await import('../utils/supabase/info')).projectId}.supabase.co/functions/v1/make-server-6738f032/ai/insights/${userId}/${bookId}`,
        {
          headers: {
            'Authorization': `Bearer ${(await import('../utils/supabase/info')).publicAnonKey}`,
            'X-User-Token': localStorage.getItem('tethys_token') || '',
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const generateInsights = async () => {
    if (notes.length === 0) {
      toast.error('Добавьте заметки для генерации инсайтов');
      return;
    }
    
    setGeneratingInsights(true);
    try {
      const userId = await api.getActiveUserId();
      if (!userId) throw new Error('No user ID');
      
      const response = await fetch(
        `https://${(await import('../utils/supabase/info')).projectId}.supabase.co/functions/v1/make-server-6738f032/ai/insights/${userId}/${bookId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await import('../utils/supabase/info')).publicAnonKey}`,
            'X-User-Token': localStorage.getItem('tethys_token') || '',
          },
          body: JSON.stringify({ bookId })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ AI Insights API Error:', error);
        throw new Error(error.error || 'Failed to generate insights');
      }
      
      const data = await response.json();
      setInsights(data.insights || []);
      toast.success(`Сгенерировано ${data.count} инсайтов!`);
      setShowInsights(true);
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Ошибка генерации инсайтов: ' + (error as Error).message);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.min(Math.max(1, newPage), numPages);
    });
  };

  const changeScale = (delta: number) => {
    setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 2.5));
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      setSelectedText(text);
      
      // Get selection position
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      
      if (rect) {
        setNoteButtonPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + window.scrollY + 10
        });
        setShowNoteButton(true);
      }
    } else {
      setShowNoteButton(false);
    }
  };
  
  const handleCreateNote = () => {
    setShowNoteButton(false);
    setShowNoteDialog(true);
  };

  const handleSaveNote = async () => {
    if (!selectedText || !noteText) {
      toast.error('Заполните все поля');
      return;
    }

    try {
      const newNote = {
        bookId,
        page: pageNumber,
        selectedText,
        noteText,
        position: { x: 0, y: 0 },
        color: highlightColor
      };

      await api.addNote(bookId, newNote);
      toast.success('Заметка сохранена!');
      
      await loadNotes();
      setShowNoteDialog(false);
      setSelectedText('');
      setNoteText('');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Ошибка сохранения');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await api.deleteNote(bookId, noteId);
      toast.success('Заметка удалена');
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Ошибка удаления');
    }
  };

  const goToNotePage = (page: number) => {
    setPageNumber(page);
    setShowNotesSidebar(false);
  };

  const colors = [
    { name: 'Gold', value: '#FFD700' },
    { name: 'Yellow', value: '#FFEB3B' },
    { name: 'Green', value: '#4CAF50' },
    { name: 'Blue', value: '#2196F3' },
    { name: 'Purple', value: '#9C27B0' },
    { name: 'Pink', value: '#E91E63' },
  ];

  const pageNotes = notes.filter(note => note.page === pageNumber);
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'key_concept': return <Key className="size-6 text-amber-400" />;
      case 'summary': return <FileText className="size-6 text-blue-400" />;
      case 'question': return <HelpCircle className="size-6 text-red-400" />;
      case 'connection': return <LinkIcon className="size-6 text-green-400" />;
      default: return <Lightbulb className="size-6 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <div className="h-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <ArrowLeft className="size-5 mr-2" />
            Назад
          </Button>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
          <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />
          <h1 className="font-medium text-gray-900 dark:text-gray-100">{bookTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeScale(-0.1)}
              disabled={scale <= 0.5}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeScale(0.1)}
              disabled={scale >= 2.5}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              <ZoomIn className="size-4" />
            </Button>
          </div>

          {/* AI Insights Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInsights(!showInsights)}
            className="relative hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          >
            <Sparkles className="size-5 mr-2" />
            AI Инсайты
            {insights.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 dark:bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {insights.length}
              </span>
            )}
          </Button>

          {/* Notes Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotesSidebar(!showNotesSidebar)}
            className="relative hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <StickyNote className="size-5 mr-2" />
            Заметки
            {notes.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notes.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-900 dark:to-slate-800">
          <div className="flex flex-col items-center py-8">
            <div 
              ref={containerRef}
              onMouseUp={handleTextSelection}
              className="shadow-2xl rounded-lg overflow-hidden bg-white dark:bg-slate-800"
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-[800px] w-[600px] bg-white dark:bg-slate-800">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                      <p className="text-gray-900 dark:text-gray-100">Загрузка PDF...</p>
                    </div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-[800px] w-[600px] bg-white dark:bg-slate-800">
                    <p className="text-red-600 dark:text-red-400">Ошибка загрузки PDF</p>
                  </div>
                }
              >
                <div 
                  style={{
                    filter: isDarkTheme 
                      ? 'invert(0.9) hue-rotate(180deg)' 
                      : 'none',
                    transition: 'filter 0.3s ease',
                    imageRendering: 'crisp-edges',
                    WebkitFontSmoothing: 'antialiased',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                  }}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </div>
              </Document>
            </div>

            {/* Page Navigation */}
            {!loading && (
              <div className="mt-6 flex items-center gap-4 bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                  className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    Страница {pageNumber}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">из</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{numPages}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= numPages}
                  className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            )}

            {/* Page Notes Display */}
            {pageNotes.length > 0 && (
              <div className="mt-6 w-[600px] space-y-3">
                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <StickyNote className="size-4" />
                  <span className="text-sm font-medium">
                    Заметки ({pageNotes.length})
                  </span>
                </div>
                {pageNotes.map(note => (
                  <div
                    key={note.id}
                    className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-md border-l-4"
                    style={{ borderLeftColor: note.color }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                          {note.selectedText}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">{note.noteText}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 p-0 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Insights Sidebar */}
        {showInsights && (
          <div className="w-96 bg-slate-900 border-l border-purple-500/30 overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-violet-600 p-4 z-10 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="size-5" />
                  <h2 className="font-medium text-lg">AI Инсайты</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInsights(false)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {insights.length === 0 && (
                <div className="text-center py-12">
                  <Lightbulb className="size-16 mx-auto mb-4 text-violet-400/50" />
                  <p className="text-slate-300 mb-6 text-lg">
                    Нет инсайтов
                  </p>
                  <Button
                    onClick={generateInsights}
                    disabled={generatingInsights || notes.length === 0}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 transition-all duration-200"
                  >
                    {generatingInsights ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Генерация...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        Генерировать инсайты
                      </>
                    )}
                  </Button>
                  {notes.length === 0 && (
                    <p className="text-xs text-slate-500 mt-4">
                      Добавьте заметки для генерации инсайтов
                    </p>
                  )}
                </div>
              )}

              {insights.length > 0 && (
                <>
                  <Button
                    onClick={generateInsights}
                    disabled={generatingInsights}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white mb-2 shadow-lg shadow-violet-500/20 transition-all duration-200"
                  >
                    {generatingInsights ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Генерация...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        Обновить инсайты
                      </>
                    )}
                  </Button>

                  {insights.map((insight, index) => (
                    <div
                      key={insight.id}
                      className="bg-slate-800 rounded-xl p-5 shadow-md border border-slate-700 hover:border-violet-500/50 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 mt-1">
                          {getInsightIcon(insight.insight_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-violet-400 font-medium mb-2 uppercase tracking-wide">
                            {insight.insight_type === 'key_concept' && 'Ключевая концепция'}
                            {insight.insight_type === 'summary' && 'Краткое изложение'}
                            {insight.insight_type === 'question' && 'Вопрос'}
                            {insight.insight_type === 'connection' && 'Связь'}
                            {insight.insight_type === 'general' && 'Общий инсайт'}
                          </div>
                          <p className="text-slate-200 text-sm leading-relaxed">
                            {insight.insight_text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Notes Sidebar */}
        {showNotesSidebar && (
          <div className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote className="size-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="font-medium text-gray-900 dark:text-gray-100">Заметки</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotesSidebar(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <StickyNote className="size-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Нет заметок</p>
                  <p className="text-xs mt-2">Выделите текст для создания</p>
                </div>
              ) : (
                notes.map(note => (
                  <div
                    key={note.id}
                    className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    onClick={() => goToNotePage(note.page)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Страница {note.page}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="h-6 w-6 p-0 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 line-clamp-2">
                      {note.selectedText}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">
                      {note.noteText}
                    </p>
                    <div 
                      className="h-1 w-full rounded-full mt-2"
                      style={{ backgroundColor: note.color }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Note Dialog */}
      {showNoteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <Highlighter className="size-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Добавить заметку</h3>
            </div>

            {/* Selected Text */}
            <div className="mb-4">
              <label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                Выделенный текст
              </label>
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-900 dark:text-gray-100 italic">{selectedText}</p>
              </div>
            </div>

            {/* Highlight Color */}
            <div className="mb-4">
              <label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                Цвет маркера
              </label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setHighlightColor(color.value)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      highlightColor === color.value
                        ? 'border-blue-600 dark:border-blue-400 scale-110'
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Note Text */}
            <div className="mb-6">
              <label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                Ваша заметка
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Напишите заметку..."
                className="w-full h-32 p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowNoteDialog(false);
                  setSelectedText('');
                  setNoteText('');
                }}
                variant="outline"
                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <StickyNote className="size-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Note Button */}
      {showNoteButton && (
        <Button
          className="fixed z-50 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl border-2 border-white dark:border-slate-700 animate-in fade-in zoom-in duration-200"
          size="sm"
          style={{
            left: `${noteButtonPosition.x}px`,
            top: `${noteButtonPosition.y}px`,
            transform: 'translate(-50%, 0)'
          }}
          onClick={handleCreateNote}
        >
          <StickyNote className="size-4 mr-2" />
          Создать заметку
        </Button>
      )}
    </div>
  );
}