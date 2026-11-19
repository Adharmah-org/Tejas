import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Users } from 'lucide-react';
import { ArtworkFrame } from '../components/ArtworkFrame';
import { BookCoverPreview } from '../components/BookCoverPreview';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import {
  DIRECTOR_NOTES,
  THEATRE_ACTS,
  THEATRE_CAST,
  THEATRE_PLAY_META,
  THEATRE_VERBATIM_EXCERPTS,
} from '../data/theatreArchiveData';
import { ARTWORKS } from '../lib/artworks';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function TheatrePage() {
  useDocumentMeta(
    'The Theatre — मीच प्रश्न, मीच उत्तर (तीन अंकी मराठी नाटक)',
    'Complete 3-Act, 28-Scene Marathi stage play by Tejas Purvesh Phirake — character list, stage architecture, verbatim scenes, and director notes.'
  );

  const { books } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const playBook = useMemo(
    () => books.find((b) => b.slug === THEATRE_PLAY_META.bookSlug),
    [books]
  );

  const actParam = Number(searchParams.get('act'));
  const initialActIdx =
    Number.isFinite(actParam) && actParam >= 1 && actParam <= THEATRE_ACTS.length
      ? actParam - 1
      : 0;
  const [selectedActIdx, setSelectedActIdx] = useState(initialActIdx);
  const [selectedExcerptId, setSelectedExcerptId] = useState(
    THEATRE_VERBATIM_EXCERPTS[0].id
  );

  const activeAct = THEATRE_ACTS[selectedActIdx] || THEATRE_ACTS[0];
  const activeExcerpt =
    THEATRE_VERBATIM_EXCERPTS.find((e) => e.id === selectedExcerptId) ||
    THEATRE_VERBATIM_EXCERPTS[0];

  const handleSelectAct = (idx: number) => {
    setSelectedActIdx(idx);
    const next = new URLSearchParams(searchParams);
    next.set('act', String(idx + 1));
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      {/* Stage Hero */}
      <header className="grid gap-10 border-b border-[#2A223D] pb-12 lg:grid-cols-12 lg:items-center">
        <div className="min-w-0 lg:col-span-7">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#C9A45C]">
            Section 05 · मराठी नाट्यसंहिता
          </p>
          <h1 className="devanagari-verse mt-3 font-literary text-4xl font-medium text-[#F3EFE6] headline-balance sm:text-5xl">
            {THEATRE_PLAY_META.title}
          </h1>
          <p className="devanagari-verse mt-2 text-lg text-[#DEC07C]">
            {THEATRE_PLAY_META.subtitle}
          </p>

          <ProtectedReadingSurface className="mt-5 max-w-2xl">
            <p className="devanagari-verse text-sm leading-relaxed text-[#C8C1D4] sm:text-base">
              {THEATRE_PLAY_META.stageArchitecture}
            </p>
          </ProtectedReadingSurface>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#988FA8]">
            <span>{THEATRE_PLAY_META.authorCredit}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">३ अंक · २८ प्रवेश · ४६ पृष्ठे</span>
            <span aria-hidden="true">·</span>
            <span>{THEATRE_PLAY_META.approximateRuntime}</span>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to={`/read/${THEATRE_PLAY_META.bookSlug}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#C9A45C] px-5 text-xs font-semibold uppercase tracking-[0.15em] text-[#09080E] transition-colors hover:bg-[#DEC07C] whitespace-nowrap shrink-0"
            >
              <BookOpen className="h-4 w-4" />
              <span>Read Full Script</span>
            </Link>
            <Link
              to={`/books/${THEATRE_PLAY_META.bookSlug}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#2A223D] bg-[#120F1C] px-5 text-xs text-[#F3EFE6] hover:border-[#C9A45C] whitespace-nowrap shrink-0"
            >
              <span>Publication Dossier</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid min-w-0 items-end gap-4 sm:grid-cols-2 lg:col-span-5">
          <div className="overflow-hidden rounded-xl border border-[#2A223D] bg-[#120F1C]">
            <ArtworkFrame
              src={ARTWORKS.theatreStage.src}
              alt={ARTWORKS.theatreStage.alt}
              fallbackTitle={ARTWORKS.theatreStage.fallbackTitle}
              fallbackSubtitle={ARTWORKS.theatreStage.fallbackSubtitle}
              className="aspect-[3/4]"
            />
          </div>
          <div className="mx-auto w-44 sm:w-full">
            {playBook ? (
              <Link to={`/read/${playBook.slug}`} className="block">
                <BookCoverPreview book={playBook} />
              </Link>
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-xl border border-[#2A223D] bg-[#120F1C] p-6 text-center">
                <span className="font-literary text-6xl text-[#C9A45C]">?</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Three-Act Navigator & 28 Scenes */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
              अंक आणि प्रवेश अनुक्रमणिका
            </p>
            <h2 className="mt-2 font-literary text-3xl font-medium text-[#F3EFE6]">
              Three-Act Stage Structure
            </h2>
          </div>
          <Link
            to={`/read/${THEATRE_PLAY_META.bookSlug}?page=${activeAct.actPage}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#DEC07C] hover:underline"
          >
            Jump to {activeAct.actNumber} (Page {activeAct.actPage})
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {THEATRE_ACTS.map((act, idx) => {
            const isSelected = idx === selectedActIdx;
            return (
              <button
                key={act.actNumber}
                type="button"
                onClick={() => handleSelectAct(idx)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-[#C9A45C] bg-[#1A1527]'
                    : 'border-[#2A223D] bg-[#120F1C] hover:border-[#C9A45C]/40'
                }`}
              >
                <p className="text-xs text-[#C9A45C]">
                  {act.actNumber} · <span className="tabular-nums">p.{act.actPage}</span>
                </p>
                <h3 className="devanagari-verse mt-1 font-literary text-2xl text-[#F3EFE6]">
                  {act.title}
                </h3>
                <p className="mt-1 text-xs tabular-nums text-[#988FA8]">
                  {act.scenes.length} प्रवेश
                </p>
              </button>
            );
          })}
        </div>

        {/* Scene List for Active Act */}
        <div className="mt-6 divide-y divide-[#2A223D] rounded-xl border border-[#2A223D] bg-[#120F1C]/75">
          {activeAct.scenes.map((scene) => (
            <Link
              key={scene.sceneNumber}
              to={`/read/${THEATRE_PLAY_META.bookSlug}?page=${scene.page}`}
              className="group flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#1A1527]"
            >
              <div className="flex items-baseline gap-4">
                <span className="w-20 shrink-0 text-xs font-medium text-[#C9A45C]">
                  {scene.sceneNumber}
                </span>
                <span className="devanagari-verse font-literary text-xl text-[#F3EFE6] group-hover:text-[#DEC07C]">
                  {scene.title}
                </span>
              </div>
              <span className="inline-flex items-center gap-2 text-xs tabular-nums text-[#988FA8] group-hover:text-[#DEC07C]">
                Page {scene.page} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}

          {activeAct.closingQuestionTitle && activeAct.closingQuestionPage && (
            <Link
              to={`/read/${THEATRE_PLAY_META.bookSlug}?page=${activeAct.closingQuestionPage}`}
              className="group flex flex-wrap items-center justify-between gap-4 bg-[#0D0A15]/90 px-5 py-3.5 transition-colors hover:bg-[#1A1527]"
            >
              <div className="flex items-baseline gap-4">
                <span className="w-20 shrink-0 text-xs font-medium text-[#DEC07C]">
                  प्रश्न
                </span>
                <span className="devanagari-verse font-literary text-lg italic text-[#DEC07C]">
                  {activeAct.closingQuestionTitle}
                </span>
              </div>
              <span className="inline-flex items-center gap-2 text-xs tabular-nums text-[#988FA8] group-hover:text-[#DEC07C]">
                Page {activeAct.closingQuestionPage} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* Verbatim Opening Scenes Reader */}
      <section className="mt-14 border-t border-[#2A223D] pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
              Verbatim Script Preview
            </p>
            <h2 className="mt-2 font-literary text-3xl font-medium text-[#F3EFE6]">
              From the Opening Curtain
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {THEATRE_VERBATIM_EXCERPTS.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => setSelectedExcerptId(ex.id)}
                className={`rounded-lg border px-3.5 py-2 text-xs transition-colors whitespace-nowrap shrink-0 ${
                  ex.id === activeExcerpt.id
                    ? 'border-[#C9A45C] bg-[#C9A45C] font-semibold text-[#09080E]'
                    : 'border-[#2A223D] bg-[#120F1C] text-[#C8C1D4] hover:border-[#C9A45C]/50'
                }`}
              >
                {ex.heading}
              </button>
            ))}
          </div>
        </div>

        <ProtectedReadingSurface showWatermark enableFocusVeil className="mt-6">
          <article className="rounded-xl border border-[#2A223D] bg-[#120F1C] p-6 sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A223D] pb-4">
              <h3 className="devanagari-verse font-literary text-2xl text-[#DEC07C]">
                {activeExcerpt.heading}
              </h3>
              <Link
                to={`/read/${THEATRE_PLAY_META.bookSlug}?page=${activeExcerpt.page}`}
                className="text-xs font-medium tabular-nums text-[#C9A45C] hover:underline"
              >
                Open Page {activeExcerpt.page} in Reader →
              </Link>
            </div>

            <div className="devanagari-verse mt-6 space-y-4 text-base leading-relaxed">
              {activeExcerpt.lines.map((line, i) =>
                line.type === 'stage' ? (
                  <p key={i} className="italic text-[#988FA8]">
                    {line.text}
                  </p>
                ) : (
                  <p key={i} className="text-[#F3EFE6]">
                    <span className="font-semibold text-[#DEC07C]">
                      {line.speaker}:
                    </span>{' '}
                    {line.cue && (
                      <span className="italic text-[#988FA8]">{line.cue} </span>
                    )}
                    <span>{line.text}</span>
                  </p>
                )
              )}
            </div>
          </article>
        </ProtectedReadingSurface>
      </section>

      {/* Cast & Stage Craft Grid */}
      <ProtectedReadingSurface className="mt-14 border-t border-[#2A223D] pt-12">
        <section className="grid gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
              <Users className="h-3.5 w-3.5" />
              <span>पात्रे (Cast List)</span>
            </div>
            <h2 className="mt-2 font-literary text-3xl font-medium text-[#F3EFE6]">
              Characters on Stage
            </h2>
            <dl className="mt-6 divide-y divide-[#2A223D] rounded-xl border border-[#2A223D] bg-[#120F1C]/75 px-5">
              {THEATRE_CAST.map((member) => (
                <div key={member.name} className="py-3.5">
                  <dt className="devanagari-verse font-literary text-lg text-[#DEC07C]">
                    {member.name}
                  </dt>
                  <dd className="devanagari-verse mt-0.5 text-sm text-[#C8C1D4]">
                    {member.role}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0 space-y-8 lg:col-span-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
                नाटकाची रचना
              </p>
              <h2 className="mt-2 font-literary text-3xl font-medium text-[#F3EFE6]">
                Stage Design &amp; Audience Question
              </h2>
              <div className="mt-5 space-y-4 rounded-xl border border-[#2A223D] bg-[#120F1C]/75 p-6 text-sm leading-relaxed text-[#C8C1D4]">
                <p className="devanagari-verse">{THEATRE_PLAY_META.setDesign}</p>
                <p className="devanagari-verse">{THEATRE_PLAY_META.audienceQuestionDesign}</p>
                <p className="devanagari-verse border-t border-[#2A223D] pt-3 text-[#DEC07C]">
                  {THEATRE_PLAY_META.musicNote}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
                दिग्दर्शकासाठी सूचना (Page 46)
              </p>
              <ol className="mt-4 space-y-3 rounded-xl border border-[#2A223D] bg-[#120F1C]/75 p-6">
                {DIRECTOR_NOTES.map((note, idx) => (
                  <li
                    key={idx}
                    className="devanagari-verse flex gap-3 text-sm leading-relaxed text-[#C8C1D4]"
                  >
                    <span className="shrink-0 font-literary text-base tabular-nums text-[#C9A45C]">
                      {idx + 1}.
                    </span>
                    <span>{note}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </ProtectedReadingSurface>
    </div>
  );
}
