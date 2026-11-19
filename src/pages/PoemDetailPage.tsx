import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  EyeOff,
  Heart,
  Music2,
  Type,
} from 'lucide-react';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type { ReaderSurfaceMode } from '../types/literary';

export function PoemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { poems } = useCatalog();
  const { state, toggleFavourite, markViewed, setPreferences } = useReader();

  const index = useMemo(() => poems.findIndex((p) => p.slug === slug), [poems, slug]);
  const poem = index > -1 ? poems[index] : undefined;
  const prevPoem = index > 0 ? poems[index - 1] : undefined;
  const nextPoem = index > -1 && index < poems.length - 1 ? poems[index + 1] : undefined;

  useDocumentMeta(
    poem ? `${poem.title} — BENIYAAZ ROOH` : 'Poem Not Found',
    poem ? poem.body.slice(0, 145) : undefined
  );

  useEffect(() => {
    if (poem) {
      markViewed({
        type: 'poem',
        slug: poem.slug,
        title: poem.title,
        subtitle: `${poem.language} · ${poem.category}`,
      });
    }
  }, [poem?.slug]);

  if (!poem) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-literary text-3xl text-[#F3EFE6]">Poem not found</h1>
        <Link
          to="/poetry"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C9A45C] px-5 py-2.5 text-xs font-semibold text-[#09080E]"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Poetry Room
        </Link>
      </div>
    );
  }

  const isFav = state.favouritePoemIds.includes(poem.id);
  const { fontSizePx, lineHeight, surfaceMode, minimalMode } = state.preferences;

  const surfaceStyles: Record<ReaderSurfaceMode, string> = {
    midnight: 'bg-[#120F1C] border-[#2A223D] text-[#F3EFE6]',
    ink: 'bg-[#040406] border-[#1F1B2C] text-[#EFECE6]',
    paper: 'bg-[#F6F1E7] border-[#DDD3C0] text-[#1E1A16]',
  };

  return (
    <div
      className={
        minimalMode
          ? 'fixed inset-0 z-50 overflow-y-auto bg-[#07060B] px-4 py-10 sm:px-6'
          : 'mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16'
      }
    >
      <ScrollProgressHairline />

      {/* Top Action Strip */}
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        {minimalMode ? (
          <button
            type="button"
            onClick={() => setPreferences({ minimalMode: false })}
            className="inline-flex items-center gap-2 rounded-lg border border-[#2A223D] bg-[#120F1C] px-3.5 py-2 text-xs text-[#DEC07C]"
          >
            <EyeOff className="h-3.5 w-3.5" /> Exit Minimal Mode
          </button>
        ) : (
          <Link
            to="/poetry"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#988FA8] hover:text-[#DEC07C]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Poetry Room
          </Link>
        )}

        {/* Typography & Calm Surface Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-[#2A223D] bg-[#120F1C] p-1">
            <Type className="ml-1.5 h-3.5 w-3.5 text-[#988FA8]" />
            <button
              type="button"
              onClick={() =>
                setPreferences({ fontSizePx: Math.max(15, fontSizePx - 1) })
              }
              aria-label="Decrease font size"
              className="rounded px-2 py-1 text-xs text-[#C8C1D4] hover:text-[#DEC07C]"
            >
              A-
            </button>
            <span className="text-[11px] tabular-nums text-[#988FA8]">{fontSizePx}</span>
            <button
              type="button"
              onClick={() =>
                setPreferences({ fontSizePx: Math.min(26, fontSizePx + 1) })
              }
              aria-label="Increase font size"
              className="rounded px-2 py-1 text-xs text-[#C8C1D4] hover:text-[#DEC07C]"
            >
              A+
            </button>
          </div>

          <div
            className="flex items-center gap-1 rounded-lg border border-[#2A223D] bg-[#120F1C] p-1 text-xs"
            role="group"
            aria-label="Line spacing"
          >
            {[
              { label: 'Compact', value: 1.65 },
              { label: 'Balanced', value: 1.9 },
              { label: 'Airy', value: 2.15 },
            ].map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => setPreferences({ lineHeight: sp.value })}
                className={`rounded px-2 py-1 text-[11px] transition-colors ${
                  Math.abs(lineHeight - sp.value) < 0.08
                    ? 'bg-[#2A223D] text-[#DEC07C]'
                    : 'text-[#988FA8] hover:text-[#F3EFE6]'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-[#2A223D] bg-[#120F1C] p-1 text-xs">
            {(['midnight', 'ink', 'paper'] as ReaderSurfaceMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreferences({ surfaceMode: mode })}
                className={`rounded px-2.5 py-1 capitalize transition-colors ${
                  surfaceMode === mode
                    ? 'bg-[#C9A45C] font-medium text-[#09080E]'
                    : 'text-[#988FA8] hover:text-[#F3EFE6]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {!minimalMode && (
            <button
              type="button"
              onClick={() => setPreferences({ minimalMode: true })}
              className="rounded-lg border border-[#2A223D] bg-[#120F1C] px-3 py-1.5 text-xs text-[#C8C1D4] hover:border-[#C9A45C]/60 hover:text-[#DEC07C]"
            >
              Minimal Mode
            </button>
          )}
        </div>
      </div>

      {/* Main Protected Poem Reading Plate */}
      <ProtectedReadingSurface
        showWatermark
        enableFocusVeil
        className="mx-auto mt-8 max-w-3xl"
      >
        <article
          className={`rounded-2xl border p-6 shadow-2xl transition-colors sm:p-12 ${surfaceStyles[surfaceMode]}`}
        >
          <header
            className={`border-b pb-6 ${
              surfaceMode === 'paper' ? 'border-[#DDD3C0]' : 'border-[#2A223D]'
            }`}
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs uppercase tracking-[0.18em] text-[#C9A45C]">
              {poem.number ? (
                <span className="tabular-nums">
                  No. {String(poem.number).padStart(2, '0')}
                </span>
              ) : null}
              {poem.number ? <span aria-hidden="true">·</span> : null}
              <span>{poem.language}</span>
              <span aria-hidden="true">·</span>
              <span>{poem.category}</span>
              {poem.dateLabel ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{poem.dateLabel}</span>
                </>
              ) : null}
            </div>

            <h1 className="mt-3 font-literary text-3xl font-semibold leading-tight headline-balance sm:text-5xl">
              {poem.title}
            </h1>
            {poem.englishSubtitle && (
              <p
                className={`mt-1.5 text-xs uppercase tracking-[0.2em] ${
                  surfaceMode === 'paper' ? 'text-[#6A5F52]' : 'text-[#988FA8]'
                }`}
              >
                {poem.englishSubtitle}
              </p>
            )}
            {poem.partName && (
              <p
                className={`mt-2 text-xs ${
                  surfaceMode === 'paper' ? 'text-[#6A5F52]' : 'text-[#A79FB5]'
                }`}
              >
                {poem.partName}
              </p>
            )}
          </header>

          {poem.dedication && (
            <div
              className={`my-6 rounded-xl border p-5 text-sm italic whitespace-pre-line ${
                surfaceMode === 'paper'
                  ? 'border-[#DDD3C0] bg-[#EFE8DA] text-[#443C32]'
                  : 'border-[#2A223D] bg-[#0D0A15] text-[#C8C1D4]'
              }`}
            >
              {poem.dedication}
            </div>
          )}

          <div className="py-8">
            <pre
              className="devanagari-verse whitespace-pre-wrap break-words font-normal"
              style={{ fontSize: `${fontSizePx}px`, lineHeight }}
            >
              {poem.body}
            </pre>
          </div>

          <footer
            className={`border-t pt-6 ${
              surfaceMode === 'paper' ? 'border-[#DDD3C0]' : 'border-[#2A223D]'
            }`}
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-literary text-lg font-medium">{poem.author}</p>
                <p
                  className={`text-xs ${
                    surfaceMode === 'paper' ? 'text-[#6A5F52]' : 'text-[#988FA8]'
                  }`}
                >
                  TEJAS · BENIYAAZ ROOH
                  {poem.sourcePublicationSlug && poem.sourceTitle ? (
                    <>
                      {' · '}
                      <Link
                        to={`/books/${poem.sourcePublicationSlug}`}
                        className="text-[#C9A45C] hover:underline"
                      >
                        {poem.sourceTitle}
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavourite(poem.id)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-medium transition-colors ${
                    isFav
                      ? 'border-[#C9A45C] bg-[#C9A45C] text-[#09080E]'
                      : surfaceMode === 'paper'
                      ? 'border-[#CEC2AD] text-[#1E1A16] hover:border-[#C9A45C]'
                      : 'border-[#2A223D] text-[#F3EFE6] hover:border-[#C9A45C]'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
                  <span>{isFav ? 'Saved to Bookshelf' : 'Save Poem'}</span>
                </button>
              </div>
            </div>

            {poem.songs && poem.songs.length > 0 && (
              <div
                className={`mt-6 rounded-xl border p-4 ${
                  surfaceMode === 'paper'
                    ? 'border-[#DDD3C0] bg-[#EFE8DA]'
                    : 'border-[#2A223D] bg-[#0D0A15]'
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A45C]">
                  Companion Track from Original Edition
                </p>
                <div className="mt-2 flex flex-wrap gap-4">
                  {poem.songs.map((song) => (
                    <div key={song.title} className="flex items-center gap-2 text-sm">
                      <Music2 className="h-4 w-4 text-[#C9A45C]" />
                      <span>
                        {song.title}
                        {song.artist ? ` — ${song.artist}` : ''}
                      </span>
                      {song.youtubeUrl && (
                        <a
                          href={song.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-[#C9A45C] underline underline-offset-4"
                        >
                          Listen on YouTube
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </footer>
        </article>
      </ProtectedReadingSurface>

      {/* Previous / Next Poem Navigation */}
      <nav
        aria-label="Adjacent poems"
        className="mx-auto mt-8 flex max-w-3xl items-center justify-between gap-4 text-xs"
      >
        {prevPoem ? (
          <Link
            to={`/poetry/${prevPoem.slug}`}
            className="inline-flex items-center gap-2 text-[#C8C1D4] hover:text-[#DEC07C]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="max-w-[140px] truncate sm:max-w-xs">{prevPoem.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {nextPoem ? (
          <Link
            to={`/poetry/${nextPoem.slug}`}
            className="inline-flex items-center gap-2 text-right text-[#C8C1D4] hover:text-[#DEC07C]"
          >
            <span className="max-w-[140px] truncate sm:max-w-xs">{nextPoem.title}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
