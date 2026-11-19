import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Moon, Shuffle } from 'lucide-react';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { MIDNIGHT_EXCERPTS } from '../data/midnightExcerpts';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function MidnightPage() {
  useDocumentMeta(
    'The Midnight Page — Featured Published Excerpts',
    'A quiet nocturnal sanctuary featuring rotating verbatim excerpts from the novels, plays, reflections, and poems of Tejas Purvesh Phirake.'
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const excerptId = searchParams.get('excerpt');
  const shouldReduceMotion = useReducedMotion();

  const initialIndex = useMemo(() => {
    if (excerptId) {
      const idx = MIDNIGHT_EXCERPTS.findIndex((e) => e.id === excerptId);
      if (idx >= 0) return idx;
    }
    return 0;
  }, [excerptId]);

  const [index, setIndex] = useState(initialIndex);

  const current = MIDNIGHT_EXCERPTS[index] || MIDNIGHT_EXCERPTS[0];

  const goTo = (nextIdx: number) => {
    const wrapped = (nextIdx + MIDNIGHT_EXCERPTS.length) % MIDNIGHT_EXCERPTS.length;
    setIndex(wrapped);
    const next = new URLSearchParams(searchParams);
    next.set('excerpt', MIDNIGHT_EXCERPTS[wrapped].id);
    setSearchParams(next);
  };

  const pickRandom = () => {
    if (MIDNIGHT_EXCERPTS.length <= 1) return;
    let nextIdx = index;
    while (nextIdx === index) {
      nextIdx = Math.floor(Math.random() * MIDNIGHT_EXCERPTS.length);
    }
    goTo(nextIdx);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <header className="border-b border-[#2A223D] pb-8 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.26em] text-[#C9A45C]">
          <Moon className="h-3.5 w-3.5" />
          <span>Section 07 · Nocturnal Readings</span>
        </div>
        <h1 className="mt-3 font-literary text-4xl font-medium text-[#F3EFE6] headline-balance sm:text-5xl">
          The Midnight Page
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#C8C1D4]">
          Rotating verbatim passages preserved from published novels, theatre scenes,
          author reflections, and poetry manuscripts.
        </p>
      </header>

      {/* Main Protected Spotlight Card */}
      <ProtectedReadingSurface showWatermark enableFocusVeil className="mt-10">
        <section className="rounded-2xl border border-[#2A223D] bg-[#120F1C]/90 p-5 sm:p-12">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A223D]/80 pb-4 text-xs">
            <span className="uppercase tracking-[0.18em] text-[#C9A45C]">
              {current.sourceType} · {current.language}
              {current.pageLabel ? ` · ${current.pageLabel}` : ''}
            </span>
            <span className="tabular-nums text-[#988FA8]">
              Excerpt {index + 1} of {MIDNIGHT_EXCERPTS.length}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={current.id}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: 'easeOut' }}
              className="my-8 sm:my-10"
            >
              <pre className="devanagari-verse max-w-full whitespace-pre-wrap break-words font-literary text-xl leading-[1.85] text-[#F3EFE6] sm:text-2xl">
                {current.quote}
              </pre>
            </motion.blockquote>
          </AnimatePresence>

          <div className="border-t border-[#2A223D]/80 pt-5">
            <p className="text-sm font-medium text-[#DEC07C]">{current.sourceTitle}</p>
            <p className="mt-1 text-xs text-[#988FA8]">Tejas Purvesh Phirake · BENIYAAZ ROOH</p>
          </div>

          {/* Navigation Actions */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#2A223D] bg-[#09080E] px-3.5 text-xs text-[#C8C1D4] hover:border-[#C9A45C]/60 hover:text-[#F3EFE6]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#2A223D] bg-[#09080E] px-3.5 text-xs text-[#C8C1D4] hover:border-[#C9A45C]/60 hover:text-[#F3EFE6]"
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={pickRandom}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#2A223D] bg-[#09080E] px-3.5 text-xs text-[#DEC07C] hover:border-[#C9A45C]"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span>Another Page</span>
              </button>
            </div>

            <Link
              to={current.targetUrl}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#C9A45C] px-4 text-xs font-semibold text-[#09080E] hover:bg-[#DEC07C]"
            >
              <span>Read in Context</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </ProtectedReadingSurface>

      {/* Excerpt Selector Archive */}
      <section className="mt-12">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#988FA8]">
          All Preserved Midnight Excerpts
        </p>
        <div className="mt-4 divide-y divide-[#2A223D] rounded-xl border border-[#2A223D] bg-[#120F1C]/60">
          {MIDNIGHT_EXCERPTS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(idx)}
              className={`flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors ${
                idx === index ? 'bg-[#1A1527]' : 'hover:bg-[#1A1527]/50'
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`truncate font-literary text-lg ${
                    idx === index ? 'text-[#DEC07C]' : 'text-[#F3EFE6]'
                  }`}
                >
                  {item.sourceTitle}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#988FA8]">
                  {item.language} · {item.sourceType}
                  {item.pageLabel ? ` · ${item.pageLabel}` : ''}
                </p>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-[#C9A45C]">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
