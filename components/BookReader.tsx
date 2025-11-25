import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookmarkPlus, 
  StickyNote, 
  ZoomIn, 
  ZoomOut,
  Highlighter,
  Quote,
  Trash2,
  Save,
  FileText,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Document, Page, pdfjs } from 'react-pdf';
import { useTranslation } from '../utils/i18n';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Note {
  id: string;
  page: number;
  text: string;
  highlight?: string;
  timestamp: string;
}

interface BookReaderProps {
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  onClose: () => void;
  onProgressUpdate?: (progress: number) => void;
  onNotesUpdate?: (notes: Note[]) => void;
  initialPage?: number;
  pdfFile?: File | string;
}

export function BookReader({ 
  bookId, 
  bookTitle, 
  bookAuthor, 
  onClose,
  onProgressUpdate,
  onNotesUpdate,
  initialPage = 1,
  pdfFile
}: BookReaderProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showNotesSidebar, setShowNotesSidebar] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load PDF file
  useEffect(() => {
    const loadPDF = async () => {
      if (pdfFile) {
        if (typeof pdfFile === 'string') {
          setPdfUrl(pdfFile);
        } else {
          // Convert File to URL
          const url = URL.createObjectURL(pdfFile);
          setPdfUrl(url);
          return () => URL.revokeObjectURL(url);
        }
      } else {
        // Try to load from Supabase Storage
        try {
          const url = await import('../utils/api').then(api => api.getPDFUrl(bookId));
          if (url) {
            setPdfUrl(url);
          } else {
            setHasError(true);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error loading PDF from storage:', error);
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadPDF();
  }, [pdfFile, bookId]);

  // Load notes from localStorage
  useEffect(() => {
    const storedNotes = localStorage.getItem(`tethysmind_book_notes_${bookId}`);
    if (storedNotes) {
      try {
        setNotes(JSON.parse(storedNotes));
      } catch (e) {
        console.error('Error loading notes:', e);
      }
    }
  }, [bookId]);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(`tethysmind_book_notes_${bookId}`, JSON.stringify(notes));
    }
  }, [notes, bookId]);

  useEffect(() => {
    // Update progress when page changes
    if (totalPages > 0) {
      const progress = Math.round((currentPage / totalPages) * 100);
      onProgressUpdate?.(progress);
    }
  }, [currentPage, totalPages, onProgressUpdate]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setIsLoading(false);
    setHasError(false);
    toast.success(`${t('bookLoaded')}: ${numPages} ${t('pages')}`);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    setHasError(true);
    toast.error(t('errorLoadingPDF'));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleZoomIn = () => {
    if (zoom < 2.0) {
      setZoom(prev => Math.min(prev + 0.1, 2.0));
    }
  };

  const handleZoomOut = () => {
    if (zoom > 0.5) {
      setZoom(prev => Math.max(prev - 0.1, 0.5));
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      setSelectedText(text);
      setShowNoteDialog(true);
    }
  };

  const handleSaveNote = () => {
    if (currentNote.trim() || selectedText.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        page: currentPage,
        text: currentNote.trim(),
        highlight: selectedText.trim() || undefined,
        timestamp: new Date().toLocaleString('ru-RU'),
      };
      
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      onNotesUpdate?.(updatedNotes);
      
      setCurrentNote('');
      setSelectedText('');
      setShowNoteDialog(false);
      toast.success(t('noteAdded'));
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    onNotesUpdate?.(updatedNotes);
    toast.success(t('noteDeleted'));
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setShowNotesSidebar(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/90 backdrop-blur-sm border-b border-blue-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-blue-900/30"
          >
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-white font-semibold text-lg">{bookTitle}</h2>
            <p className="text-blue-300 text-sm">{bookAuthor}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {totalPages > 0 && (
            <Badge variant="outline" className="text-white border-blue-400">
              {t('page')} {currentPage} / {totalPages}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotesSidebar(!showNotesSidebar)}
            className="text-white border-blue-400 hover:bg-blue-900/30"
          >
            <StickyNote className="w-4 h-4 mr-2" />
            {t('notes')} ({notes.length})
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Book Content */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto p-8 bg-gradient-to-br from-slate-800/50 to-blue-900/30">
          {hasError ? (
            <Card className="w-full max-w-2xl bg-slate-800/90 border-red-500/50">
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl text-white mb-2">{t('pdfNotFound')}</h3>
                <p className="text-blue-300 mb-6">
                  {t('toReadBook')}
                </p>
                <Button onClick={onClose} variant="outline" className="border-blue-400 text-white">
                  {t('backToLibrary')}
                </Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card className="w-full max-w-2xl bg-slate-800/90 border-blue-500/50">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl text-white mb-2">{t('loadingPDF')}</h3>
                <p className="text-blue-300">{t('pleaseWait')}</p>
              </CardContent>
            </Card>
          ) : (
            <div 
              ref={contentRef}
              className="w-full flex flex-col items-center"
              onMouseUp={handleTextSelection}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="text-white text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                    <p>Загрузка документа...</p>
                  </div>
                }
                error={
                  <div className="text-red-400 text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p>Ошибка загрузки PDF</p>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={zoom}
                  className="shadow-2xl"
                  loading={
                    <div className="w-full h-[800px] bg-white flex items-center justify-center">
                      <div className="text-gray-400">Загрузка страницы...</div>
                    </div>
                  }
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          )}

          {/* Navigation Controls */}
          {!hasError && totalPages > 0 && (
            <div className="mt-8 flex items-center gap-4 bg-slate-800/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="text-white hover:bg-blue-900/30 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Input
                type="number"
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-20 text-center bg-slate-700 border-blue-600 text-white"
                min={1}
                max={totalPages}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="text-white hover:bg-blue-900/30 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              <div className="w-px h-6 bg-blue-600 mx-2" />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="text-white hover:bg-blue-900/30 disabled:opacity-30"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <span className="text-white text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 2.0}
                className="text-white hover:bg-blue-900/30 disabled:opacity-30"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-blue-600 mx-2" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNoteDialog(true)}
                className="text-white hover:bg-blue-900/30"
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Заметка
              </Button>
            </div>
          )}
        </div>

        {/* Notes Sidebar */}
        {showNotesSidebar && (
          <div className="w-96 bg-slate-800/90 backdrop-blur-sm border-l border-blue-800 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Мои заметки</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotesSidebar(false)}
                  className="text-white hover:bg-blue-900/30"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {notes.length === 0 ? (
                  <p className="text-blue-300 text-sm text-center py-8">
                    У тебя пока нет заметок
                  </p>
                ) : (
                  notes.map((note) => (
                    <Card key={note.id} className="bg-slate-700/50 border-blue-700 hover:border-blue-500 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs text-blue-300 border-blue-500">
                                Стр. {note.page}
                              </Badge>
                              <span className="text-xs text-blue-400">{note.timestamp}</span>
                            </div>
                            
                            {note.highlight && (
                              <div className="mb-2 p-2 bg-yellow-500/20 border-l-2 border-yellow-500 rounded">
                                <Quote className="w-3 h-3 text-yellow-500 mb-1" />
                                <p className="text-sm text-yellow-100 italic">"{note.highlight}"</p>
                              </div>
                            )}
                            
                            {note.text && (
                              <p className="text-sm text-blue-100">{note.text}</p>
                            )}
                          </div>
                          
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => goToPage(note.page)}
                              className="h-8 w-8 p-0 text-blue-300 hover:bg-blue-900/30"
                            >
                              <BookmarkPlus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="h-8 w-8 p-0 text-red-400 hover:bg-red-900/30"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Note Dialog */}
      {showNoteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-800 border-blue-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5" />
                Новая заметка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedText && (
                <div className="p-3 bg-yellow-500/20 border-l-2 border-yellow-500 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Highlighter className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-300">Выделенный текст:</span>
                  </div>
                  <p className="text-sm text-yellow-100 italic">"{selectedText}"</p>
                </div>
              )}

              <div>
                <label className="text-sm text-blue-300 mb-2 block">
                  Твои мысли (необязательно):
                </label>
                <Textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Напиши что думаешь об этом..."
                  className="bg-slate-700 border-blue-600 text-white placeholder:text-blue-400 min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveNote}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500"
                  disabled={!currentNote.trim() && !selectedText.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNoteDialog(false);
                    setCurrentNote('');
                    setSelectedText('');
                  }}
                  className="border-blue-600 text-white hover:bg-blue-900/30"
                >
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}