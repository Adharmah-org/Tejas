import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function JournalPage() {
  useDocumentMeta(
    'The Unsaid Journal — Author Notes & Reflections',
    'Author prefaces, stage directions, reflections, and essays from Tejas Purvesh Phirake.'
  );

  const { journal } = useCatalog();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <header className="border-b border-[#2A223D] pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#C9A45C]">
          Section 04 · Author&apos;s Notes &amp; Reflections
        </p>
        <h1 className="mt-2 font-literary text-4xl font-medium text-[#F3EFE6] headline-balance sm:text-5xl">
          The Unsaid Journal
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#C8C1D4] sm:text-base">
          Prefaces, reader instructions, director notes, and reflections gathered directly
          from the manuscripts of Tejas Purvesh Phirake—kept distinct from published poetry.
        </p>
      </header>

      <div className="divide-y divide-[#2A223D]">
        {journal.map((post) => (
          <article key={post.id} className="py-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#988FA8]">
              <span className="text-[#C9A45C]">{post.sourceLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{post.language}</span>
              <span aria-hidden="true">·</span>
              <time className="tabular-nums">{post.publishedAt}</time>
            </div>

            <Link to={`/journal/${post.slug}`} className="group mt-2 block">
              <h2 className="font-literary text-2xl font-medium text-[#F3EFE6] transition-colors group-hover:text-[#DEC07C] sm:text-3xl">
                {post.title}
              </h2>
            </Link>

            <p className="mt-3 text-sm leading-relaxed text-[#C8C1D4] sm:text-base">
              {post.excerpt}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-xs font-medium">
              <Link
                to={`/journal/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-[#DEC07C] hover:underline"
              >
                Read Note <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {post.relatedBookSlug && (
                <Link
                  to={`/books/${post.relatedBookSlug}`}
                  className="text-[#988FA8] hover:text-[#F3EFE6]"
                >
                  View Related Publication →
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
