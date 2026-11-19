import { useState } from 'react';
import { Feather } from 'lucide-react';

interface ArtworkFrameProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  fallbackSubtitle?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  scrimClassName?: string;
}

export function ArtworkFrame({
  src,
  alt,
  fallbackTitle,
  fallbackSubtitle,
  className = '',
  imgClassName = '',
  priority = false,
  scrimClassName = 'bg-gradient-to-t from-[#09080E]/85 via-[#09080E]/20 to-transparent',
}: ArtworkFrameProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[#120F1C] ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading={priority ? 'eager' : 'lazy'}
          draggable={false}
          onError={() => setFailed(true)}
          className={`h-full w-full select-none object-cover ${imgClassName}`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1A1527] via-[#120F1C] to-[#09080E] p-6 text-center">
          <Feather className="h-6 w-6 text-[#C9A45C]/70" />
          <p className="mt-3 font-literary text-xl text-[#F3EFE6]">{fallbackTitle}</p>
          {fallbackSubtitle && (
            <p className="mt-1 text-xs text-[#988FA8]">{fallbackSubtitle}</p>
          )}
        </div>
      )}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${scrimClassName}`} />
    </div>
  );
}
