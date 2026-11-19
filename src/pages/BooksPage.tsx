import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { BookCoverPreview } from '../components/BookCoverPreview';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type { BookPublication, BookSection } from '../types/literary';

const SECTION_META: {
  key: BookSection;
  title: string;
  subtitle: string;
}[] = [
  {
    key: 'novels',
    title: 'Novels',
    subtitle: 'Full-length Hinglish thrillers and Marathi literary fiction.',
  },
  {
    key: 'theatre',
    title: 'Theatre',
    subtitle: 'Original stage scripts written for live performance.',
  },
  {
    key: 'poetry-collections',
    title: 'Poetry Collections',
    subtitle: 'Bound anthologies across Marathi, Hindi, and English.',
  },
  {
    key: 'special-editions',
    title: 'Special Editions',
    subtitle:
      'Preserved alternate reading formats and illustrated single-poem editions.',
  },
];

export function BooksPage() {
  useDocumentMeta(
    'The Library — Books & Editions',
    'Browse novels, Marathi theatre, poetry collections, and preserved special editions by Tejas Purvesh Phirake.'
  );

  const { books } = useCatalog();
  const { state } = useReader();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = (searchParams.get('section') as BookSection | 'all') || 'all';
  const activeLang = searchParams.get('lang') || 'all';
  const [query, setQuery] = useState('');

  const setFilter = (key: 'section' | 'lang', value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const languages = useMemo(
    () => ['all', ...Array.from(new Set(books.map((b) => b.language)))],
    [books]
  );

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((b) => {
      if (activeSection !== 'all' && b.section !== activeSection) return false;
      if (activeLang !== 'all' && b.language !== activeLang) return false;
      if (
        q &&
        !`${b.title} ${b.subtitle ?? ''} ${b.genre} ${b.description} ${b.editionLabel ?? ''}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [books, activeSection, activeLang, query]);

  const groupedSections = useMemo(() => {
    return SECTION_META.map((sec) => ({
      ...sec,
      items: filteredBooks.filter((b) => b.section === sec.key),
    })).filter((sec) => sec.items.length > 0);
  }, [filteredBooks]);

  const renderBookCard = (book: BookPublication) => {
    const progress = state.progressBySlug[book.slug];
    const pct =
      progress && progress.totalPages > 0
        ? Math.min(100, Math.round((progress.currentPage / progress.totalPages) * 100))
        : 0;

    return (
      <article
        key={book.id}
        className="group flex flex-col rounded-xl border border-[#2A223D] bg-[#120F1C]/85 p-5 transition-colors hover:border-[#C9A45C]/55"
      >
        <Link to={`/books/${book.slug}`} className="block">
          <BookCoverPreview book={book} />
        </Link>

        <div className="mt-5 flex flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#988FA8]">
            <span>{book.language}</span>
            <span aria-hidden="true">·</span>
            <span>{book.genre}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{book.pageCount} pages</span>
          </div>

          <Link to={`/books/${book.slug}`} className="mt-2 block">
            <h3 className="font-literary text-2xl font-medium leading-snug text-[#F3EFE6] transition-colors group-hover:text-[#DEC07C]">
              {book.title}
            </h3>
          </Link>

          {book.subtitle && (
            <p className="mt-1 line-clamp-2 text-xs text-[#988FA8]">{book.subtitle}</p>
          )}

          {book.editionLabel && (
            <p className="mt-2.5 text-[11px] uppercase tracking-[0.16em] text-[#C9A45C]">
              {book.editionLabel}
            </p>
          )}

          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-[#C8C1D4]">
            {book.description}
          </p>

          {pct > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-[11px] tabular-nums text-[#988FA8]">
                <span>
                  Resume p.{progress.currentPage}/{progress.totalPages}
                </span>
                <span>{pct}%</span>
              </div>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#2A223D]">
                <div
                  className="h-full bg-[#C9A45C]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-auto flex items-center gap-2.5 pt-5">
            <Link
              to={`/read/${book.slug}`}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#C9A45C] px-3.5 text-xs font-semibold text-[#09080E] transition-colors hover:bg-[#DEC07C] whitespace-nowrap"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{pct > 0 ? 'Continue Reading' : 'Read Online'}</span>
            </Link>
            <Link
              to={`/books/${book.slug}`}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[#2A223D] bg-[#1A1527] px-3.5 text-xs text-[#C8C1D4] transition-colors hover:border-[#C9A45C]/60 hover:text-[#DEC07C] whitespace-nowrap shrink-0"
            >
              <span>Details</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <header className="border-b border-[#2A223D] pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#C9A45C]">
          Section 01 · Digital Library Archive
        </p>
        <h1 className="mt-2 font-literary text-4xl font-medium text-[#F3EFE6] headline-balance sm:text-5xl">
          The Library
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#C8C1D4] sm:text-base">
          Every published manuscript and preserved alternate edition by Tejas Purvesh
          Phirake, kept intact without merging or alteration. Open any edition in the
          online reading room or inspect its publication dossier.
        </p>

        {/* Interactive Filter Controls */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('section', 'all')}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'all'
                  ? 'bg-[#C9A45C] text-[#09080E]'
                  : 'border border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:text-[#F3EFE6]'
              }`}
            >
              All ({books.length})
            </button>
            {SECTION_META.map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => setFilter('section', sec.key)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeSection === sec.key
                    ? 'bg-[#C9A45C] text-[#09080E]'
                    : 'border border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:text-[#F3EFE6]'
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-[#2A223D] bg-[#120F1C] p-1">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setFilter('lang', lang)}
                  className={`rounded-md px-2.5 py-1 text-xs transition-colors whitespace-nowrap shrink-0 ${
                    activeLang === lang
                      ? 'bg-[#2A223D] text-[#DEC07C]'
                      : 'text-[#988FA8] hover:text-[#F3EFE6]'
                  }`}
                >
                  {lang === 'all' ? 'All Languages' : lang}
                </button>
              ))}
            </div>

            <div className="relative flex-1 sm:w-60 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#988FA8]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter titles..."
                className="h-9 w-full rounded-lg border border-[#2A223D] bg-[#120F1C] pl-9 pr-3 text-xs text-[#F3EFE6] placeholder-[#988FA8] focus:border-[#C9A45C] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      {groupedSections.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-literary text-2xl text-[#F3EFE6]">
            No publications matched your current filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchParams({});
              setQuery('');
            }}
            className="mt-4 rounded-lg border border-[#C9A45C]/60 px-4 py-2 text-xs font-medium text-[#DEC07C]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-12 space-y-16">
          {groupedSections.map((sec) => (
            <section key={sec.key}>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-[#2A223D]/70 pb-3">
                <div>
                  <h2 className="font-literary text-2xl font-medium text-[#F3EFE6] sm:text-3xl">
                    {sec.title}
                  </h2>
                  <p className="mt-1 text-xs text-[#988FA8]">{sec.subtitle}</p>
                </div>
                <span className="text-xs tabular-nums text-[#988FA8]">
                  {sec.items.length} {sec.items.length === 1 ? 'edition' : 'editions'}
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sec.items.map(renderBookCard)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
