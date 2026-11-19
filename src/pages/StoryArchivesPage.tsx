import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Search, User } from 'lucide-react';
import { ArtworkFrame } from '../components/ArtworkFrame';
import { BookCoverPreview } from '../components/BookCoverPreview';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { STORY_ARCHIVES_DATA } from '../data/storiesArchiveData';
import { ARTWORKS } from '../lib/artworks';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function StoryArchivesPage() {
  useDocumentMeta(
    'The Story Archives — Fiction & Psychological Thrillers',
    'Explore the fiction and investigative thriller universe of Tejas Purvesh Phirake: Chupke Chupke Sach 1 & 2 and मीच प्रश्न, मीच उत्तर chapter indexes and character dossiers.'
  );

  const { books } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSlug = searchParams.get('story');

  const activeDossier = useMemo(
    () =>
      STORY_ARCHIVES_DATA.find((d) => d.slug === requestedSlug) ||
      STORY_ARCHIVES_DATA[0],
    [requestedSlug]
  );

  const [chapterQuery, setChapterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chapters' | 'characters'>('chapters');

  const activeBook = useMemo(
    () => books.find((b) => b.slug === activeDossier.bookSlug),
    [books, activeDossier.bookSlug]
  );
  const alternateBook = useMemo(
    () =>
      activeDossier.alternateBookSlug
        ? books.find((b) => b.slug === activeDossier.alternateBookSlug)
        : undefined,
    [books, activeDossier.alternateBookSlug]
  );

  const filteredChapters = useMemo(() => {
    const q = chapterQuery.trim().toLowerCase();
    if (!q) return activeDossier.chapters;
    return activeDossier.chapters.filter((ch) =>
      `${ch.numberLabel} ${ch.title} ${ch.partLabel ?? ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [activeDossier.chapters, chapterQuery]);

  const selectStory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('story', slug);
    setSearchParams(next);
    setChapterQuery('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      {/* Header */}
      <header className="border-b border-[#2A223D] pb-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="min-w-0 lg:col-span-8">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#C9A45C]">
              Section 03 · Fiction &amp; Psychological Thrillers
            </p>
            <h1 className="mt-2 font-literary text-4xl font-medium text-[#F3EFE6] headline-balance sm:text-5xl">
              The Story Archives
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#C8C1D4] sm:text-base">
              Verified chapter indexes and character dossiers drawn directly from the
              original published manuscripts of{' '}
              <span className="italic text-[#DEC07C]">Chupke Chupke Sach</span>,{' '}
              <span className="italic text-[#DEC07C]">Chupke Chupke Sach 2</span>, and{' '}
              <span className="text-[#DEC07C]">मीच प्रश्न, मीच उत्तर</span>. Select any
              chapter to open the exact manuscript page.
            </p>
          </div>

          <div className="hidden lg:col-span-4 lg:block">
            <div className="overflow-hidden rounded-xl border border-[#2A223D] bg-[#120F1C]">
              <ArtworkFrame
                src={ARTWORKS.thrillerStudy.src}
                alt={ARTWORKS.thrillerStudy.alt}
                fallbackTitle={ARTWORKS.thrillerStudy.fallbackTitle}
                fallbackSubtitle={ARTWORKS.thrillerStudy.fallbackSubtitle}
                className="aspect-[16/10]"
              />
            </div>
          </div>
        </div>

        {/* Story Universe Switcher */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          {STORY_ARCHIVES_DATA.map((dossier) => {
            const active = dossier.id === activeDossier.id;
            return (
              <button
                key={dossier.id}
                type="button"
                onClick={() => selectStory(dossier.slug)}
                className={`rounded-lg border px-4 py-2.5 text-left transition-colors ${
                  active
                    ? 'border-[#C9A45C] bg-[#1A1527] text-[#F3EFE6]'
                    : 'border-[#2A223D] bg-[#120F1C] text-[#988FA8] hover:border-[#C9A45C]/40 hover:text-[#F3EFE6]'
                }`}
              >
                <span className="block text-[11px] uppercase tracking-[0.16em] text-[#C9A45C]">
                  {dossier.language} · {dossier.chapters.length} Entries
                </span>
                <span className="mt-0.5 block font-literary text-lg">
                  {dossier.title}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Active Dossier Hero */}
      <section className="mt-10 grid gap-8 border-b border-[#2A223D] pb-10 lg:grid-cols-12 lg:items-start">
        {activeBook && (
          <div className="mx-auto w-48 sm:w-56 lg:col-span-3 lg:mx-0 lg:w-full">
            <Link to={`/books/${activeBook.slug}`} className="block">
              <BookCoverPreview book={activeBook} />
            </Link>
          </div>
        )}

        <div className={activeBook ? 'min-w-0 lg:col-span-9' : 'min-w-0 lg:col-span-12'}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#C9A45C]">
            <span>{activeDossier.genre}</span>
            <span aria-hidden="true" className="text-[#4F446A]">
              ·
            </span>
            <span className="text-[#988FA8]">{activeDossier.language}</span>
            <span aria-hidden="true" className="text-[#4F446A]">
              ·
            </span>
            <span className="text-[#988FA8]">{activeDossier.settingLabel}</span>
          </div>

          <h2 className="mt-2 font-literary text-3xl font-medium text-[#F3EFE6] sm:text-4xl">
            {activeDossier.title}
          </h2>
          <p className="mt-1 font-literary text-lg italic text-[#DEC07C]">
            {activeDossier.subtitle}
          </p>

          <ProtectedReadingSurface showWatermark className="mt-4 max-w-3xl rounded-lg">
            <p className="text-sm leading-relaxed text-[#C8C1D4] sm:text-base">
              {activeDossier.summary}
            </p>
          </ProtectedReadingSurface>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {activeBook && (
              <Link
                to={`/read/${activeBook.slug}`}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#C9A45C] px-5 text-xs font-semibold uppercase tracking-[0.15em] text-[#09080E] transition-colors hover:bg-[#DEC07C] whitespace-nowrap shrink-0"
              >
                <BookOpen className="h-4 w-4" />
                <span>Read Original Book</span>
              </Link>
            )}

            {alternateBook && (
              <Link
                to={`/read/${alternateBook.slug}`}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#C9A45C]/50 bg-[#120F1C] px-5 text-xs font-medium text-[#DEC07C] transition-colors hover:border-[#DEC07C] whitespace-nowrap shrink-0"
              >
                <span>Open {alternateBook.editionLabel || 'Alternate Edition'}</span>
              </Link>
            )}

            {activeBook && (
              <Link
                to={`/books/${activeBook.slug}`}
                className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-[#2A223D] px-4 text-xs text-[#C8C1D4] hover:border-[#C9A45C]/60 hover:text-[#F3EFE6] whitespace-nowrap shrink-0"
              >
                <span>Publication Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Chapters vs Characters Controls */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'chapters'}
            onClick={() => setActiveTab('chapters')}
            className={`h-10 rounded-lg px-4 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'chapters'
                ? 'bg-[#C9A45C] text-[#09080E]'
                : 'border border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:text-[#F3EFE6]'
            }`}
          >
            Chapter Index ({activeDossier.chapters.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'characters'}
            onClick={() => setActiveTab('characters')}
            className={`h-10 rounded-lg px-4 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'characters'
                ? 'bg-[#C9A45C] text-[#09080E]'
                : 'border border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:text-[#F3EFE6]'
            }`}
          >
            Character Dossiers ({activeDossier.characters.length})
          </button>
        </div>

        {activeTab === 'chapters' && (
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#988FA8]" />
            <input
              type="search"
              value={chapterQuery}
              onChange={(e) => setChapterQuery(e.target.value)}
              placeholder="Filter chapters by title or part..."
              className="h-10 w-full rounded-lg border border-[#2A223D] bg-[#120F1C] pl-9 pr-3 text-xs text-[#F3EFE6] placeholder-[#988FA8] focus:border-[#C9A45C] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Chapter Index List */}
      {activeTab === 'chapters' ? (
        <section className="mt-6">
          {filteredChapters.length === 0 ? (
            <div className="rounded-xl border border-[#2A223D] bg-[#120F1C]/60 p-8 text-center text-sm text-[#988FA8]">
              No chapters matched “{chapterQuery}”.
            </div>
          ) : (
            <div className="divide-y divide-[#2A223D] rounded-xl border border-[#2A223D] bg-[#120F1C]/70">
              {filteredChapters.map((ch) => (
                <Link
                  key={`${ch.numberLabel}-${ch.page}`}
                  to={`/read/${activeDossier.bookSlug}?page=${ch.page}`}
                  className="group flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#1A1527]/70"
                >
                  <div className="flex min-w-0 items-baseline gap-4">
                    <span className="w-10 shrink-0 font-literary text-lg tabular-nums text-[#C9A45C]">
                      {ch.numberLabel}
                    </span>
                    <div className="min-w-0">
                      <p className="devanagari-verse font-literary text-xl text-[#F3EFE6] transition-colors group-hover:text-[#DEC07C]">
                        {ch.title}
                      </p>
                      {ch.partLabel && (
                        <p className="mt-0.5 text-xs text-[#988FA8]">{ch.partLabel}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="tabular-nums text-[#988FA8]">
                      Page {ch.page}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-[#DEC07C]">
                      Open Page <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Character Dossiers */
        <ProtectedReadingSurface showWatermark className="mt-6">
          <section className="grid gap-6 md:grid-cols-2">
            {activeDossier.characters.map((char) => (
              <article
                key={char.id}
                className="flex flex-col rounded-xl border border-[#2A223D] bg-[#120F1C]/80 p-6"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#2A223D]/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#C9A45C]">
                      <User className="h-3.5 w-3.5" />
                      <span>{char.role}</span>
                    </div>
                    <h3 className="devanagari-verse mt-1.5 font-literary text-2xl font-medium text-[#F3EFE6]">
                      {char.name}
                    </h3>
                  </div>
                  <span className="shrink-0 text-right text-[11px] tabular-nums text-[#988FA8]">
                    {char.appearanceLabel}
                  </span>
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-[#C8C1D4]">
                  {char.description}
                </p>

                {char.quote && (
                  <blockquote className="mt-5 border-t border-[#2A223D]/80 pt-3 font-literary text-base italic text-[#DEC07C]">
                    {char.quote}
                  </blockquote>
                )}
              </article>
            ))}
          </section>
        </ProtectedReadingSurface>
      )}
    </div>
  );
}
