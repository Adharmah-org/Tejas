import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Feather,
  Headphones,
  Moon,
  Music2,
  Theater,
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { ArtworkFrame } from '../components/ArtworkFrame';
import { BookCoverPreview } from '../components/BookCoverPreview';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ARTWORKS } from '../lib/artworks';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { MIDNIGHT_EXCERPTS } from '../data/midnightExcerpts';
import { MOOD_DEFINITIONS } from '../data/moodCatalog';

const ECOSYSTEM_ROOMS = [
  { num: '01', name: 'The Library', note: 'Novels, plays & preserved editions', to: '/books' },
  { num: '02', name: 'Poetry Room', note: 'Marathi · Hindi · English anthology', to: '/poetry' },
  { num: '03', name: 'Story Archives', note: 'Chapters & character dossiers', to: '/stories' },
  { num: '04', name: 'The Theatre', note: 'Three-act Marathi stage script', to: '/theatre' },
  { num: '05', name: 'Unsaid Journal', note: 'Prefaces & author reflections', to: '/journal' },
  { num: '06', name: 'Midnight Page', note: 'Rotating manuscript excerpts', to: '/midnight-page' },
  { num: '07', name: 'Choose Your Mood', note: 'Discover works by emotion', to: '/moods' },
  { num: '08', name: 'Audio Corner', note: 'Spoken readings & companion tracks', to: '/audio' },
  { num: '09', name: "Author's Archive", note: 'Biography, timeline & bibliography', to: '/author' },
  { num: '10', name: 'My Bookshelf', note: 'Saved favourites & reading memory', to: '/saved' },
];

