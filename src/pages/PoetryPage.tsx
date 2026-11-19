import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Music2, Search } from 'lucide-react';
import { ArtworkFrame } from '../components/ArtworkFrame';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { POEM_CATEGORIES, POEM_LANGUAGES } from '../data/poemsIndex';
import { ARTWORKS } from '../lib/artworks';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function PoetryPage() {
  useDocumentMeta(
    'Poetry Room — BENIYAAZ ROOH',
    'Read original Marathi, Hindi, and English poetry by Tejas Purvesh Phirake under BENIYAAZ ROOH. Every poem preserved verbatim.'
  );

  const { poems } = useCatalog();
  const { state, toggleFavourite } = useReader();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeLang = searchParams.get('lang') || 'all';
  const activeCat = searchParams.get('cat') || 'all';
  const [query, setQuery] = useState('');

  const setFilter = (key: 'lang' | 'cat', value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const filteredPoems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return poems.filter((p) => {
      if (activeLang !== 'all' && p.language !== activeLang) return false;
      if (activeCat !== 'all' && p.category !== activeCat) return false;
      if (
        q &&
        !`${p.title} ${p.englishSubtitle ?? ''} ${p.body} ${p.partName ?? ''} ${
          p.songs?.map((s) => s.title).join(' ') ?? ''
        }`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [poems, activeLang, activeCat, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      {/* Poetry Universe Header */}
      <header className="border-b border-[#2A223D] pb-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="min-w-0 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#C9A45C]">
                Section 02 · BENIYAAZ ROOH
              </p>
              <Link
                to="/audio"
                className="text-xs font-medium text-[#DEC07C] hover:underline"
              >
                Listen in Audio Corner →
              </Link>
            </div>
            <h1 className="mt-3 font-literary text-4xl font-medium text-[#F3EFE6] headline-balance sm:text-5xl">
              The Poetry Room
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#C8C1D4] sm:text-base">
              An intimate nocturnal anthology across{' '}
              <span className="text-[#F3EFE6]">मराठी, हिंदी, and English</span>. Every verse,
              line break, date, and song pairing is preserved verbatim from{' '}
              <span className="italic text-[#DEC07C]">A Love Truly Never Fades</span>,
              standalone illustrated editions, and notebook pages.
            </p>
          </div>

          <div className="hidden lg:col-span-4 lg:block">
            <div className="overflow-hidden rounded-xl border border-[#2A223D] bg-[#120F1C]">
              <ArtworkFrame
                src={ARTWORKS.poetryQuill.src}
                alt={ARTWORKS.poetryQuill.alt}
                fallbackTitle={ARTWORKS.poetryQuill.fallbackTitle}
                fallbackSubtitle={ARTWORKS.poetryQuill.fallbackSubtitle}
                className="aspect-[16/10]"
              />
            </div>
          </div>
        </div>

        {/* Language & Category Filter Controls */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilter('lang', 'all')}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeLang === 'all'
                    ? 'bg-[#C9A45C] text-[#09080E]'
                    : 'border border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:text-[#F3EFE6]'
                }`}
              >
                All Languages ({poems.length})
              </button>
              {POEM_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setFilter('lang', lang)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    activeLang === lang
                      ? 'bg-[#C9A45C] text-[#09080E]'
                      : 'border border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:text-[#F3EFE6]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#988FA8]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search poem, line, or song..."
                className="h-10 w-full rounded-lg border border-[#2A223D] bg-[#120F1C] pl-9 pr-3 text-xs text-[#F3EFE6] placeholder-[#988FA8] focus:border-[#C9A45C] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('cat', 'all')}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0 ${
                activeCat === 'all'
                  ? 'border border-[#C9A45C] bg-[#1A1527] text-[#DEC07C]'
                  : 'border border-[#2A223D]/70 bg-[#0E0B16] text-[#988FA8] hover:text-[#F3EFE6]'
              }`}
            >
              All Themes
            </button>
            {POEM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter('cat', cat)}
                className={`rounded-lg px-3 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0 ${
                  activeCat === cat
                    ? 'border border-[#C9A45C] bg-[#1A1527] text-[#DEC07C]'
                    : 'border border-[#2A223D]/70 bg-[#0E0B16] text-[#988FA8] hover:text-[#F3EFE6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-6 flex items-center justify-between text-xs text-[#988FA8]">
        <span className="tabular-nums">
          Showing {filteredPoems.length} {filteredPoems.length === 1 ? 'poem' : 'poems'}
        </span>
        {(activeLang !== 'all' || activeCat !== 'all' || query) && (
          <button
            type="button"
            onClick={() => {
              setSearchParams({});
              setQuery('');
            }}
            className="text-[#DEC07C] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredPoems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-literary text-2xl text-[#F3EFE6]">
            No poems matched your selection.
          </p>
          <p className="mt-2 text-sm text-[#988FA8]">
            Try clearing one of the language or emotion filters.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPoems.map((poem) => {
            const isFav = state.favouritePoemIds.includes(poem.id);
            const firstStanza = poem.body.split('\n').slice(0, 4).join('\n');

            return (
              <article
                key={poem.id}
                className="group flex flex-col justify-between rounded-xl border border-[#2A223D] bg-[#120F1C]/85 p-6 transition-colors hover:border-[#C9A45C]/55"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#988FA8]">
                      {poem.number ? (
                        <span className="tabular-nums text-[#C9A45C]">
                          #{String(poem.number).padStart(2, '0')}
                        </span>
                      ) : null}
                      <span>{poem.language}</span>
                      <span aria-hidden="true">·</span>
                      <span>{poem.category}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavourite(poem.id)}
                      aria-label={isFav ? 'Remove from favourites' : 'Save poem to favourites'}
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isFav
                          ? 'text-[#C9A45C]'
                          : 'text-[#988FA8] hover:text-[#DEC07C]'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <Link to={`/poetry/${poem.slug}`} className="mt-3 block">
                    <h2 className="font-literary text-2xl font-medium text-[#F3EFE6] group-hover:text-[#DEC07C]">
                      {poem.title}
                    </h2>
                    {poem.englishSubtitle && (
                      <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-[#988FA8]">
                        {poem.englishSubtitle}
                      </p>
                    )}
                  </Link>

                  <ProtectedReadingSurface className="mt-4">
                    <Link to={`/poetry/${poem.slug}`} className="block">
                      <p className="devanagari-verse line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-[#C8C1D4]">
                        {firstStanza}
                      </p>
                    </Link>
                  </ProtectedReadingSurface>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#2A223D]/70 pt-3.5 text-xs">
                  {poem.songs?.[0] ? (
                    <span className="flex min-w-0 items-center gap-1.5 text-[#988FA8]">
                      <Music2 className="h-3.5 w-3.5 shrink-0 text-[#C9A45C]" />
                      <span className="truncate">{poem.songs[0].title}</span>
                    </span>
                  ) : (
                    <span className="text-[#988FA8]">{poem.dateLabel || poem.sourceTitle}</span>
                  )}
                  <Link
                    to={`/poetry/${poem.slug}`}
                    className="ml-3 shrink-0 font-medium text-[#DEC07C] hover:underline"
                  >
                    Read →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
