import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Feather, FileText, Heart } from 'lucide-react';
import { BookCoverPreview } from '../components/BookCoverPreview';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { MOOD_DEFINITIONS } from '../data/moodCatalog';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type { MoodKey } from '../types/literary';

export function MoodsPage() {
  useDocumentMeta(
    'Choose Your Mood — Emotion-Guided Literary Discovery',
    'Discover books, Marathi/Hindi/English poems, and reflections by Tejas Purvesh Phirake through emotion-based literary moods.'
  );

  const { books, poems, journal } = useCatalog();
  const { state, toggleFavourite } = useReader();
  const [searchParams, setSearchParams] = useSearchParams();

  const moodParam = searchParams.get('mood') as MoodKey | null;
  const activeMood = useMemo(
    () =>
      MOOD_DEFINITIONS.find((m) => m.key === moodParam) || MOOD_DEFINITIONS[0],
    [moodParam]
  );

  const selectMood = (key: MoodKey) => {
    const next = new URLSearchParams(searchParams);
    next.set('mood', key);
    setSearchParams(next);
  };

  const matchingBooks = useMemo(
    () => books.filter((b) => activeMood.bookSlugs.includes(b.slug)),
    [books, activeMood.bookSlugs]
  );

  const matchingPoems = useMemo(
    () => poems.filter((p) => activeMood.poemCategories.includes(p.category)),
    [poems, activeMood.poemCategories]
  );

  const matchingJournal = useMemo(
    () => journal.filter((j) => activeMood.journalSlugs.includes(j.slug)),
    [journal, activeMood.journalSlugs]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <header className="border-b border-[#2A223D] pb-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#C9A45C]">
          Section 08 · Emotion-First Discovery
        </p>
        <h1 className="mt-2 font-literary text-4xl font-medium text-[#F3EFE6] headline-balance sm:text-5xl">
          Choose Your Mood
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#C8C1D4] sm:text-base">
          Select what you are carrying tonight to surface matching books, verses,
          and author notes from the published archive.
        </p>

        {/* Hairline-Ruled Mood Selector Matrix */}
        <div className="mt-8 grid overflow-hidden rounded-xl border border-[#2A223D] bg-[#2A223D] gap-px sm:grid-cols-2 lg:grid-cols-4">
          {MOOD_DEFINITIONS.map((mood) => {
            const isSelected = mood.key === activeMood.key;
            const poemCount = poems.filter((p) =>
              mood.poemCategories.includes(p.category)
            ).length;
            const totalItems =
              mood.bookSlugs.length + poemCount + mood.journalSlugs.length;

            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => selectMood(mood.key)}
                className={`flex flex-col p-5 text-left transition-colors ${
                  isSelected
                    ? 'bg-[#1A1527] shadow-[inset_0_2px_0_0_#C9A45C]'
                    : 'bg-[#09080E] hover:bg-[#120F1C]'
                }`}
              >
                <span className="devanagari-verse text-xs font-medium text-[#C9A45C]">
                  {mood.devanagariLabel}
                </span>
                <span
                  className={`mt-1.5 font-literary text-xl ${
                    isSelected ? 'text-[#DEC07C]' : 'text-[#F3EFE6]'
                  }`}
                >
                  {mood.title}
                </span>
                <span className="mt-2 text-xs tabular-nums text-[#988FA8]">
                  {totalItems} matching works
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Active Mood Banner */}
      <section className="mt-10 border-b border-[#2A223D] pb-8">
        <p className="devanagari-verse text-xs font-medium uppercase tracking-[0.18em] text-[#C9A45C]">
          {activeMood.devanagariLabel}
        </p>
        <h2 className="mt-1.5 font-literary text-3xl text-[#F3EFE6]">
          {activeMood.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#C8C1D4]">
          {activeMood.description}
        </p>
      </section>

      {/* Matching Books */}
      {matchingBooks.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#C9A45C]">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Books &amp; Editions ({matchingBooks.length})</span>
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {matchingBooks.map((book) => (
              <div
                key={book.id}
                className="flex gap-4 rounded-xl border border-[#2A223D] bg-[#120F1C]/80 p-4 transition-colors hover:border-[#C9A45C]/50"
              >
                <Link to={`/books/${book.slug}`} className="w-24 shrink-0">
                  <BookCoverPreview book={book} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-[11px] tabular-nums text-[#C9A45C]">
                    {book.language} · {book.pageCount}p
                  </p>
                  <Link to={`/books/${book.slug}`}>
                    <h3 className="mt-1 font-literary text-xl leading-snug text-[#F3EFE6] hover:text-[#DEC07C]">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="mt-1.5 line-clamp-2 text-xs text-[#988FA8]">
                    {book.description}
                  </p>
                  <div className="mt-auto flex items-center gap-3 pt-3 text-xs font-medium">
                    <Link
                      to={`/read/${book.slug}`}
                      className="text-[#DEC07C] hover:underline"
                    >
                      Read Online
                    </Link>
                    <Link
                      to={`/books/${book.slug}`}
                      className="text-[#C8C1D4] hover:text-[#F3EFE6]"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Matching Poems */}
      {matchingPoems.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#C9A45C]">
              <Feather className="h-3.5 w-3.5" />
              <span>Poems ({matchingPoems.length})</span>
            </div>
            {activeMood.poemCategories[0] && (
              <Link
                to={`/poetry?cat=${encodeURIComponent(activeMood.poemCategories[0])}`}
                className="inline-flex items-center gap-1 text-xs text-[#DEC07C] hover:underline"
              >
                Open in Poetry Room <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {matchingPoems.slice(0, 12).map((poem) => {
              const isFav = state.favouritePoemIds.includes(poem.id);
              const previewLines = poem.body.split('\n').slice(0, 3).join('\n');
              return (
                <article
                  key={poem.id}
                  className="flex flex-col rounded-xl border border-[#2A223D] bg-[#120F1C]/80 p-5 transition-colors hover:border-[#C9A45C]/50"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[#988FA8]">
                    <span>
                      {poem.language} · {poem.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFavourite(poem.id)}
                      aria-label={isFav ? 'Remove favourite' : 'Save poem'}
                      className={`p-1 transition-colors ${
                        isFav
                          ? 'text-[#DEC07C]'
                          : 'text-[#988FA8] hover:text-[#F3EFE6]'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <Link to={`/poetry/${poem.slug}`} className="mt-2 block">
                    <h3 className="devanagari-verse font-literary text-xl text-[#F3EFE6] hover:text-[#DEC07C]">
                      {poem.title}
                    </h3>
                  </Link>
                  <ProtectedReadingSurface className="mt-3 flex-1">
                    <pre className="devanagari-verse line-clamp-3 max-w-full whitespace-pre-wrap break-words text-xs leading-relaxed text-[#C8C1D4]">
                      {previewLines}
                    </pre>
                  </ProtectedReadingSurface>

                  <Link
                    to={`/poetry/${poem.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#DEC07C] hover:underline"
                  >
                    Read Full Verse <ArrowRight className="h-3 w-3" />
                  </Link>
                </article>
              );
            })}
          </div>
          {matchingPoems.length > 12 && activeMood.poemCategories[0] && (
            <div className="mt-6 text-center">
              <Link
                to={`/poetry?cat=${encodeURIComponent(activeMood.poemCategories[0])}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#C9A45C]/50 px-5 text-xs font-medium text-[#DEC07C] hover:bg-[#C9A45C] hover:text-[#09080E]"
              >
                View All {matchingPoems.length} Poems in This Mood →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Matching Journal Notes */}
      {matchingJournal.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#C9A45C]">
            <FileText className="h-3.5 w-3.5" />
            <span>The Unsaid Journal ({matchingJournal.length})</span>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {matchingJournal.map((post) => (
              <Link
                key={post.id}
                to={`/journal/${post.slug}`}
                className="group rounded-xl border border-[#2A223D] bg-[#120F1C]/80 p-5 transition-colors hover:border-[#C9A45C]/50"
              >
                <p className="text-xs text-[#988FA8]">
                  {post.sourceLabel} · {post.language}
                </p>
                <h3 className="mt-1.5 font-literary text-xl text-[#F3EFE6] group-hover:text-[#DEC07C]">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#C8C1D4]">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
