import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Feather,
  Lock,
  LogOut,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { POEM_CATEGORIES, POEM_LANGUAGES } from '../data/poemsIndex';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type {
  BookPublication,
  BookSection,
  CatalogPayload,
  JournalPost,
  LiteraryLanguage,
  PoemCategory,
  PoemEntry,
  PoemLanguage,
} from '../types/literary';

type StudioTab = 'books' | 'poems' | 'journal';

interface AuthStatusResponse {
  authenticated: boolean;
  needsSetup: boolean;
}

const BOOK_SECTIONS: { value: BookSection; label: string }[] = [
  { value: 'novels', label: 'Novels' },
  { value: 'theatre', label: 'Theatre' },
  { value: 'poetry-collections', label: 'Poetry Collections' },
  { value: 'special-editions', label: 'Special Editions' },
];

const LITERARY_LANGUAGES: LiteraryLanguage[] = ['मराठी', 'हिंदी', 'English', 'Hinglish'];

export function AuthorStudioPage() {
  useDocumentMeta(
    'Author Studio',
    'Private publishing archive studio for Tejas Purvesh Phirake.'
  );

  const { refreshCatalog } = useCatalog();

  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [cmsCatalog, setCmsCatalog] = useState<CatalogPayload | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>('books');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Book form / editor state
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookSubtitle, setBookSubtitle] = useState('');
  const [bookSection, setBookSection] = useState<BookSection>('novels');
  const [bookEditionLabel, setBookEditionLabel] = useState('');
  const [bookEditionGroup, setBookEditionGroup] = useState('');
  const [bookLanguage, setBookLanguage] = useState<LiteraryLanguage>('मराठी');
  const [bookGenre, setBookGenre] = useState('Literary Fiction');
  const [bookPageCount, setBookPageCount] = useState<number>(1);
  const [bookPdfUrl, setBookPdfUrl] = useState('');
  const [bookOriginalFilename, setBookOriginalFilename] = useState('');
  const [bookCustomCoverUrl, setBookCustomCoverUrl] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [bookPublished, setBookPublished] = useState(true);
  const [bookFeatured, setBookFeatured] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<'pdf' | 'cover' | 'audio' | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Poem form / editor state
  const [showPoemForm, setShowPoemForm] = useState(false);
  const [editingPoemId, setEditingPoemId] = useState<string | null>(null);
  const [poemTitle, setPoemTitle] = useState('');
  const [poemEnglishSubtitle, setPoemEnglishSubtitle] = useState('');
  const [poemBody, setPoemBody] = useState('');
  const [poemLanguage, setPoemLanguage] = useState<PoemLanguage>('मराठी');
  const [poemCategory, setPoemCategory] = useState<PoemCategory>('विरह');
  const [poemDateLabel, setPoemDateLabel] = useState('');
  const [poemSourceTitle, setPoemSourceTitle] = useState('BENIYAAZ.ROOH');
  const [poemDedication, setPoemDedication] = useState('');
  const [poemSongTitle, setPoemSongTitle] = useState('');
  const [poemSongUrl, setPoemSongUrl] = useState('');
  const [poemAudioUrl, setPoemAudioUrl] = useState('');
  const [poemAudioDuration, setPoemAudioDuration] = useState('');
  const [poemPublished, setPoemPublished] = useState(true);
  const [poemFeatured, setPoemFeatured] = useState(false);

  // Journal form / editor state
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalExcerpt, setJournalExcerpt] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalSourceLabel, setJournalSourceLabel] = useState(
    'Author Reflection · TEJAS · BENIYAAZ.ROOH'
  );
  const [journalLanguage, setJournalLanguage] = useState<LiteraryLanguage>('English');
  const [journalRelatedBookSlug, setJournalRelatedBookSlug] = useState('');
  const [journalPublished, setJournalPublished] = useState(true);

  const notifySuccess = (msg: string) => {
    setErrorBanner(null);
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  const loadCmsCatalog = async () => {
    const res = await fetch('/api/cms/catalog');
    if (res.ok) {
      const data = (await res.json()) as CatalogPayload;
      setCmsCatalog(data);
    } else if (res.status === 401) {
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/cms/status');
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) {
          const data = (await res.json()) as AuthStatusResponse;
          setAuthenticated(data.authenticated);
          setNeedsSetup(data.needsSetup);
          if (data.authenticated) {
            await loadCmsCatalog();
          }
        } else {
          setAuthError(
            'Author Studio CMS requires the Express server backend (static Firebase Hosting serves the public archive only).'
          );
        }
      } catch {
        setAuthError('Unable to reach author studio endpoint.');
      } finally {
        setAuthLoading(false);
      }
    };
    void checkStatus();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (needsSetup) {
      if (passphrase.trim().length < 6) {
        setAuthError('Passphrase must be at least 6 characters.');
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setAuthError('Passphrases do not match.');
        return;
      }
    }

    setAuthSubmitting(true);
    try {
      const endpoint = needsSetup ? '/api/cms/setup' : '/api/cms/auth';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });
      const data = (await res.json()) as {
        authenticated?: boolean;
        needsSetup?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }
      setAuthenticated(true);
      setNeedsSetup(false);
      setPassphrase('');
      setConfirmPassphrase('');
      await loadCmsCatalog();
    } catch {
      setAuthError('Network error while authenticating.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/cms/logout', { method: 'POST' });
    setAuthenticated(false);
    setCmsCatalog(null);
  };

  const handleFileUpload = async (
    file: File,
    kind: 'pdf' | 'cover' | 'audio'
  ) => {
    setUploadingFile(kind);
    setErrorBanner(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData,
      });
      const data = (await res.json()) as {
        url?: string;
        originalFilename?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setErrorBanner(data.error || 'File upload failed.');
        return;
      }
      if (kind === 'pdf') {
        setBookPdfUrl(data.url);
        if (!bookOriginalFilename) {
          setBookOriginalFilename(data.originalFilename || file.name);
        }
        notifySuccess(`Uploaded PDF: ${file.name}`);
      } else if (kind === 'audio') {
        setPoemAudioUrl(data.url);
        notifySuccess(`Uploaded audio recording: ${file.name}`);
      } else {
        setBookCustomCoverUrl(data.url);
        notifySuccess(`Uploaded cover image: ${file.name}`);
      }
    } catch {
      setErrorBanner('Error uploading file.');
    } finally {
      setUploadingFile(null);
    }
  };

  const resetBookForm = () => {
    setShowBookForm(false);
    setEditingBookId(null);
    setBookTitle('');
    setBookSubtitle('');
    setBookSection('novels');
    setBookEditionLabel('');
    setBookEditionGroup('');
    setBookLanguage('मराठी');
    setBookGenre('Literary Fiction');
    setBookPageCount(1);
    setBookPdfUrl('');
    setBookOriginalFilename('');
    setBookCustomCoverUrl('');
    setBookDescription('');
    setBookPublished(true);
    setBookFeatured(false);
  };

  const startEditBook = (b: BookPublication) => {
    setEditingBookId(b.id);
    setBookTitle(b.title);
    setBookSubtitle(b.subtitle || '');
    setBookSection(b.section);
    setBookEditionLabel(b.editionLabel || '');
    setBookEditionGroup(b.editionGroup || '');
    setBookLanguage(b.language);
    setBookGenre(b.genre);
    setBookPageCount(b.pageCount);
    setBookPdfUrl(b.pdfUrl);
    setBookOriginalFilename(b.originalFilename);
    setBookCustomCoverUrl(b.customCoverUrl || '');
    setBookDescription(b.description);
    setBookPublished(b.published);
    setBookFeatured(b.featured);
    setShowBookForm(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    if (!bookTitle.trim() || !bookPdfUrl.trim()) {
      setErrorBanner('Book title and PDF file are required.');
      return;
    }

    const payload: Partial<BookPublication> = {
      title: bookTitle.trim(),
      subtitle: bookSubtitle.trim() || undefined,
      section: bookSection,
      editionLabel: bookEditionLabel.trim() || undefined,
      editionGroup: bookEditionGroup.trim() || undefined,
      language: bookLanguage,
      genre: bookGenre.trim() || 'Literary Work',
      pageCount: Number(bookPageCount) || 1,
      pdfUrl: bookPdfUrl.trim(),
      originalFilename: bookOriginalFilename.trim() || `${bookTitle.trim()}.pdf`,
      customCoverUrl: bookCustomCoverUrl.trim() || undefined,
      description: bookDescription.trim(),
      published: bookPublished,
      featured: bookFeatured,
    };

    const url = editingBookId ? `/api/cms/books/${editingBookId}` : '/api/cms/books';
    const method = editingBookId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setErrorBanner(err.error || 'Could not save book.');
      return;
    }

    await Promise.all([loadCmsCatalog(), refreshCatalog()]);
    notifySuccess(editingBookId ? 'Publication updated.' : 'New publication added.');
    resetBookForm();
  };

  const toggleBookFlag = async (
    book: BookPublication,
    field: 'published' | 'featured'
  ) => {
    const res = await fetch(`/api/cms/books/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !book[field] }),
    });
    if (res.ok) {
      await Promise.all([loadCmsCatalog(), refreshCatalog()]);
      notifySuccess(`Updated "${book.title}".`);
    }
  };

  const deleteBook = async (id: string) => {
    const res = await fetch(`/api/cms/books/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setConfirmDeleteId(null);
      await Promise.all([loadCmsCatalog(), refreshCatalog()]);
      notifySuccess('Publication removed from catalog.');
    }
  };

  // Poem CRUD
  const resetPoemForm = () => {
    setShowPoemForm(false);
    setEditingPoemId(null);
    setPoemTitle('');
    setPoemEnglishSubtitle('');
    setPoemBody('');
    setPoemLanguage('मराठी');
    setPoemCategory('विरह');
    setPoemDateLabel('');
    setPoemSourceTitle('BENIYAAZ.ROOH');
    setPoemDedication('');
    setPoemSongTitle('');
    setPoemSongUrl('');
    setPoemAudioUrl('');
    setPoemAudioDuration('');
    setPoemPublished(true);
    setPoemFeatured(false);
  };

  const startEditPoem = (p: PoemEntry) => {
    setEditingPoemId(p.id);
    setPoemTitle(p.title);
    setPoemEnglishSubtitle(p.englishSubtitle || '');
    setPoemBody(p.body);
    setPoemLanguage(p.language);
    setPoemCategory(p.category);
    setPoemDateLabel(p.dateLabel || '');
    setPoemSourceTitle(p.sourceTitle || 'BENIYAAZ.ROOH');
    setPoemDedication(p.dedication || '');
    setPoemSongTitle(p.songs?.[0]?.title || '');
    setPoemSongUrl(p.songs?.[0]?.youtubeUrl || '');
    setPoemAudioUrl(p.audioUrl || '');
    setPoemAudioDuration(p.audioDurationLabel || '');
    setPoemPublished(p.published);
    setPoemFeatured(Boolean(p.featured));
    setShowPoemForm(true);
  };

  const handleSavePoem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    if (!poemTitle.trim() || !poemBody) {
      setErrorBanner('Poem title and text are required.');
      return;
    }

    const songs =
      poemSongTitle.trim().length > 0
        ? [
            {
              title: poemSongTitle.trim(),
              youtubeUrl: poemSongUrl.trim() || undefined,
            },
          ]
        : undefined;

    const payload: Partial<PoemEntry> = {
      title: poemTitle.trim(),
      englishSubtitle: poemEnglishSubtitle.trim() || undefined,
      body: poemBody,
      language: poemLanguage,
      category: poemCategory,
      dateLabel: poemDateLabel.trim() || undefined,
      sourceTitle: poemSourceTitle.trim() || 'BENIYAAZ.ROOH',
      dedication: poemDedication.trim() || undefined,
      songs,
      audioUrl: poemAudioUrl.trim() || undefined,
      audioDurationLabel: poemAudioDuration.trim() || undefined,
      published: poemPublished,
      featured: poemFeatured,
    };

    const url = editingPoemId ? `/api/cms/poems/${editingPoemId}` : '/api/cms/poems';
    const method = editingPoemId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setErrorBanner(err.error || 'Could not save poem.');
      return;
    }

    await Promise.all([loadCmsCatalog(), refreshCatalog()]);
    notifySuccess(editingPoemId ? 'Poem updated.' : 'New poem published.');
    resetPoemForm();
  };

  const togglePoemFlag = async (
    poem: PoemEntry,
    field: 'published' | 'featured'
  ) => {
    const res = await fetch(`/api/cms/poems/${poem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !poem[field] }),
    });
    if (res.ok) {
      await Promise.all([loadCmsCatalog(), refreshCatalog()]);
      notifySuccess(`Updated "${poem.title}".`);
    }
  };

  const deletePoem = async (id: string) => {
    const res = await fetch(`/api/cms/poems/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setConfirmDeleteId(null);
      await Promise.all([loadCmsCatalog(), refreshCatalog()]);
      notifySuccess('Poem removed.');
    }
  };

  // Journal CRUD
  const resetJournalForm = () => {
    setShowJournalForm(false);
    setEditingJournalId(null);
    setJournalTitle('');
    setJournalExcerpt('');
    setJournalContent('');
    setJournalSourceLabel('Author Reflection · TEJAS · BENIYAAZ.ROOH');
    setJournalLanguage('English');
    setJournalRelatedBookSlug('');
    setJournalPublished(true);
  };

  const startEditJournal = (post: JournalPost) => {
    setEditingJournalId(post.id);
    setJournalTitle(post.title);
    setJournalExcerpt(post.excerpt);
    setJournalContent(post.content);
    setJournalSourceLabel(post.sourceLabel);
    setJournalLanguage(post.language);
    setJournalRelatedBookSlug(post.relatedBookSlug || '');
    setJournalPublished(post.published);
    setShowJournalForm(true);
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    if (!journalTitle.trim() || !journalContent.trim()) {
      setErrorBanner('Journal title and reflection text are required.');
      return;
    }

    const payload: Partial<JournalPost> = {
      title: journalTitle.trim(),
      excerpt: journalExcerpt.trim() || journalContent.trim().slice(0, 150),
      content: journalContent,
      sourceLabel: journalSourceLabel.trim() || 'Author Reflection · TEJAS · BENIYAAZ.ROOH',
      language: journalLanguage,
      relatedBookSlug: journalRelatedBookSlug || undefined,
      published: journalPublished,
    };

    const url = editingJournalId
      ? `/api/cms/journal/${editingJournalId}`
      : '/api/cms/journal';
    const method = editingJournalId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setErrorBanner(err.error || 'Could not save reflection.');
      return;
    }

    await Promise.all([loadCmsCatalog(), refreshCatalog()]);
    notifySuccess(editingJournalId ? 'Journal note updated.' : 'Journal note published.');
    resetJournalForm();
  };

  const toggleJournalPublished = async (post: JournalPost) => {
    const res = await fetch(`/api/cms/journal/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    });
    if (res.ok) {
      await Promise.all([loadCmsCatalog(), refreshCatalog()]);
      notifySuccess(`Updated "${post.title}".`);
    }
  };

  const deleteJournal = async (id: string) => {
    const res = await fetch(`/api/cms/journal/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setConfirmDeleteId(null);
      await Promise.all([loadCmsCatalog(), refreshCatalog()]);
      notifySuccess('Journal entry removed.');
    }
  };

  const filteredBooks = useMemo(() => {
    const list = cmsCatalog?.books ?? [];
    const q = searchFilter.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q) ||
        b.language.toLowerCase().includes(q)
    );
  }, [cmsCatalog?.books, searchFilter]);

  const filteredPoems = useMemo(() => {
    const list = cmsCatalog?.poems ?? [];
    const q = searchFilter.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.englishSubtitle || '').toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.language.toLowerCase().includes(q)
    );
  }, [cmsCatalog?.poems, searchFilter]);

  const filteredJournal = useMemo(() => {
    const list = cmsCatalog?.journal ?? [];
    const q = searchFilter.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.sourceLabel.toLowerCase().includes(q)
    );
  }, [cmsCatalog?.journal, searchFilter]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        <p className="text-sm text-[#988FA8]">Verifying author studio session...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 sm:py-28">
        <div className="rounded-2xl border border-[#2A223D] bg-[#120F1C] p-8 shadow-2xl">
          <div className="flex items-center gap-3 text-[#C9A45C]">
            <Lock className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-[0.22em]">
              Private Author Studio
            </span>
          </div>

          <h1 className="mt-4 font-literary text-3xl text-[#F3EFE6]">
            {needsSetup ? 'Initialize Studio Passphrase' : 'Author Access'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#988FA8]">
            {needsSetup
              ? 'Set a private passphrase (minimum 6 characters) to manage books, covers, poems, and author reflections on this website.'
              : 'Enter the author passphrase for TEJAS · BENIYAAZ.ROOH to manage publications and manuscripts.'}
          </p>

          <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="cms-passphrase"
                className="block text-xs font-medium text-[#C8C1D4]"
              >
                Passphrase
              </label>
              <input
                id="cms-passphrase"
                type="password"
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter private passphrase"
                className="mt-1.5 h-11 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3.5 text-sm text-[#F3EFE6] focus:border-[#C9A45C] focus:outline-none"
              />
            </div>

            {needsSetup && (
              <div>
                <label
                  htmlFor="cms-passphrase-confirm"
                  className="block text-xs font-medium text-[#C8C1D4]"
                >
                  Confirm Passphrase
                </label>
                <input
                  id="cms-passphrase-confirm"
                  type="password"
                  required
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Re-enter passphrase"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3.5 text-sm text-[#F3EFE6] focus:border-[#C9A45C] focus:outline-none"
                />
              </div>
            )}

            {authError && (
              <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#C9A45C] text-xs font-semibold tracking-wider text-[#09080E] transition-colors hover:bg-[#DEC07C] disabled:opacity-60"
            >
              {authSubmitting
                ? 'Verifying...'
                : needsSetup
                ? 'SET PASSPHRASE & ENTER'
                : 'UNLOCK AUTHOR STUDIO'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2A223D] pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#C9A45C]">
            Private Content Studio · Tejas Purvesh Phirake
          </p>
          <h1 className="mt-2 font-literary text-3xl text-[#F3EFE6] sm:text-4xl">
            TEJAS · BENIYAAZ.ROOH Archive Control
          </h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#2A223D] bg-[#120F1C] px-4 text-xs text-[#C8C1D4] hover:border-[#C9A45C] hover:text-[#F3EFE6]"
        >
          <LogOut className="h-3.5 w-3.5" /> Lock Studio
        </button>
      </div>

      {statusMessage && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-[#C9A45C]/40 bg-[#C9A45C]/10 px-4 py-3 text-sm text-[#DEC07C]">
          <Check className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorBanner && (
        <div className="mt-6 flex items-center justify-between gap-2 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <span>{errorBanner}</span>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="text-red-200 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs & Search */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('books')}
            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-xs font-medium transition-colors ${
              activeTab === 'books'
                ? 'border-[#C9A45C] bg-[#C9A45C] text-[#09080E]'
                : 'border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:border-[#C9A45C]/50'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Books & Editions ({cmsCatalog?.books.length ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('poems')}
            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-xs font-medium transition-colors ${
              activeTab === 'poems'
                ? 'border-[#C9A45C] bg-[#C9A45C] text-[#09080E]'
                : 'border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:border-[#C9A45C]/50'
            }`}
          >
            <Feather className="h-4 w-4" />
            Poems ({cmsCatalog?.poems.length ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('journal')}
            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-xs font-medium transition-colors ${
              activeTab === 'journal'
                ? 'border-[#C9A45C] bg-[#C9A45C] text-[#09080E]'
                : 'border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:border-[#C9A45C]/50'
            }`}
          >
            <FileText className="h-4 w-4" />
            Journal ({cmsCatalog?.journal.length ?? 0})
          </button>
        </div>

        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter items in studio..."
          className="h-10 w-full rounded-lg border border-[#2A223D] bg-[#120F1C] px-3.5 text-sm text-[#F3EFE6] placeholder-[#988FA8] focus:border-[#C9A45C] focus:outline-none sm:w-64"
        />
      </div>

      {/* BOOKS TAB */}
      {activeTab === 'books' && (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-literary text-2xl text-[#F3EFE6]">
              Publications & Editions
            </h2>
            <button
              type="button"
              onClick={() => {
                resetBookForm();
                setShowBookForm(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#C9A45C] px-4 text-xs font-semibold text-[#09080E] hover:bg-[#DEC07C]"
            >
              <Plus className="h-4 w-4" /> Add New Publication
            </button>
          </div>

          {showBookForm && (
            <form
              onSubmit={handleSaveBook}
              className="mt-6 rounded-2xl border border-[#C9A45C]/40 bg-[#120F1C] p-6"
            >
              <div className="flex items-center justify-between border-b border-[#2A223D] pb-4">
                <h3 className="font-literary text-xl text-[#F3EFE6]">
                  {editingBookId ? 'Edit Publication' : 'Upload New Book or Edition'}
                </h3>
                <button
                  type="button"
                  onClick={resetBookForm}
                  className="text-[#988FA8] hover:text-[#F3EFE6]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-[#C8C1D4]">Title *</label>
                  <input
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C8C1D4]">Subtitle</label>
                  <input
                    type="text"
                    value={bookSubtitle}
                    onChange={(e) => setBookSubtitle(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Section</label>
                  <select
                    value={bookSection}
                    onChange={(e) => setBookSection(e.target.value as BookSection)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  >
                    {BOOK_SECTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Language</label>
                  <select
                    value={bookLanguage}
                    onChange={(e) => setBookLanguage(e.target.value as LiteraryLanguage)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  >
                    {LITERARY_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Genre</label>
                  <input
                    type="text"
                    value={bookGenre}
                    onChange={(e) => setBookGenre(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Page Count</label>
                  <input
                    type="number"
                    min={1}
                    value={bookPageCount}
                    onChange={(e) => setBookPageCount(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Edition Label</label>
                  <input
                    type="text"
                    value={bookEditionLabel}
                    onChange={(e) => setBookEditionLabel(e.target.value)}
                    placeholder="e.g. Standard Print Edition"
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Edition Group Key</label>
                  <input
                    type="text"
                    value={bookEditionGroup}
                    onChange={(e) => setBookEditionGroup(e.target.value)}
                    placeholder="e.g. meech-prashna-meech-uttar"
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                {/* PDF Upload & URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#C8C1D4]">
                    Original PDF File *
                  </label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      required
                      value={bookPdfUrl}
                      onChange={(e) => setBookPdfUrl(e.target.value)}
                      placeholder="/uploads/... or /assets/..."
                      className="h-10 min-w-[220px] flex-1 rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                    />
                    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#2A223D] bg-[#1A1527] px-4 text-xs text-[#DEC07C] hover:border-[#C9A45C]">
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingFile === 'pdf' ? 'Uploading PDF...' : 'Upload PDF'}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFileUpload(file, 'pdf');
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Optional Cover Image Upload */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#C8C1D4]">
                    Custom Cover Image URL (leave blank to use Page 1 of PDF)
                  </label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={bookCustomCoverUrl}
                      onChange={(e) => setBookCustomCoverUrl(e.target.value)}
                      placeholder="Optional custom image URL"
                      className="h-10 min-w-[220px] flex-1 rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                    />
                    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#2A223D] bg-[#1A1527] px-4 text-xs text-[#C8C1D4] hover:border-[#C9A45C]">
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingFile === 'cover' ? 'Uploading Cover...' : 'Upload Cover Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFileUpload(file, 'cover');
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#C8C1D4]">Synopsis / Description</label>
                  <textarea
                    rows={4}
                    value={bookDescription}
                    onChange={(e) => setBookDescription(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#2A223D] bg-[#09080E] p-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-xs text-[#C8C1D4]">
                    <input
                      type="checkbox"
                      checked={bookPublished}
                      onChange={(e) => setBookPublished(e.target.checked)}
                      className="h-4 w-4 accent-[#C9A45C]"
                    />
                    Published publicly
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-[#C8C1D4]">
                    <input
                      type="checkbox"
                      checked={bookFeatured}
                      onChange={(e) => setBookFeatured(e.target.checked)}
                      className="h-4 w-4 accent-[#C9A45C]"
                    />
                    Feature on homepage
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetBookForm}
                  className="h-10 rounded-lg border border-[#2A223D] px-4 text-xs text-[#C8C1D4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-[#C9A45C] px-5 text-xs font-semibold text-[#09080E] hover:bg-[#DEC07C]"
                >
                  {editingBookId ? 'Save Changes' : 'Publish Book'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 space-y-3">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#2A223D] bg-[#120F1C] p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-[#C9A45C]">{book.section}</span>
                    <span className="text-[#4F446A]">·</span>
                    <span className="text-[#988FA8]">{book.language}</span>
                    <span className="text-[#4F446A]">·</span>
                    <span className="text-[#988FA8] tabular-nums">{book.pageCount} pages</span>
                    {!book.published && (
                      <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] text-red-200">
                        Unpublished Draft
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-literary text-xl text-[#F3EFE6]">
                    {book.title}
                  </h3>
                  {book.editionLabel && (
                    <p className="text-xs text-[#988FA8]">{book.editionLabel}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleBookFlag(book, 'featured')}
                    title="Toggle Featured"
                    className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-xs ${
                      book.featured
                        ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#DEC07C]'
                        : 'border-[#2A223D] text-[#988FA8] hover:text-[#F3EFE6]'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" /> Featured
                  </button>

                  <button
                    type="button"
                    onClick={() => void toggleBookFlag(book, 'published')}
                    title={book.published ? 'Unpublish' : 'Publish'}
                    className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-xs ${
                      book.published
                        ? 'border-[#2A223D] text-[#C8C1D4] hover:border-[#C9A45C]'
                        : 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                    }`}
                  >
                    {book.published ? (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Live
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Draft
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => startEditBook(book)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#2A223D] px-3 text-xs text-[#F3EFE6] hover:border-[#C9A45C]"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>

                  {confirmDeleteId === book.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void deleteBook(book.id)}
                        className="h-9 rounded-lg bg-red-600 px-3 text-xs font-medium text-white"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-9 rounded-lg border border-[#2A223D] px-2.5 text-xs text-[#988FA8]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(book.id)}
                      aria-label="Delete book"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A223D] text-[#988FA8] hover:border-red-400/50 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* POEMS TAB */}
      {activeTab === 'poems' && (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-literary text-2xl text-[#F3EFE6]">
              BENIYAAZ.ROOH Poetry Archive
            </h2>
            <button
              type="button"
              onClick={() => {
                resetPoemForm();
                setShowPoemForm(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#C9A45C] px-4 text-xs font-semibold text-[#09080E] hover:bg-[#DEC07C]"
            >
              <Plus className="h-4 w-4" /> Add New Poem
            </button>
          </div>

          {showPoemForm && (
            <form
              onSubmit={handleSavePoem}
              className="mt-6 rounded-2xl border border-[#C9A45C]/40 bg-[#120F1C] p-6"
            >
              <div className="flex items-center justify-between border-b border-[#2A223D] pb-4">
                <h3 className="font-literary text-xl text-[#F3EFE6]">
                  {editingPoemId ? 'Edit Poem' : 'Add Original Poem'}
                </h3>
                <button
                  type="button"
                  onClick={resetPoemForm}
                  className="text-[#988FA8] hover:text-[#F3EFE6]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-[#C8C1D4]">Original Title *</label>
                  <input
                    type="text"
                    required
                    value={poemTitle}
                    onChange={(e) => setPoemTitle(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C8C1D4]">
                    English Subtitle / Translation Title
                  </label>
                  <input
                    type="text"
                    value={poemEnglishSubtitle}
                    onChange={(e) => setPoemEnglishSubtitle(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Language</label>
                  <select
                    value={poemLanguage}
                    onChange={(e) => setPoemLanguage(e.target.value as PoemLanguage)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  >
                    {POEM_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Category</label>
                  <select
                    value={poemCategory}
                    onChange={(e) => setPoemCategory(e.target.value as PoemCategory)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  >
                    {POEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Date Label</label>
                  <input
                    type="text"
                    value={poemDateLabel}
                    onChange={(e) => setPoemDateLabel(e.target.value)}
                    placeholder="e.g. Oct 28, 2025"
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Source Collection</label>
                  <input
                    type="text"
                    value={poemSourceTitle}
                    onChange={(e) => setPoemSourceTitle(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#C8C1D4]">
                    Complete Poem Text (verbatim line breaks preserved) *
                  </label>
                  <textarea
                    rows={10}
                    required
                    value={poemBody}
                    onChange={(e) => setPoemBody(e.target.value)}
                    className="devanagari-verse mt-1.5 w-full rounded-lg border border-[#2A223D] bg-[#09080E] p-3 text-base leading-relaxed text-[#F3EFE6]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#C8C1D4]">
                    Optional Dedication / Epigraph
                  </label>
                  <textarea
                    rows={2}
                    value={poemDedication}
                    onChange={(e) => setPoemDedication(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#2A223D] bg-[#09080E] p-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">
                    Optional Companion Song Title
                  </label>
                  <input
                    type="text"
                    value={poemSongTitle}
                    onChange={(e) => setPoemSongTitle(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">
                    Companion Song YouTube URL
                  </label>
                  <input
                    type="url"
                    value={poemSongUrl}
                    onChange={(e) => setPoemSongUrl(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#C8C1D4]">
                    Recorded Poetry Audio File (optional — appears in Audio Corner)
                  </label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={poemAudioUrl}
                      onChange={(e) => setPoemAudioUrl(e.target.value)}
                      placeholder="/uploads/... (MP3, WAV, M4A, OGG)"
                      className="h-10 min-w-[200px] flex-1 rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                    />
                    <input
                      type="text"
                      value={poemAudioDuration}
                      onChange={(e) => setPoemAudioDuration(e.target.value)}
                      placeholder="Duration e.g. 02:14"
                      className="h-10 w-36 rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                    />
                    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#2A223D] bg-[#1A1527] px-4 text-xs text-[#DEC07C] hover:border-[#C9A45C]">
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingFile === 'audio' ? 'Uploading Audio...' : 'Upload Audio'}
                      <input
                        type="file"
                        accept="audio/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFileUpload(file, 'audio');
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-xs text-[#C8C1D4]">
                    <input
                      type="checkbox"
                      checked={poemPublished}
                      onChange={(e) => setPoemPublished(e.target.checked)}
                      className="h-4 w-4 accent-[#C9A45C]"
                    />
                    Published publicly
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-[#C8C1D4]">
                    <input
                      type="checkbox"
                      checked={poemFeatured}
                      onChange={(e) => setPoemFeatured(e.target.checked)}
                      className="h-4 w-4 accent-[#C9A45C]"
                    />
                    Feature on homepage
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetPoemForm}
                  className="h-10 rounded-lg border border-[#2A223D] px-4 text-xs text-[#C8C1D4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-[#C9A45C] px-5 text-xs font-semibold text-[#09080E] hover:bg-[#DEC07C]"
                >
                  {editingPoemId ? 'Save Poem' : 'Publish Poem'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 space-y-3">
            {filteredPoems.map((poem) => (
              <div
                key={poem.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#2A223D] bg-[#120F1C] p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-[#C9A45C]">{poem.language}</span>
                    <span className="text-[#4F446A]">·</span>
                    <span className="text-[#988FA8]">{poem.category}</span>
                    {poem.number && (
                      <>
                        <span className="text-[#4F446A]">·</span>
                        <span className="text-[#988FA8] tabular-nums">#{poem.number}</span>
                      </>
                    )}
                    {!poem.published && (
                      <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] text-red-200">
                        Draft
                      </span>
                    )}
                  </div>
                  <h3 className="devanagari-verse mt-1 font-literary text-xl text-[#F3EFE6]">
                    {poem.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void togglePoemFlag(poem, 'featured')}
                    className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-xs ${
                      poem.featured
                        ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#DEC07C]'
                        : 'border-[#2A223D] text-[#988FA8] hover:text-[#F3EFE6]'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" /> Featured
                  </button>

                  <button
                    type="button"
                    onClick={() => void togglePoemFlag(poem, 'published')}
                    className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-xs ${
                      poem.published
                        ? 'border-[#2A223D] text-[#C8C1D4] hover:border-[#C9A45C]'
                        : 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                    }`}
                  >
                    {poem.published ? (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Live
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Draft
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => startEditPoem(poem)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#2A223D] px-3 text-xs text-[#F3EFE6] hover:border-[#C9A45C]"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>

                  {confirmDeleteId === poem.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void deletePoem(poem.id)}
                        className="h-9 rounded-lg bg-red-600 px-3 text-xs font-medium text-white"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-9 rounded-lg border border-[#2A223D] px-2.5 text-xs text-[#988FA8]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(poem.id)}
                      aria-label="Delete poem"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A223D] text-[#988FA8] hover:border-red-400/50 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* JOURNAL TAB */}
      {activeTab === 'journal' && (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-literary text-2xl text-[#F3EFE6]">
              Reflections & Author&apos;s Notes
            </h2>
            <button
              type="button"
              onClick={() => {
                resetJournalForm();
                setShowJournalForm(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#C9A45C] px-4 text-xs font-semibold text-[#09080E] hover:bg-[#DEC07C]"
            >
              <Plus className="h-4 w-4" /> Write Reflection
            </button>
          </div>

          {showJournalForm && (
            <form
              onSubmit={handleSaveJournal}
              className="mt-6 rounded-2xl border border-[#C9A45C]/40 bg-[#120F1C] p-6"
            >
              <div className="flex items-center justify-between border-b border-[#2A223D] pb-4">
                <h3 className="font-literary text-xl text-[#F3EFE6]">
                  {editingJournalId ? 'Edit Journal Note' : 'New Journal Reflection'}
                </h3>
                <button
                  type="button"
                  onClick={resetJournalForm}
                  className="text-[#988FA8] hover:text-[#F3EFE6]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#C8C1D4]">Title *</label>
                  <input
                    type="text"
                    required
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Source / Context Label</label>
                  <input
                    type="text"
                    value={journalSourceLabel}
                    onChange={(e) => setJournalSourceLabel(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#C8C1D4]">Language</label>
                  <select
                    value={journalLanguage}
                    onChange={(e) => setJournalLanguage(e.target.value as LiteraryLanguage)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  >
                    {LITERARY_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#C8C1D4]">Short Excerpt</label>
                  <input
                    type="text"
                    value={journalExcerpt}
                    onChange={(e) => setJournalExcerpt(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#C8C1D4]">Full Note Text *</label>
                  <textarea
                    rows={8}
                    required
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    className="devanagari-verse mt-1.5 w-full rounded-lg border border-[#2A223D] bg-[#09080E] p-3 text-sm leading-relaxed text-[#F3EFE6]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#C8C1D4]">
                    Related Book (optional)
                  </label>
                  <select
                    value={journalRelatedBookSlug}
                    onChange={(e) => setJournalRelatedBookSlug(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2A223D] bg-[#09080E] px-3 text-sm text-[#F3EFE6]"
                  >
                    <option value="">None</option>
                    {(cmsCatalog?.books ?? []).map((b) => (
                      <option key={b.id} value={b.slug}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-xs text-[#C8C1D4]">
                    <input
                      type="checkbox"
                      checked={journalPublished}
                      onChange={(e) => setJournalPublished(e.target.checked)}
                      className="h-4 w-4 accent-[#C9A45C]"
                    />
                    Published publicly
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetJournalForm}
                  className="h-10 rounded-lg border border-[#2A223D] px-4 text-xs text-[#C8C1D4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-[#C9A45C] px-5 text-xs font-semibold text-[#09080E] hover:bg-[#DEC07C]"
                >
                  {editingJournalId ? 'Save Reflection' : 'Publish Reflection'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 space-y-3">
            {filteredJournal.map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#2A223D] bg-[#120F1C] p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-[#C9A45C]">{post.sourceLabel}</span>
                    <span className="text-[#4F446A]">·</span>
                    <span className="text-[#988FA8]">{post.language}</span>
                    {!post.published && (
                      <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] text-red-200">
                        Draft
                      </span>
                    )}
                  </div>
                  <h3 className="devanagari-verse mt-1 font-literary text-xl text-[#F3EFE6]">
                    {post.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleJournalPublished(post)}
                    className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-xs ${
                      post.published
                        ? 'border-[#2A223D] text-[#C8C1D4] hover:border-[#C9A45C]'
                        : 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                    }`}
                  >
                    {post.published ? (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Live
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Draft
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => startEditJournal(post)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#2A223D] px-3 text-xs text-[#F3EFE6] hover:border-[#C9A45C]"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>

                  {confirmDeleteId === post.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void deleteJournal(post.id)}
                        className="h-9 rounded-lg bg-red-600 px-3 text-xs font-medium text-white"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-9 rounded-lg border border-[#2A223D] px-2.5 text-xs text-[#988FA8]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(post.id)}
                      aria-label="Delete reflection"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A223D] text-[#988FA8] hover:border-red-400/50 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