export function HomePage() {
  useDocumentMeta(
    'TEJAS | BENIYAAZ ROOH — Literary Works by Tejas Purvesh Phirake',
    'BENIYAAZ ROOH by Tejas Purvesh Phirake — novels, Marathi theatre, multilingual poetry, story archives, and audio readings. Some feelings leave. The words stay.'
  );

  const { books, poems, journal } = useCatalog();
  const prefersReducedMotion = useReducedMotion();

  const [midnightIdx, setMidnightIdx] = useState(0);
  const [selectedMoodKey, setSelectedMoodKey] = useState(MOOD_DEFINITIONS[0].key);

  const totalPages = useMemo(
    () => books.reduce((sum, b) => sum + (b.pageCount || 0), 0),
    [books]
  );

  const heroBook =
    books.find((b) => b.slug === 'a-love-truly-never-fades') ||
    books.find((b) => b.featured) ||
    books[0];

  const featuredBooks = useMemo(
    () => books.filter((b) => b.featured).slice(0, 4),
    [books]
  );
  const leadPublication = featuredBooks[0] || books[0];
  const shelfPublications = featuredBooks.slice(1, 4);

  const featuredPoem =
    poems.find((p) => p.slug === 'tujhya-saundaryachi-najaakat') ||
    poems.find((p) => p.featured) ||
    poems[0];

  const activeExcerpt = MIDNIGHT_EXCERPTS[midnightIdx] || MIDNIGHT_EXCERPTS[0];

  const activeMood = useMemo(
    () =>
      MOOD_DEFINITIONS.find((m) => m.key === selectedMoodKey) ||
      MOOD_DEFINITIONS[0],
    [selectedMoodKey]
  );

  const moodBooks = useMemo(
    () => books.filter((b) => activeMood.bookSlugs.includes(b.slug)),
    [books, activeMood]
  );
  const moodPoems = useMemo(
    () => poems.filter((p) => activeMood.poemCategories.includes(p.category)),
    [poems, activeMood]
  );

  const studioRecordedPoems = useMemo(
    () => poems.filter((p) => Boolean(p.audioUrl)),
    [poems]
  );
  const pairedSongPoems = useMemo(
    () => poems.filter((p) => p.songs && p.songs.length > 0),
    [poems]
  );

  return (
    <div className="divide-y divide-[#2A223D]/70">
      {/* 1. Asymmetric Nocturnal Editorial Hero */}
      <section className="section-reveal relative overflow-x-clip">
        <div className="mx-auto grid w-full max-w-6xl items-stretch gap-8 px-4 py-10 sm:px-6 md:py-20 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Brand Identity, Author, Tagline, Dual Doors */}
          <div className="flex min-w-0 flex-col justify-center lg:col-span-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C9A45C] sm:text-xs sm:tracking-[0.28em]">
              BENIYAAZ ROOH · TEJAS PURVESH PHIRAKE
            </p>
            <h1 className="mt-4 font-literary text-4xl font-medium leading-[1.08] tracking-tight text-[#F3EFE6] headline-balance sm:mt-5 sm:text-5xl lg:text-[3.65rem]">
              Some feelings leave.
              <br />
              <span className="italic text-[#DEC07C]">The words stay.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#C8C1D4] sm:mt-6 sm:text-lg">
              The independent literary archive of{' '}
              <span className="text-[#F3EFE6]">Tejas Purvesh Phirake</span> —
              preserving psychological thrillers, Marathi literary fiction,
              three-act theatre, and trilingual poetry in{' '}
              <span className="text-[#F3EFE6]">Marathi, Hindi, and English</span>.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4">
              <Link
                to="/books"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#C9A45C] px-5 text-xs font-semibold uppercase tracking-[0.15em] text-[#09080E] transition-colors duration-150 hover:bg-[#DEC07C] whitespace-nowrap sm:h-12 sm:px-7 sm:tracking-[0.18em]"
              >
                <BookOpen className="h-4 w-4" />
                <span>Explore Books</span>
              </Link>
              <Link
                to="/poetry"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-[#C9A45C]/50 bg-[#120F1C] px-5 text-xs font-semibold uppercase tracking-[0.15em] text-[#F3EFE6] transition-colors duration-150 hover:border-[#DEC07C] hover:text-[#DEC07C] whitespace-nowrap sm:h-12 sm:px-7 sm:tracking-[0.18em]"
              >
                <Feather className="h-4 w-4 text-[#C9A45C]" />
                <span>Enter Poetry</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Bespoke Candlelit Manuscript Artwork + Inset Featured Spotlight */}
          <div className="flex min-w-0 flex-col lg:col-span-6">
            <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#2A223D] bg-[#120F1C]">
              <div className="relative min-h-[240px] flex-1 sm:min-h-[320px]">
                <ArtworkFrame
                  src={ARTWORKS.heroDesk.src}
                  alt={ARTWORKS.heroDesk.alt}
                  fallbackTitle={ARTWORKS.heroDesk.fallbackTitle}
                  fallbackSubtitle={ARTWORKS.heroDesk.fallbackSubtitle}
                  priority
                  className="h-full w-full"
                  scrimClassName="bg-gradient-to-t from-[#09080E] via-[#09080E]/35 to-transparent"
                />
              </div>

              {heroBook && (
                <Link
                  to={`/books/${heroBook.slug}`}
                  className="group relative z-10 min-w-0 border-t border-[#2A223D] bg-[#120F1C]/95 p-4 transition-colors hover:bg-[#1A1527] sm:p-5"
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-14 shrink-0 sm:w-20">
                      <BookCoverPreview book={heroBook} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.18em] text-[#C9A45C]">
                        <span className="truncate">Featured Edition</span>
                        <span className="shrink-0 tabular-nums text-[#988FA8]">
                          {heroBook.pageCount} Pages
                        </span>
                      </div>
                      <h2 className="mt-1 truncate font-literary text-xl font-medium text-[#F3EFE6] group-hover:text-[#DEC07C] sm:text-2xl">
                        {heroBook.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#C8C1D4]">
                        {heroBook.description}
                      </p>
                      <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#DEC07C]">
                        Open Publication <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Full-Width Archival Ledger with Verified Statistics */}
        <div className="border-t border-[#2A223D]/80 bg-[#0D0A15]/70">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-y divide-[#2A223D]/70 px-4 sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:px-6">
            <div className="py-5 sm:pr-6">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-[#988FA8]">
                Published Editions
              </dt>
              <dd className="mt-1 font-literary text-3xl tabular-nums text-[#F3EFE6]">
                {books.length}
              </dd>
            </div>
            <div className="py-5 sm:px-6">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-[#988FA8]">
                Preserved Pages
              </dt>
              <dd className="mt-1 font-literary text-3xl tabular-nums text-[#F3EFE6]">
                {totalPages}
              </dd>
            </div>
            <div className="py-5 sm:px-6">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-[#988FA8]">
                Verbatim Poems
              </dt>
              <dd className="mt-1 font-literary text-3xl tabular-nums text-[#F3EFE6]">
                {poems.length}
              </dd>
            </div>
            <div className="py-5 sm:pl-6">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-[#988FA8]">
                Primary Languages
              </dt>
              <dd className="devanagari-verse mt-1 font-literary text-xl text-[#DEC07C] sm:text-2xl">
                मराठी · हिंदी · English
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 2. Featured Publications — Lead Monograph + Curated Shelf */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2A223D]/80 pb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
              The Library · Selected Catalogue
            </p>
            <h2 className="mt-2 font-literary text-3xl font-medium text-[#F3EFE6] headline-balance sm:text-4xl">
              Featured Publications
            </h2>
          </div>
          <Link
            to="/books"
            className="inline-flex items-center gap-1.5 text-sm text-[#DEC07C] transition-colors hover:text-[#F3EFE6]"
          >
            Enter The Library ({books.length}) <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* Lead Publication */}
          {leadPublication && (
            <article className="group flex min-w-0 flex-col gap-6 rounded-2xl border border-[#2A223D] bg-[#120F1C]/80 p-5 sm:flex-row sm:items-center sm:p-6 lg:col-span-6">
              <Link to={`/books/${leadPublication.slug}`} className="mx-auto w-40 shrink-0 sm:mx-0 sm:w-48">
                <BookCoverPreview book={leadPublication} />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-xs text-[#C9A45C]">
                  {leadPublication.language} · {leadPublication.genre} ·{' '}
                  <span className="tabular-nums">{leadPublication.pageCount}p</span>
                </p>
                <Link to={`/books/${leadPublication.slug}`}>
                  <h3 className="mt-2 font-literary text-3xl font-medium leading-snug text-[#F3EFE6] transition-colors group-hover:text-[#DEC07C]">
                    {leadPublication.title}
                  </h3>
                </Link>
                {leadPublication.subtitle && (
                  <p className="mt-1 font-literary text-base italic text-[#A79FB5]">
                    {leadPublication.subtitle}
                  </p>
                )}
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[#C8C1D4]">
                  {leadPublication.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    to={`/read/${leadPublication.slug}`}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#C9A45C] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#09080E] transition-colors hover:bg-[#DEC07C]"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Read Online</span>
                  </Link>
                  <Link
                    to={`/books/${leadPublication.slug}`}
                    className="text-xs font-medium text-[#DEC07C] hover:underline"
                  >
                    Book Details →
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* Secondary Curated Shelf */}
          <div className="min-w-0 divide-y divide-[#2A223D] border-y border-[#2A223D] lg:col-span-6">
            {shelfPublications.map((book) => (
              <article
                key={book.id}
                className="group flex items-center gap-5 py-4 first:pt-2 last:pb-2"
              >
                <Link to={`/books/${book.slug}`} className="w-16 shrink-0 sm:w-20">
                  <BookCoverPreview book={book} />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#988FA8]">
                    {book.language} · {book.genre} ·{' '}
                    <span className="tabular-nums">{book.pageCount} pages</span>
                  </p>
                  <Link to={`/books/${book.slug}`}>
                    <h3 className="devanagari-verse mt-1 truncate font-literary text-2xl font-medium text-[#F3EFE6] transition-colors group-hover:text-[#DEC07C]">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="mt-1 line-clamp-1 text-xs text-[#C8C1D4]">
                    {book.subtitle || book.description}
                  </p>
                  <div className="mt-2.5 flex items-center gap-4 text-xs font-medium">
                    <Link
                      to={`/read/${book.slug}`}
                      className="text-[#DEC07C] hover:underline"
                    >
                      Read Online
                    </Link>
                    <span aria-hidden="true" className="text-[#2A223D]">
                      /
                    </span>
                    <Link
                      to={`/books/${book.slug}`}
                      className="text-[#988FA8] hover:text-[#F3EFE6]"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Poetry Broadsheet Spotlight with Bespoke Quill & Moonlight Artwork */}
      {featuredPoem && (
        <section className="bg-[#0D0A15]/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
              <div className="min-w-0 lg:col-span-5">
                <div className="overflow-hidden rounded-xl border border-[#2A223D]">
                  <ArtworkFrame
                    src={ARTWORKS.poetryQuill.src}
                    alt={ARTWORKS.poetryQuill.alt}
                    fallbackTitle={ARTWORKS.poetryQuill.fallbackTitle}
                    fallbackSubtitle={ARTWORKS.poetryQuill.fallbackSubtitle}
                    className="aspect-[4/3] w-full"
                  />
                </div>

                <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
                  The Poetry Room · Featured Verse
                </p>
                <h2 className="devanagari-verse mt-2 font-literary text-3xl font-medium text-[#F3EFE6] headline-balance sm:text-4xl">
                  {featuredPoem.title}
                </h2>
                <p className="mt-2 text-xs text-[#988FA8]">
                  {featuredPoem.language} · {featuredPoem.category}
                  {featuredPoem.partName ? ` · ${featuredPoem.partName}` : ''}
                </p>

                {featuredPoem.songs && featuredPoem.songs.length > 0 && (
                  <div className="mt-5 border-t border-[#2A223D] pt-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#988FA8]">
                      Companion Melody
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {featuredPoem.songs.map((song) =>
                        song.youtubeUrl ? (
                          <a
                            key={song.title}
                            href={song.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-[#DEC07C] hover:underline"
                          >
                            <Music2 className="h-3.5 w-3.5" />
                            <span>{song.title}</span>
                          </a>
                        ) : (
                          <span
                            key={song.title}
                            className="inline-flex items-center gap-2 text-sm text-[#C8C1D4]"
                          >
                            <Music2 className="h-3.5 w-3.5 text-[#C9A45C]" />
                            <span>{song.title}</span>
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link
                    to={`/poetry/${featuredPoem.slug}`}
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#C9A45C]/60 px-5 text-xs font-medium uppercase tracking-[0.15em] text-[#DEC07C] transition-colors hover:bg-[#C9A45C] hover:text-[#09080E]"
                  >
                    Read Full Poem
                  </Link>
                  <Link
                    to="/poetry"
                    className="inline-flex h-11 items-center text-xs font-medium uppercase tracking-[0.15em] text-[#C8C1D4] hover:text-[#F3EFE6]"
                  >
                    All {poems.length} Poems →
                  </Link>
                </div>
              </div>

              <div className="min-w-0 lg:col-span-7">
                <ProtectedReadingSurface showWatermark>
                  <blockquote className="rounded-2xl border border-[#2A223D] bg-[#120F1C] p-6 sm:p-11">
                    <pre className="devanagari-verse max-w-full whitespace-pre-wrap break-words text-base leading-[1.95] text-[#F3EFE6] sm:text-lg">
                      {featuredPoem.body}
                    </pre>
                    <footer className="mt-7 border-t border-[#2A223D]/80 pt-4 text-xs tracking-wider text-[#988FA8]">
                      — {featuredPoem.author}
                    </footer>
                  </blockquote>
                </ProtectedReadingSurface>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Story Archives & Marathi Theatre Diptych with Bespoke Artworks */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Story Archives */}
          <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#2A223D] bg-[#120F1C]/90">
            <ArtworkFrame
              src={ARTWORKS.thrillerStudy.src}
              alt={ARTWORKS.thrillerStudy.alt}
              fallbackTitle={ARTWORKS.thrillerStudy.fallbackTitle}
              fallbackSubtitle={ARTWORKS.thrillerStudy.fallbackSubtitle}
              className="aspect-[16/10] w-full"
            />
            <div className="flex flex-1 flex-col justify-between p-7">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
                  Story Archives · Fiction &amp; Thrillers
                </p>
                <h2 className="mt-2 font-literary text-3xl text-[#F3EFE6]">
                  Chapters &amp; Character Dossiers
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#C8C1D4]">
                  Step inside <span className="italic text-[#DEC07C]">Chupke Chupke Sach 1 &amp; 2</span> and{' '}
                  <span className="text-[#DEC07C]">मीच प्रश्न, मीच उत्तर</span> with
                  page-linked chapter indexes and verified character profiles.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/stories"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#C9A45C] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#09080E] transition-colors hover:bg-[#DEC07C]"
                >
                  Explore Story Archives <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>

          {/* Marathi Theatre */}
          <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#2A223D] bg-[#120F1C]/90">
            <ArtworkFrame
              src={ARTWORKS.theatreStage.src}
              alt={ARTWORKS.theatreStage.alt}
              fallbackTitle={ARTWORKS.theatreStage.fallbackTitle}
              fallbackSubtitle={ARTWORKS.theatreStage.fallbackSubtitle}
              className="aspect-[16/10] w-full"
            />
            <div className="flex flex-1 flex-col justify-between p-7">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
                  <Theater className="h-3.5 w-3.5" />
                  <span>The Theatre · तीन अंकी मराठी नाटक</span>
                </p>
                <h2 className="devanagari-verse mt-2 font-literary text-3xl text-[#F3EFE6]">
                  मीच प्रश्न, मीच उत्तर — नाट्यसंहिता
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#C8C1D4]">
                  Three acts, 28 stage scenes, cast list, the suspended question-mark
                  stage architecture (<span className="text-[#DEC07C]">?</span>), verbatim
                  opening scenes, and director&apos;s notes.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/theatre"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#C9A45C]/60 bg-[#09080E] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#DEC07C] transition-colors hover:bg-[#C9A45C] hover:text-[#09080E]"
                >
                  Enter The Theatre <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* 5. Midnight Page Sanctuary Preview */}
      {activeExcerpt && (
        <section className="bg-[#0D0A15]/80">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A223D] pb-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-[#C9A45C]">
                <Moon className="h-3.5 w-3.5" />
                <span>
                  Midnight Page · Excerpt {midnightIdx + 1} / {MIDNIGHT_EXCERPTS.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setMidnightIdx(
                      (i) => (i - 1 + MIDNIGHT_EXCERPTS.length) % MIDNIGHT_EXCERPTS.length
                    )
                  }
                  aria-label="Previous midnight excerpt"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:border-[#C9A45C] hover:text-[#DEC07C]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMidnightIdx((i) => (i + 1) % MIDNIGHT_EXCERPTS.length)
                  }
                  aria-label="Next midnight excerpt"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:border-[#C9A45C] hover:text-[#DEC07C]"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <Link
                  to="/midnight-page"
                  className="ml-2 text-xs font-medium text-[#DEC07C] hover:underline"
                >
                  Open Midnight Sanctuary →
                </Link>
              </div>
            </div>

            <ProtectedReadingSurface className="mt-7" showWatermark>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeExcerpt.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <pre className="devanagari-verse max-w-full whitespace-pre-wrap break-words font-literary text-xl leading-[1.85] text-[#F3EFE6] sm:text-2xl">
                    {activeExcerpt.quote}
                  </pre>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-[#DEC07C]">
                      {activeExcerpt.sourceTitle}
                      {activeExcerpt.pageLabel ? ` · ${activeExcerpt.pageLabel}` : ''}
                    </span>
                    <Link
                      to={activeExcerpt.targetUrl}
                      className="inline-flex items-center gap-1 font-medium text-[#C8C1D4] hover:text-[#DEC07C]"
                    >
                      Open in Original Publication <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </ProtectedReadingSurface>
          </div>
        </section>
      )}

      {/* 6. Choose Your Mood — Hairline-Ruled Interactive Matrix */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2A223D]/80 pb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
              Discover by Emotion
            </p>
            <h2 className="mt-2 font-literary text-3xl font-medium text-[#F3EFE6] sm:text-4xl">
              Choose Your Mood
            </h2>
          </div>
          <Link to="/moods" className="text-sm text-[#DEC07C] hover:underline">
            Open Mood Explorer →
          </Link>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="min-w-0 divide-y divide-[#2A223D]/70 border-y border-[#2A223D] lg:col-span-6">
            {MOOD_DEFINITIONS.map((mood) => {
              const isSelected = mood.key === activeMood.key;
              return (
                <button
                  key={mood.key}
                  type="button"
                  onClick={() => setSelectedMoodKey(mood.key)}
                  className={`flex w-full items-center justify-between gap-4 px-3 py-3.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-[#1A1527] text-[#F3EFE6]'
                      : 'text-[#C8C1D4] hover:bg-[#120F1C]'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="devanagari-verse text-xs text-[#C9A45C]">
                      {mood.devanagariLabel}
                    </span>
                    <span className="ml-3 font-literary text-xl text-[#F3EFE6]">
                      {mood.title}
                    </span>
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isSelected ? 'translate-x-0.5 text-[#DEC07C]' : 'text-[#988FA8]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#2A223D] bg-[#120F1C]/85 p-6 sm:p-7 lg:col-span-6">
            <div>
              <p className="devanagari-verse text-xs uppercase tracking-[0.2em] text-[#C9A45C]">
                {activeMood.devanagariLabel}
              </p>
              <h3 className="mt-2 font-literary text-3xl text-[#F3EFE6]">
                {activeMood.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#C8C1D4]">
                {activeMood.description}
              </p>

              <div className="mt-6 space-y-2.5 border-t border-[#2A223D] pt-5">
                {moodBooks.slice(0, 2).map((b) => (
                  <Link
                    key={b.id}
                    to={`/books/${b.slug}`}
                    className="flex items-center justify-between text-sm text-[#F3EFE6] hover:text-[#DEC07C]"
                  >
                    <span className="truncate">{b.title}</span>
                    <span className="ml-3 shrink-0 text-xs text-[#988FA8]">
                      {b.language}
                    </span>
                  </Link>
                ))}
                {moodPoems.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    to={`/poetry/${p.slug}`}
                    className="flex items-center justify-between text-sm text-[#C8C1D4] hover:text-[#DEC07C]"
                  >
                    <span className="devanagari-verse truncate">{p.title}</span>
                    <span className="ml-3 shrink-0 text-xs text-[#988FA8]">
                      {p.language}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between border-t border-[#2A223D] pt-4 text-xs">
              <span className="tabular-nums text-[#988FA8]">
                {moodBooks.length} Books · {moodPoems.length} Poems
              </span>
              <Link
                to={`/moods?mood=${activeMood.key}`}
                className="font-medium text-[#DEC07C] hover:underline"
              >
                Explore This Mood →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Audio Corner & Unsaid Journal Preview */}
      <section className="bg-[#0D0A15]/75">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Audio Corner Preview */}
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#2A223D] bg-[#120F1C] p-6 sm:p-7 lg:col-span-5">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
                  <Headphones className="h-3.5 w-3.5" />
                  <span>Audio Corner</span>
                </p>
                <h2 className="mt-2 font-literary text-3xl text-[#F3EFE6]">
                  Expressive Voice Readings &amp; Tracks
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#C8C1D4]">
                  Listen to expressive calm male and female poetry recitations across Marathi, Hindi, and English alongside {pairedSongPoems.length} companion musical tracks{studioRecordedPoems.length > 0 ? ` and ${studioRecordedPoems.length} studio recordings` : ''}.
                </p>
              </div>
              <div className="mt-6 border-t border-[#2A223D] pt-5">
                <Link
                  to="/audio"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#C9A45C]/60 px-5 text-xs font-medium uppercase tracking-[0.14em] text-[#DEC07C] transition-colors hover:bg-[#C9A45C] hover:text-[#09080E]"
                >
                  Open Audio Corner <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Unsaid Journal Reflections */}
            <div className="min-w-0 lg:col-span-7">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2A223D] pb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
                    Unsaid Journal
                  </p>
                  <h2 className="mt-1 font-literary text-3xl font-medium text-[#F3EFE6]">
                    Author&apos;s Notes &amp; Prefaces
                  </h2>
                </div>
                <Link to="/journal" className="text-xs text-[#DEC07C] hover:underline">
                  Read All Notes →
                </Link>
              </div>

              <div className="divide-y divide-[#2A223D]">
                {journal.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    to={`/journal/${post.slug}`}
                    className="group block py-4 transition-colors"
                  >
                    <p className="text-xs text-[#988FA8]">
                      {post.sourceLabel} · {post.language}
                    </p>
                    <h3 className="mt-1 font-literary text-2xl text-[#F3EFE6] group-hover:text-[#DEC07C]">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#C8C1D4]">
                      {post.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Author Introduction & Architectural Directory */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
              About the Author
            </p>
            <h2 className="mt-2 font-literary text-3xl font-medium text-[#F3EFE6] sm:text-4xl">
              Tejas Purvesh Phirake
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#C8C1D4] sm:text-base">
              <span className="text-[#F3EFE6]">Tejas Purvesh Phirake</span> is an
              independent Indian writer whose literary work explores the quiet
              complexities of human emotions, unspoken feelings, relationships,
              memories, identity, and the questions that often remain unanswered.
            </p>
            <p className="mt-4 font-literary text-lg italic text-[#DEC07C]">
              “Because some stories end on paper, but continue to live within us.”
            </p>
            <div className="mt-6 flex flex-wrap gap-5 text-sm font-medium">
              <Link to="/author" className="text-[#DEC07C] hover:underline">
                Author&apos;s Archive →
              </Link>
              <Link to="/about" className="text-[#C8C1D4] hover:text-[#F3EFE6]">
                About the Author →
              </Link>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
              Complete Literary Index
            </p>
            <div className="mt-4 grid divide-y divide-[#2A223D]/70 border-y border-[#2A223D] sm:grid-cols-2 sm:gap-x-8">
              {ECOSYSTEM_ROOMS.map((room) => (
                <Link
                  key={room.num}
                  to={room.to}
                  className="group flex min-w-0 items-baseline justify-between gap-3 py-3 transition-colors hover:text-[#DEC07C]"
                >
                  <div className="min-w-0 flex-1">
                    <span className="mr-2.5 font-literary text-xs tabular-nums text-[#C9A45C]">
                      {room.num}
                    </span>
                    <span className="font-literary text-xl text-[#F3EFE6] group-hover:text-[#DEC07C]">
                      {room.name}
                    </span>
                    <p className="truncate pl-6 text-xs text-[#988FA8]">{room.note}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#988FA8] group-hover:text-[#DEC07C]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
