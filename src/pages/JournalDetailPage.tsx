import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { journal, books } = useCatalog();
  const { markViewed } = useReader();

  const post = journal.find((j) => j.slug === slug);
  const relatedBook = post?.relatedBookSlug
    ? books.find((b) => b.slug === post.relatedBookSlug)
    : undefined;

  useDocumentMeta(post ? post.title : 'Note Not Found', post?.excerpt);

  useEffect(() => {
    if (post) {
      markViewed({
        type: 'journal',
        slug: post.slug,
        title: post.title,
        subtitle: post.sourceLabel,
      });
    }
  }, [post?.slug]);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-literary text-3xl text-[#F3EFE6]">Note not found</h1>
        <Link
          to="/journal"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C9A45C] px-5 py-2.5 text-xs font-semibold text-[#09080E]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <Link
        to="/journal"
        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#988FA8] hover:text-[#DEC07C]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Journal
      </Link>

      <header className="mt-8 border-b border-[#2A223D] pb-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#C9A45C]">
          <span>{post.sourceLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{post.language}</span>
          <span aria-hidden="true">·</span>
          <time className="tabular-nums text-[#988FA8]">{post.publishedAt}</time>
        </div>

        <h1 className="mt-3 font-literary text-4xl font-medium leading-tight text-[#F3EFE6] headline-balance sm:text-5xl">
          {post.title}
        </h1>
      </header>

      <ProtectedReadingSurface showWatermark enableFocusVeil className="py-8">
        <pre className="devanagari-verse whitespace-pre-wrap break-words text-base leading-[1.9] text-[#E8E2D5] sm:text-lg">
          {post.content}
        </pre>
      </ProtectedReadingSurface>

      {relatedBook && (
        <div className="mt-8 rounded-xl border border-[#2A223D] bg-[#120F1C] p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[#988FA8]">
            Connected Publication
          </p>
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-literary text-2xl text-[#F3EFE6]">
                {relatedBook.title}
              </h2>
              <p className="text-xs text-[#988FA8]">
                {relatedBook.genre} · {relatedBook.language} ·{' '}
                <span className="tabular-nums">{relatedBook.pageCount} pages</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/read/${relatedBook.slug}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#C9A45C] px-4 text-xs font-semibold text-[#09080E] hover:bg-[#DEC07C]"
              >
                <BookOpen className="h-3.5 w-3.5" /> Read Online
              </Link>
              <Link
                to={`/books/${relatedBook.slug}`}
                className="inline-flex h-10 items-center rounded-lg border border-[#2A223D] px-4 text-xs text-[#F3EFE6] hover:border-[#C9A45C]"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
