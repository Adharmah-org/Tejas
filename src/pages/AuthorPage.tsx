import { Link } from 'react-router-dom';
import { BookOpen, Feather } from 'lucide-react';
import { BookCoverPreview } from '../components/BookCoverPreview';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function AuthorPage() {
  useDocumentMeta(
    'Tejas Purvesh Phirake — Author Profile & Archive',
    'Official literary archive of Tejas Purvesh Phirake (TEJAS · BENIYAAZ ROOH): novels, Marathi three-act theatre, poetry collection, and editions.'
  );

  const { books, poems } = useCatalog();

  const totalPages = books.reduce((sum, b) => sum + (b.pageCount || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      {/* Authentic Author Identity */}
      <header className="grid gap-10 border-b border-[#2A223D] pb-12 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#C9A45C]">
            Section 06 · Author&apos;s Archive · Poet · Storyteller
          </p>
          <h1 className="mt-3 font-literary text-4xl font-medium text-[#F3EFE6] headline-balance sm:text-5xl">
            Tejas Purvesh Phirake
          </h1>
          <p className="mt-2 font-literary text-xl italic text-[#DEC07C]">
            तेजस पूर्वेश फिरके · “Some feelings leave. The words stay.”
          </p>

          <ProtectedReadingSurface className="mt-6 max-w-2xl">
            <div className="space-y-4 text-base leading-relaxed text-[#C8C1D4]">
              <p>
                <span className="text-[#F3EFE6]">Tejas Purvesh Phirake</span> is an
                independent Indian writer whose literary work explores the quiet
                complexities of human emotions, unspoken feelings, relationships,
                memories, identity, and the questions that often remain unanswered.
              </p>
              <p>
                Writing across Marathi, Hindi, and English, his work moves between poetry,
                fiction, drama, and psychological storytelling. His words often find
                meaning in ordinary moments — an unfinished conversation, a familiar
                face, a distant memory, or a question someone never dared to ask.
              </p>
              <p>
                His literary creations include{' '}
                <Link
                  to="/books/a-love-truly-never-fades"
                  className="italic text-[#DEC07C] hover:underline"
                >
                  A Love Truly Never Fades
                </Link>
                , a collection of poetry and unspoken emotions;{' '}
                <Link
                  to="/books/chupke-chupke-sach"
                  className="italic text-[#DEC07C] hover:underline"
                >
                  Chupke Chupke Sach
                </Link>
                , a thriller exploring the hidden layers of truth; and{' '}
                <Link
                  to="/books/meech-prashna-meech-uttar"
                  className="text-[#DEC07C] hover:underline"
                >
                  मीच प्रश्न, मीच उत्तर
                </Link>
                , a Marathi literary work that journeys through questions of identity,
                expectations, relationships, and self-discovery.
              </p>
              <p>
                For him, literature is not merely about finding beautiful words. It is
                about giving a voice to thoughts that often remain unexpressed.
              </p>
              <p>
                His writing moves between tenderness and intensity, silence and
                confrontation, imagination and reality.
              </p>
              <p>
                This digital literary space brings together his published works, poetry,
                stories, and dramatic creations — preserving every piece as part of an
                evolving literary archive.
              </p>
            </div>

            <blockquote className="mt-6 border-y border-[#C9A45C]/30 py-4 font-literary text-xl italic text-[#F3EFE6]">
              Because some stories end on paper, but continue to live within us.
              <footer className="mt-1.5 text-sm not-italic tracking-wider text-[#C9A45C]">
                ~ Tejas Purvesh Phirake
              </footer>
            </blockquote>
          </ProtectedReadingSurface>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/books"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#C9A45C] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#09080E] transition-colors hover:bg-[#DEC07C]"
            >
              <BookOpen className="h-4 w-4" /> Explore Books
            </Link>
            <Link
              to="/poetry"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#2A223D] bg-[#120F1C] px-5 text-xs font-medium uppercase tracking-[0.16em] text-[#F3EFE6] hover:border-[#C9A45C]"
            >
              <Feather className="h-4 w-4 text-[#C9A45C]" /> Enter Poetry Room
            </Link>
          </div>
        </div>

        <aside className="min-w-0 lg:col-span-4">
          <dl className="divide-y divide-[#2A223D] rounded-xl border border-[#2A223D] bg-[#120F1C] p-6 text-sm">
            <div className="pb-3.5">
              <dt className="text-xs uppercase tracking-[0.16em] text-[#988FA8]">
                Literary Signature
              </dt>
              <dd className="mt-1 font-medium text-[#F3EFE6]">TEJAS · BENIYAAZ ROOH</dd>
            </div>
            <div className="py-3.5">
              <dt className="text-xs uppercase tracking-[0.16em] text-[#988FA8]">
                Languages
              </dt>
              <dd className="mt-1 text-[#C8C1D4]">Marathi · Hindi · English</dd>
            </div>
            <div className="py-3.5">
              <dt className="text-xs uppercase tracking-[0.16em] text-[#988FA8]">
                Literary Forms
              </dt>
              <dd className="mt-1 text-[#C8C1D4]">
                Poetry · Fiction · Drama · Psychological Storytelling
              </dd>
            </div>
            <div className="pt-3.5">
              <dt className="text-xs uppercase tracking-[0.16em] text-[#988FA8]">
                Verified Archive Size
              </dt>
              <dd className="mt-1 tabular-nums text-[#DEC07C]">
                {books.length} Editions · {totalPages} Pages · {poems.length} Poems
              </dd>
            </div>
          </dl>
        </aside>
      </header>

      {/* Literary Chronology & Edition History */}
      <section className="mt-14 border-t border-[#2A223D] pt-12">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
            Publication Chronology &amp; Edition Lineage
          </p>
          <h2 className="mt-2 font-literary text-3xl font-medium text-[#F3EFE6]">
            Literary Timeline (2024 – 2026)
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#988FA8]">
            Verified progression of original manuscripts, alternate editions, dramatic
            adaptations, and poetry collections published under TEJAS · BENIYAAZ ROOH.
          </p>
        </div>

        <ol className="divide-y divide-[#2A223D] rounded-xl border border-[#2A223D] bg-[#120F1C]/75">
          {[
            {
              era: '2024 – 2026',
              work: 'BENIYAAZ.ROOH Notebook & A LOVE TRULY NEVER FADES',
              note: '98-page multilingual anthology collecting 83 numbered poems across Marathi, Hindi, and English with paired companion tracks.',
              to: '/books/a-love-truly-never-fades',
            },
            {
              era: 'Nov 2025',
              work: 'CHUPKE CHUPKE SACH.. (Part I)',
              note: '61-page Hinglish investigative thriller introducing Riya Malhotra, Kabir Arora, Project Nexus, and Mr. X.',
              to: '/books/chupke-chupke-sach',
            },
            {
              era: 'Jan 2026',
              work: 'CHUPKE CHUPKE SACH 2: The Anonymous X',
              note: '51-page cyber thriller sequel uncovering Ghost Protocol, Black Archive, and Neural Access Core.',
              to: '/books/chupke-chupke-sach-2',
            },
            {
              era: 'Mar 2026',
              work: 'मीच प्रश्न, मीच उत्तर — Standard Print (129p) & MBL Edition (179p)',
              note: '31-chapter Marathi novel of identity, student expectations, and “आईच्या वहीतून” poems—preserved in both original editions.',
              to: '/books/meech-prashna-meech-uttar',
            },
            {
              era: 'Apr 2026',
              work: 'मीच प्रश्न, मीच उत्तर — तीन अंकी मराठी नाटक (46p)',
              note: 'Three-Act, 28-Scene Marathi stage drama adaptation featuring the half-drawn question mark (?) stage motif and director’s notes.',
              to: '/theatre',
            },
            {
              era: '2026 Editions',
              work: 'Standalone Illustrated Poetry Keepsakes',
              note: 'Four individual illustrated editions: कोजागरी — दूर असलेला चंद्र, तुझ्या सौंदर्याची नजाकत..., तुझ्या हसण्याचं चांदणं..., and दिवस निसटले...',
              to: '/books?section=special-editions',
            },
          ].map((milestone) => (
            <li
              key={milestone.work}
              className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium tabular-nums text-[#C9A45C]">
                  {milestone.era}
                </span>
                <h3 className="devanagari-verse mt-1 font-literary text-xl text-[#F3EFE6]">
                  {milestone.work}
                </h3>
                <p className="mt-1 text-sm text-[#988FA8]">{milestone.note}</p>
              </div>
              <Link
                to={milestone.to}
                className="shrink-0 text-xs font-medium text-[#DEC07C] hover:underline"
              >
                Explore Work →
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Complete Publication Archive */}
      <section className="mt-14 border-t border-[#2A223D] pt-12">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A45C]">
            Complete Bibliography
          </p>
          <h2 className="mt-2 font-literary text-3xl font-medium text-[#F3EFE6]">
            Published Archive &amp; Alternate Editions
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#988FA8]">
            Every manuscript edition published by the author is preserved distinctly in
            the digital archive.
          </p>
        </div>

        <div className="divide-y divide-[#2A223D] border-y border-[#2A223D]">
          {books.map((book) => (
            <div
              key={book.id}
              className="grid items-center gap-5 py-5 sm:grid-cols-12"
            >
              <div className="w-20 sm:col-span-2 sm:w-24">
                <Link to={`/books/${book.slug}`}>
                  <BookCoverPreview book={book} />
                </Link>
              </div>
              <div className="sm:col-span-7">
                <p className="text-xs text-[#C9A45C]">
                  {book.editionLabel || book.genre} · {book.language}
                </p>
                <Link to={`/books/${book.slug}`}>
                  <h3 className="mt-1 font-literary text-2xl font-medium text-[#F3EFE6] hover:text-[#DEC07C]">
                    {book.title}
                  </h3>
                </Link>
                {book.subtitle && (
                  <p className="mt-0.5 text-xs text-[#988FA8]">{book.subtitle}</p>
                )}
                <p className="mt-2 line-clamp-2 text-sm text-[#C8C1D4]">
                  {book.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-3 sm:justify-end">
                <Link
                  to={`/read/${book.slug}`}
                  className="inline-flex h-9 items-center rounded-lg bg-[#C9A45C] px-4 text-xs font-semibold text-[#09080E] hover:bg-[#DEC07C]"
                >
                  Read Online
                </Link>
                <Link
                  to={`/books/${book.slug}`}
                  className="inline-flex h-9 items-center rounded-lg border border-[#2A223D] px-4 text-xs text-[#F3EFE6] hover:border-[#C9A45C]"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
