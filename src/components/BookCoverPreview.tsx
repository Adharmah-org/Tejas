import { useEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { BookPublication } from '../types/literary';
import { renderPdfCoverThumbnail } from '../lib/pdfSetup';

interface BookCoverPreviewProps {
  book: BookPublication;
  className?: string;
}

const TONE_CLASSES: Record<BookPublication['coverTone'], string> = {
  midnight: 'from-[#1B1430] via-[#120D1F] to-[#0A0812]',
  obsidian: 'from-[#18171F] via-[#0E0E14] to-[#08080B]',
  'crimson-slate': 'from-[#24131C] via-[#150D15] to-[#0B080D]',
  'parchment-gold': 'from-[#262017] via-[#18130F] to-[#0D0A09]',
};

export function BookCoverPreview({ book, className = '' }: BookCoverPreviewProps) {
  const [renderedSrc, setRenderedSrc] = useState<string | null>(
    book.customCoverUrl || null
  );
  const [imgError, setImgError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgError(false);
    if (book.customCoverUrl) {
      setRenderedSrc(book.customCoverUrl);
      return;
    }
    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const loadCover = async () => {
      const dataUrl = await renderPdfCoverThumbnail(book.pdfUrl, book.coverPageNumber || 1);
      if (!cancelled && dataUrl) {
        setRenderedSrc(dataUrl);
      }
    };

    const el = containerRef.current;
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            void loadCover();
            observer?.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(el);
    } else {
      void loadCover();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [book.pdfUrl, book.coverPageNumber, book.customCoverUrl]);

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className={`hardcover-book-frame relative aspect-[3/4] w-full overflow-hidden rounded-r-lg rounded-l-[3px] border border-[#2A223D] bg-gradient-to-b transition-transform duration-200 ease-out group-hover:-translate-y-0.5 ${TONE_CLASSES[book.coverTone]} ${className}`}
    >
      {renderedSrc && !imgError ? (
        <img
          src={renderedSrc}
          alt={`Cover of ${book.title}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          draggable={false}
          onError={() => setImgError(true)}
          className="h-full w-full select-none object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full w-full flex-col justify-between p-5 pl-6 text-left">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#C9A45C]/80">
            <span className="truncate">{book.language}</span>
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
          </div>
          <div className="my-auto py-3">
            <p className="font-literary text-xl font-semibold leading-snug text-[#F3EFE6] headline-balance">
              {book.title}
            </p>
            {book.subtitle ? (
              <p className="mt-2 line-clamp-2 text-xs text-[#A79FB5]">{book.subtitle}</p>
            ) : null}
          </div>
          <div className="border-t border-[#C9A45C]/25 pt-2.5 text-[11px] tracking-wider text-[#C8C1D4]">
            {book.authorCreditLabel || book.author}
          </div>
        </div>
      )}

      {/* Tactile hardcover spine crease & subtle top-edge sheen */}
      <div
        aria-hidden="true"
        className="hardcover-spine-crease pointer-events-none absolute inset-y-0 left-0 w-3.5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-r-lg ring-1 ring-inset ring-white/10"
      />
    </div>
  );
}
