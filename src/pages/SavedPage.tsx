import { Link } from 'react-router-dom';
import { BookOpen, Bookmark, Clock, Heart, Trash2 } from 'lucide-react';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function SavedPage() {
  useDocumentMeta(
    'My Bookshelf — Saved Bookmarks, Favourites & Reading Progress',
    'Your locally saved book reading progress, page bookmarks, favourite poems, and recently viewed works.'
  );

  const { books, poems } = useCatalog();
  const { state, toggleFavourite, toggleBookmark, clearHistory } = useReader();

  const favouritePoems = poems.filter((p) => state.favouritePoemIds.includes(p.id));
  const booksWithProgress = books
    .map((b) => ({
      book: b,
      progress: state.progressBySlug[b.slug],
      bookmarks: state.bookmarksBySlug[b.slug] ?? [],
    }))
    .filter((item) => item.progress || item.bookmarks.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <header className="border-b border-[#2A223D] pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#C9A45C]">
          Section 09 · Private Local Reading Memory
        </p>
        <h1 className="mt-2 font-literary text-4xl font-medium text-[#F3EFE6] headline-balance sm:text-5xl">
          My Bookshelf
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#C8C1D4]">
          Saved privately in this browser with no account required — your reading
          positions, bookmarked manuscript pages, favourite verses, and recently visited works.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        {/* Book Reading Progress & Page Bookmarks */}
        <section className="min-w-0 lg:col-span-6">
          <h2 className="flex items-center gap-2 font-literary text-2xl text-[#F3EFE6]">
            <BookOpen className="h-5 w-5 text-[#C9A45C]" />
            <span>Books in Progress &amp; Page Bookmarks</span>
          </h2>

          {booksWithProgress.length === 0 ? (
            <div className="mt-4 rounded-xl border border-[#2A223D] bg-[#120F1C]/60 p-6 text-sm text-[#988FA8]">
              Open any book in the online reader to track reading progress and bookmark
              specific pages.{' '}
              <Link to="/books" className="text-[#DEC07C] hover:underline">
                Browse Library →
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {booksWithProgress.map(({ book, progress, bookmarks }) => {
                const pct =
                  progress && progress.totalPages > 0
                    ? Math.round((progress.currentPage / progress.totalPages) * 100)
                    : 0;
                return (
                  <div
                    key={book.id}
                    className="rounded-xl border border-[#2A223D] bg-[#120F1C] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/books/${book.slug}`}
                          className="font-literary text-xl text-[#F3EFE6] hover:text-[#DEC07C]"
                        >
                          {book.title}
                        </Link>
                        {progress && (
                          <p className="mt-1 text-xs tabular-nums text-[#988FA8]">
                            Last read: Page {progress.currentPage} of {progress.totalPages}{' '}
                            ({pct}%)
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/read/${book.slug}`}
                        className="shrink-0 rounded-lg bg-[#C9A45C] px-3.5 py-1.5 text-xs font-semibold text-[#09080E] hover:bg-[#DEC07C]"
                      >
                        Resume
                      </Link>
                    </div>

                    {pct > 0 && (
                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#2A223D]">
                        <div className="h-full bg-[#C9A45C]" style={{ width: `${pct}%` }} />
                      </div>
                    )}

                    {bookmarks.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#2A223D] pt-3">
                        <Bookmark className="h-3.5 w-3.5 text-[#C9A45C]" />
                        {bookmarks.map((bm) => (
                          <div
                            key={bm.page}
                            className="inline-flex items-center overflow-hidden rounded-md border border-[#2A223D] bg-[#09080E] text-xs"
                          >
                            <Link
                              to={`/read/${book.slug}?page=${bm.page}`}
                              className="px-2.5 py-1 tabular-nums text-[#F3EFE6] hover:text-[#DEC07C]"
                            >
                              Page {bm.page}
                            </Link>
                            <button
                              type="button"
                              onClick={() => toggleBookmark(book.slug, bm.page)}
                              aria-label={`Remove bookmark on page ${bm.page}`}
                              className="border-l border-[#2A223D] px-2 py-1 text-[#988FA8] hover:text-[#F3EFE6]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Favourite Poems */}
        <section className="min-w-0 lg:col-span-6">
          <h2 className="flex items-center gap-2 font-literary text-2xl text-[#F3EFE6]">
            <Heart className="h-5 w-5 text-[#C9A45C]" />
            <span>Favourite Poems ({favouritePoems.length})</span>
          </h2>

          {favouritePoems.length === 0 ? (
            <div className="mt-4 rounded-xl border border-[#2A223D] bg-[#120F1C]/60 p-6 text-sm text-[#988FA8]">
              Heart any poem in the Poetry Room to keep it close here.{' '}
              <Link to="/poetry" className="text-[#DEC07C] hover:underline">
                Enter Poetry →
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {favouritePoems.map((poem) => (
                <div
                  key={poem.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#2A223D] bg-[#120F1C] px-4 py-3.5"
                >
                  <Link to={`/poetry/${poem.slug}`} className="min-w-0 flex-1">
                    <p className="truncate font-literary text-xl text-[#F3EFE6] hover:text-[#DEC07C]">
                      {poem.title}
                    </p>
                    <p className="text-xs text-[#988FA8]">
                      {poem.language} · {poem.category}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFavourite(poem.id)}
                    aria-label="Remove from favourites"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#C9A45C] hover:bg-[#1A1527]"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recently Viewed History */}
      <section className="mt-14 border-t border-[#2A223D] pt-10">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-literary text-2xl text-[#F3EFE6]">
            <Clock className="h-5 w-5 text-[#C9A45C]" />
            <span>Recently Viewed</span>
          </h2>
          {state.recentlyViewed.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-[#988FA8] hover:text-[#DEC07C]"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear History
            </button>
          )}
        </div>

        {state.recentlyViewed.length === 0 ? (
          <p className="mt-4 text-sm text-[#988FA8]">
            Your recently opened books, poems, and notes will appear here.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.recentlyViewed.map((item) => {
              const target =
                item.type === 'book'
                  ? `/books/${item.slug}`
                  : item.type === 'poem'
                  ? `/poetry/${item.slug}`
                  : `/journal/${item.slug}`;
              return (
                <Link
                  key={`${item.type}-${item.slug}`}
                  to={target}
                  className="rounded-xl border border-[#2A223D] bg-[#120F1C]/80 p-4 transition-colors hover:border-[#C9A45C]/50"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#C9A45C]">
                    {item.type}
                  </p>
                  <p className="mt-1 truncate font-literary text-lg text-[#F3EFE6]">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="mt-0.5 truncate text-xs text-[#988FA8]">
                      {item.subtitle}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
