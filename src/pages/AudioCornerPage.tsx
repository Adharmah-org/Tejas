import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ExternalLink,
  Headphones,
  Loader2,
  Mic,
  Music2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type { AudioVoiceGender, PoemEntry, PoemLanguage } from '../types/literary';

function formatAudioSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AudioCornerPage() {
  useDocumentMeta(
    'Audio Corner — Poetry Recitations & Companion Tracks',
    'Listen to expressive calm male and female poetry recitations or uploaded author recordings for TEJAS · BENIYAAZ ROOH with zero autoplay.'
  );

  const { poems } = useCatalog();
  const { state, setPreferences } = useReader();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPoemSlug = searchParams.get('poem');

  const voiceGender: AudioVoiceGender = state.preferences.audioVoiceGender ?? 'male';

  const studioRecordedPoems = useMemo(
    () => poems.filter((p) => Boolean(p.audioUrl)),
    [poems]
  );

  const pairedSongPoems = useMemo(
    () => poems.filter((p) => p.songs && p.songs.length > 0),
    [poems]
  );

  const [langFilter, setLangFilter] = useState<'all' | PoemLanguage>('all');

  const selectablePoems = useMemo(() => {
    if (langFilter === 'all') return poems;
    return poems.filter((p) => p.language === langFilter);
  }, [poems, langFilter]);

  const activePoem: PoemEntry | undefined = useMemo(() => {
    if (requestedPoemSlug) {
      const found = poems.find((p) => p.slug === requestedPoemSlug);
      if (found) return found;
    }
    return studioRecordedPoems[0] || poems.find((p) => p.featured) || poems[0];
  }, [poems, requestedPoemSlug, studioRecordedPoems]);

  // Gemini TTS cache keyed by `${poemId}:${voiceGender}`
  const [ttsUrls, setTtsUrls] = useState<Record<string, string>>({});
  const [ttsLoadingKey, setTtsLoadingKey] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const playOnLoadRef = useRef(false);

  const activeTtsKey = activePoem ? `${activePoem.id}:${voiceGender}` : '';
  const activeTtsUrl = activeTtsKey ? ttsUrls[activeTtsKey] : undefined;
  const effectiveAudioUrl = activePoem?.audioUrl || activeTtsUrl;
  const isGeneratingCurrent = Boolean(activeTtsKey && ttsLoadingKey === activeTtsKey);

  // Native HTMLAudio state (studio recordings or prepared /tts-cache WAV recitations)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    playOnLoadRef.current = false;
    setAudioPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setTtsError(null);
  }, [activePoem?.id, voiceGender]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [playbackRate, volume, muted, effectiveAudioUrl]);

  const selectPoem = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('poem', slug);
    setSearchParams(next);
  };

  const handleSelectVoice = (gender: AudioVoiceGender) => {
    if (gender === voiceGender) return;
    setPreferences({ audioVoiceGender: gender });
  };

  const handlePrepareVoiceRecitation = async (autoStartAfterClick = true) => {
    if (!activePoem || activePoem.audioUrl) return;
    const key = `${activePoem.id}:${voiceGender}`;

    if (ttsUrls[key]) {
      const el = audioRef.current;
      if (el && autoStartAfterClick) {
        try {
          await el.play();
          setAudioPlaying(true);
        } catch {
          setAudioPlaying(false);
        }
      }
      return;
    }

    setTtsLoadingKey(key);
    setTtsError(null);
    playOnLoadRef.current = autoStartAfterClick;

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poemId: activePoem.id,
          voiceGender,
        }),
      });
      const data = (await res.json()) as { audioUrl?: string; error?: string };
      if (!res.ok || !data.audioUrl) {
        throw new Error(data.error || 'Voice recitation could not be generated.');
      }
      setTtsUrls((prev) => ({
        ...prev,
        [key]: data.audioUrl!,
      }));
    } catch (err: unknown) {
      playOnLoadRef.current = false;
      setTtsError(
        err instanceof Error ? err.message : 'Unable to connect to voice narration service.'
      );
    } finally {
      setTtsLoadingKey((curr) => (curr === key ? null : curr));
    }
  };

  const toggleAudioPlayback = async () => {
    const el = audioRef.current;
    if (!el || !effectiveAudioUrl) return;
    if (el.paused) {
      try {
        await el.play();
        setAudioPlaying(true);
      } catch {
        setAudioPlaying(false);
      }
    } else {
      el.pause();
      setAudioPlaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl overflow-x-clip px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <header className="border-b border-[#2A223D] pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#C9A45C]">
          Section 10 · Voice Recitations &amp; Companion Tracks
        </p>
        <h1 className="mt-2 font-literary text-4xl font-medium text-[#F3EFE6] headline-balance sm:text-5xl">
          Audio Corner
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#C8C1D4] sm:text-base">
          Manual listening console with zero autoplay — listen to expressive calm male
          or calm female voice recitations across Marathi, Hindi, and English verses,
          or play uploaded author studio tracks.
        </p>
      </header>

      {activePoem && (
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Active Player Console */}
          <section className="min-w-0 lg:col-span-7">
            <div className="rounded-2xl border border-[#2A223D] bg-[#120F1C] p-5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#C9A45C]">
                <span className="inline-flex items-center gap-2 uppercase tracking-[0.18em]">
                  <Headphones className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {activePoem.audioUrl
                      ? 'Author Studio Track'
                      : 'Expressive Voice Narration'}
                  </span>
                </span>
                <span className="text-[#988FA8]">
                  {activePoem.language} · {activePoem.category}
                </span>
              </div>

              <h2 className="devanagari-verse mt-3 break-words font-literary text-3xl text-[#F3EFE6]">
                {activePoem.title}
              </h2>
              {activePoem.englishSubtitle && (
                <p className="mt-1 text-sm italic text-[#DEC07C]">
                  {activePoem.englishSubtitle}
                </p>
              )}
              {activePoem.sourceTitle && (
                <p className="mt-1.5 text-xs text-[#988FA8]">
                  Publication:{' '}
                  {activePoem.sourcePublicationSlug ? (
                    <Link
                      to={`/books/${activePoem.sourcePublicationSlug}`}
                      className="text-[#C8C1D4] underline decoration-[#2A223D] underline-offset-4 hover:text-[#DEC07C]"
                    >
                      {activePoem.sourceTitle}
                    </Link>
                  ) : (
                    <span>{activePoem.sourceTitle}</span>
                  )}
                </p>
              )}

              {/* Narrator Voice Switcher (Visible for AI Voice Recitations) */}
              {!activePoem.audioUrl && (
                <div className="mt-5 rounded-xl border border-[#2A223D] bg-[#0D0A15] p-3.5 sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#988FA8]">
                      <Mic className="h-3.5 w-3.5 text-[#C9A45C]" />
                      <span>Narrator Voice</span>
                    </div>

                    <div
                      className="grid w-full grid-cols-2 gap-2 sm:w-auto"
                      role="group"
                      aria-label="Choose narrator voice"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectVoice('male')}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                          voiceGender === 'male'
                            ? 'border-[#C9A45C] bg-[#1A1527] text-[#DEC07C]'
                            : 'border-[#2A223D] bg-[#09080E] text-[#988FA8] hover:text-[#F3EFE6]'
                        }`}
                      >
                        Calm Male
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectVoice('female')}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                          voiceGender === 'female'
                            ? 'border-[#C9A45C] bg-[#1A1527] text-[#DEC07C]'
                            : 'border-[#2A223D] bg-[#09080E] text-[#988FA8] hover:text-[#F3EFE6]'
                        }`}
                      >
                        Calm Female
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Active HTML5 Player (Studio Recording OR Prepared Expressive AI Voice) */}
              {effectiveAudioUrl ? (
                <div className="mt-5 rounded-xl border border-[#C9A45C]/40 bg-[#09080E] p-4 sm:p-5">
                  <audio
                    ref={audioRef}
                    src={effectiveAudioUrl}
                    preload="metadata"
                    controlsList="nodownload"
                    onLoadedMetadata={(e) => {
                      setAudioDuration(e.currentTarget.duration);
                    }}
                    onCanPlay={(e) => {
                      if (playOnLoadRef.current) {
                        playOnLoadRef.current = false;
                        e.currentTarget
                          .play()
                          .then(() => setAudioPlaying(true))
                          .catch(() => setAudioPlaying(false));
                      }
                    }}
                    onTimeUpdate={(e) =>
                      setAudioCurrentTime(e.currentTarget.currentTime)
                    }
                    onEnded={() => setAudioPlaying(false)}
                    onPause={() => setAudioPlaying(false)}
                    onPlay={() => setAudioPlaying(true)}
                  />

                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <button
                      type="button"
                      onClick={toggleAudioPlayback}
                      aria-label={audioPlaying ? 'Pause recitation' : 'Play recitation'}
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C9A45C] text-[#09080E] transition-colors hover:bg-[#DEC07C]"
                    >
                      {audioPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 translate-x-0.5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-[#988FA8]">
                        <span className="truncate">
                          {activePoem.audioUrl
                            ? 'Author Studio Recording'
                            : voiceGender === 'female'
                            ? 'Calm Female Narrator'
                            : 'Calm Male Narrator'}
                        </span>
                      </div>
                      <input
                        type="range"
                        aria-label="Audio playback progress"
                        min={0}
                        max={audioDuration || 100}
                        value={audioCurrentTime}
                        onChange={(e) => {
                          const t = Number(e.target.value);
                          setAudioCurrentTime(t);
                          if (audioRef.current) audioRef.current.currentTime = t;
                        }}
                        className="w-full accent-[#C9A45C]"
                      />
                      <div className="mt-1 flex justify-between text-[11px] tabular-nums text-[#988FA8]">
                        <span>{formatAudioSeconds(audioCurrentTime)}</span>
                        <span>
                          {audioDuration > 0
                            ? formatAudioSeconds(audioDuration)
                            : activePoem.audioDurationLabel || '0:00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Volume + Speed Controls */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#2A223D]/80 pt-3.5">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setMuted((m) => !m)}
                        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#2A223D] text-[#C8C1D4] hover:border-[#C9A45C]"
                      >
                        {muted || volume === 0 ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        aria-label="Audio volume"
                        min={0}
                        max={1}
                        step={0.05}
                        value={muted ? 0 : volume}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setVolume(v);
                          if (v > 0 && muted) setMuted(false);
                        }}
                        className="w-24 accent-[#C9A45C]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      {[0.85, 1, 1.15].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setPlaybackRate(rate)}
                          className={`rounded-md border px-2.5 py-1 tabular-nums transition-colors ${
                            playbackRate === rate
                              ? 'border-[#C9A45C] bg-[#1A1527] text-[#DEC07C]'
                              : 'border-[#2A223D] text-[#988FA8] hover:text-[#F3EFE6]'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-[#2A223D] bg-[#09080E] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#F3EFE6]">
                        {isGeneratingCurrent
                          ? `Preparing ${voiceGender === 'female' ? 'calm female' : 'calm male'} recitation...`
                          : `Ready to recite in a ${voiceGender === 'female' ? 'calm female' : 'calm male'} voice`}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#988FA8]">
                        Nothing plays automatically. Press below to listen to{' '}
                        <span className="text-[#C8C1D4]">{activePoem.title}</span>{' '}
                        with natural Marathi, Hindi, and English cadence.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isGeneratingCurrent}
                      onClick={() => handlePrepareVoiceRecitation(true)}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#C9A45C] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#09080E] transition-colors hover:bg-[#DEC07C] disabled:cursor-wait disabled:opacity-70"
                    >
                      {isGeneratingCurrent ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Preparing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Listen to Recitation</span>
                        </>
                      )}
                    </button>
                  </div>

                  {ttsError && (
                    <div
                      role="alert"
                      className="mt-3 rounded-lg border border-red-900/60 bg-red-950/30 px-3.5 py-2.5 text-xs text-red-200"
                    >
                      {ttsError}
                    </div>
                  )}
                </div>
              )}

              {/* Verbatim Verse Display (Protected) */}
              <ProtectedReadingSurface showWatermark className="mt-6 border-t border-[#2A223D] pt-6">
                <pre className="devanagari-verse max-w-full whitespace-pre-wrap break-words text-base leading-[1.9] text-[#F3EFE6] sm:text-lg">
                  {activePoem.body}
                </pre>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#2A223D]/80 pt-4 text-xs">
                  <span className="text-[#988FA8]">— {activePoem.author}</span>
                  <Link
                    to={`/poetry/${activePoem.slug}`}
                    className="inline-flex items-center gap-1 font-medium text-[#DEC07C] hover:underline"
                  >
                    Open Dedicated Poem Page <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </ProtectedReadingSurface>

              {/* Associated Song Links if supplied */}
              {activePoem.songs && activePoem.songs.length > 0 && (
                <div className="mt-6 rounded-xl border border-[#2A223D] bg-[#09080E]/80 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#988FA8]">
                    Author-Paired Song Reference
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-3">
                    {activePoem.songs.map((song) =>
                      song.youtubeUrl ? (
                        <a
                          key={song.title}
                          href={song.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-[#DEC07C] hover:underline"
                        >
                          <Music2 className="h-3.5 w-3.5 shrink-0" />
                          <span>{song.title}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        <span
                          key={song.title}
                          className="inline-flex items-center gap-2 text-sm text-[#C8C1D4]"
                        >
                          <Music2 className="h-3.5 w-3.5 shrink-0 text-[#C9A45C]" />
                          <span>{song.title}</span>
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right Track / Poem Queue */}
          <aside className="min-w-0 space-y-8 lg:col-span-5">
            {studioRecordedPoems.length > 0 && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#C9A45C]">
                  Author Studio Recordings ({studioRecordedPoems.length})
                </h3>
                <div className="mt-3 divide-y divide-[#2A223D] rounded-xl border border-[#2A223D] bg-[#120F1C]">
                  {studioRecordedPoems.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPoem(p.slug)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                        p.id === activePoem.id ? 'bg-[#1A1527]' : 'hover:bg-[#1A1527]/50'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="devanagari-verse truncate font-literary text-lg text-[#F3EFE6]">
                          {p.title}
                        </p>
                        <p className="text-xs text-[#988FA8]">
                          {p.language} · {p.audioDurationLabel || 'Studio Audio'}
                        </p>
                      </div>
                      <Headphones className="h-4 w-4 shrink-0 text-[#C9A45C]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#C9A45C]">
                  Browse Archive Works ({selectablePoems.length})
                </h3>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {(['all', 'मराठी', 'हिंदी', 'English'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLangFilter(lang)}
                      className={`rounded border px-2 py-1 ${
                        langFilter === lang
                          ? 'border-[#C9A45C] bg-[#1A1527] text-[#DEC07C]'
                          : 'border-[#2A223D] text-[#988FA8] hover:text-[#F3EFE6]'
                      }`}
                    >
                      {lang === 'all' ? 'All' : lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 max-h-[380px] divide-y divide-[#2A223D]/70 overflow-y-auto rounded-xl border border-[#2A223D] bg-[#120F1C]/80">
                {selectablePoems.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPoem(p.slug)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                      p.id === activePoem.id ? 'bg-[#1A1527]' : 'hover:bg-[#1A1527]/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`devanagari-verse truncate font-literary text-base ${
                          p.id === activePoem.id ? 'text-[#DEC07C]' : 'text-[#F3EFE6]'
                        }`}
                      >
                        {p.title}
                      </p>
                      <p className="text-[11px] text-[#988FA8]">
                        {p.language} · {p.category}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-[#C9A45C]">
                      {p.audioUrl ? 'Studio' : 'Voice'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {pairedSongPoems.length > 0 && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#988FA8]">
                  Poems With Companion Songs ({pairedSongPoems.length})
                </h3>
                <div className="mt-3 divide-y divide-[#2A223D]/70 rounded-xl border border-[#2A223D] bg-[#120F1C]/60">
                  {pairedSongPoems.slice(0, 8).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPoem(p.slug)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-xs hover:bg-[#1A1527]/60"
                    >
                      <span className="devanagari-verse min-w-0 truncate text-[#F3EFE6]">
                        {p.title}
                      </span>
                      <span className="max-w-[45%] shrink-0 truncate text-[#C9A45C]">
                        ♪ {p.songs?.[0]?.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
