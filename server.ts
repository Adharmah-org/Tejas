import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { BASE_BOOKS_CATALOG } from './src/data/booksCatalog.ts';
import { BASE_POEMS_CATALOG } from './src/data/poemsIndex.ts';
import { BASE_JOURNAL_POSTS } from './src/data/journalSeed.ts';
import type {
  BookPublication,
  CatalogPayload,
  JournalPost,
  PoemEntry,
} from './src/types/literary.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);

const STORAGE_DIR = path.resolve(__dirname, 'storage');
const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');
const TTS_CACHE_DIR = path.join(STORAGE_DIR, 'tts-cache');
const CMS_DATA_FILE = path.join(STORAGE_DIR, 'cms-data.json');
const AUTH_FILE = path.join(STORAGE_DIR, 'auth.json');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });

const ttsInFlight = new Map<string, Promise<string>>();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface CmsOverrideStore {
  bookOverrides: Record<string, Partial<BookPublication>>;
  customBooks: BookPublication[];
  deletedBookIds: string[];
  poemOverrides: Record<string, Partial<PoemEntry>>;
  customPoems: PoemEntry[];
  deletedPoemIds: string[];
  journalOverrides: Record<string, Partial<JournalPost>>;
  customJournal: JournalPost[];
  deletedJournalIds: string[];
}

interface AuthStore {
  sessionSecret: string;
  passphraseHash?: string;
  passphraseSalt?: string;
}

const DEFAULT_CMS_DATA: CmsOverrideStore = {
  bookOverrides: {},
  customBooks: [],
  deletedBookIds: [],
  poemOverrides: {},
  customPoems: [],
  deletedPoemIds: [],
  journalOverrides: {},
  customJournal: [],
  deletedJournalIds: [],
};

function readCmsStore(): CmsOverrideStore {
  try {
    if (!fs.existsSync(CMS_DATA_FILE)) return { ...DEFAULT_CMS_DATA };
    const parsed = JSON.parse(fs.readFileSync(CMS_DATA_FILE, 'utf-8')) as Partial<CmsOverrideStore>;
    return {
      ...DEFAULT_CMS_DATA,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_CMS_DATA };
  }
}

function writeCmsStore(data: CmsOverrideStore): void {
  fs.writeFileSync(CMS_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function readAuthStore(): AuthStore {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8')) as AuthStore;
      if (parsed.sessionSecret) return parsed;
    }
  } catch {
    // Regenerate cleanly below
  }
  const fresh: AuthStore = {
    sessionSecret: crypto.randomBytes(32).toString('hex'),
  };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(fresh, null, 2), 'utf-8');
  return fresh;
}

function writeAuthStore(store: AuthStore): void {
  fs.writeFileSync(AUTH_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function buildMergedCatalog(includeUnpublished: boolean): CatalogPayload {
  const store = readCmsStore();
  const deletedBookSet = new Set(store.deletedBookIds);
  const deletedPoemSet = new Set(store.deletedPoemIds);
  const deletedJournalSet = new Set(store.deletedJournalIds);

  const books = [
    ...BASE_BOOKS_CATALOG.filter((b) => !deletedBookSet.has(b.id)).map((b) => ({
      ...b,
      ...(store.bookOverrides[b.id] ?? {}),
    })),
    ...store.customBooks.filter((b) => !deletedBookSet.has(b.id)),
  ]
    .filter((b) => includeUnpublished || b.published)
    .sort((a, b) => a.releaseOrder - b.releaseOrder);

  const poems = [
    ...BASE_POEMS_CATALOG.filter((p) => !deletedPoemSet.has(p.id)).map((p) => ({
      ...p,
      ...(store.poemOverrides[p.id] ?? {}),
    })),
    ...store.customPoems.filter((p) => !deletedPoemSet.has(p.id)),
  ].filter((p) => includeUnpublished || p.published);

  const journal = [
    ...BASE_JOURNAL_POSTS.filter((j) => !deletedJournalSet.has(j.id)).map((j) => ({
      ...j,
      ...(store.journalOverrides[j.id] ?? {}),
    })),
    ...store.customJournal.filter((j) => !deletedJournalSet.has(j.id)),
  ]
    .filter((j) => includeUnpublished || j.published)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return { books, poems, journal };
}

function parseCookies(header?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      result[key] = decodeURIComponent(val);
    }
  }
  return result;
}

function signSessionToken(secret: string): string {
  const expires = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
  const payload = `author:${expires}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  try {
    if (
      !crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))
    ) {
      return false;
    }
  } catch {
    return false;
  }
  const [, expStr] = payload.split(':');
  const exp = Number(expStr);
  return Number.isFinite(exp) && Date.now() < exp;
}

function hashPassphrase(passphrase: string, salt: string): string {
  return crypto.scryptSync(passphrase, salt, 64).toString('hex');
}

function isAuthorPassphraseConfigured(): boolean {
  if (process.env.AUTHOR_CMS_PASSPHRASE && process.env.AUTHOR_CMS_PASSPHRASE.trim().length > 0) {
    return true;
  }
  const auth = readAuthStore();
  return Boolean(auth.passphraseHash && auth.passphraseSalt);
}

function verifyAuthorPassphrase(candidate: string): boolean {
  const envPass = process.env.AUTHOR_CMS_PASSPHRASE?.trim();
  if (envPass) {
    const a = crypto.createHash('sha256').update(candidate).digest();
    const b = crypto.createHash('sha256').update(envPass).digest();
    return crypto.timingSafeEqual(a, b);
  }
  const auth = readAuthStore();
  if (!auth.passphraseHash || !auth.passphraseSalt) return false;
  const candidateHash = hashPassphrase(candidate, auth.passphraseSalt);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(candidateHash, 'hex'),
      Buffer.from(auth.passphraseHash, 'hex')
    );
  } catch {
    return false;
  }
}

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '');
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 48);
    cb(null, `${Date.now()}_${safeBase || 'upload'}${safeExt}`);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 80 * 1024 * 1024 },
});

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9\u0900-\u097f]+/g, '-')
      .replace(/^-+|-+$/g, '') || `item-${Date.now()}`
  );
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));
  app.use('/tts-cache', express.static(TTS_CACHE_DIR));

  // Public Catalog
  app.get('/api/catalog', (_req, res) => {
    res.json(buildMergedCatalog(false));
  });

  // Server-Side Expressive Gemini TTS for Audio Corner (Calm Male & Female narrators)
  app.post('/api/tts', async (req, res) => {
    try {
      const poemId = String(req.body?.poemId || '').trim();
      const voiceGender = req.body?.voiceGender === 'female' ? 'female' : 'male';
      const voiceName = voiceGender === 'female' ? 'Kore' : 'Charon';

      if (!poemId) {
        res.status(400).json({ error: 'Poem identifier is required.' });
        return;
      }

      const { poems } = buildMergedCatalog(false);
      const poem = poems.find((p) => p.id === poemId || p.slug === poemId);
      if (!poem) {
        res.status(404).json({ error: 'Published poem not found.' });
        return;
      }

      const cleanBody = poem.body.trim();
      const textDigest = crypto
        .createHash('sha256')
        .update(`${poem.id}|${voiceGender}|${voiceName}|${poem.title}|${cleanBody}`)
        .digest('hex')
        .slice(0, 16);

      const safeSlug = slugify(poem.slug).slice(0, 40) || 'poem';
      const filename = `${safeSlug}-${voiceGender}-${textDigest}.wav`;
      const outPath = path.join(TTS_CACHE_DIR, filename);

      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 44) {
        res.json({
          audioUrl: `/tts-cache/${filename}`,
          voiceGender,
          voiceName,
          cached: true,
        });
        return;
      }

      const cacheKey = filename;
      let pending = ttsInFlight.get(cacheKey);
      if (!pending) {
        pending = (async () => {
          const ai = getGeminiClient();
          const styleDirection =
            poem.language === 'English'
              ? 'Warm, calm, intimate nocturnal poetry reading with gentle cadence and thoughtful stanza pauses.'
              : 'Warm, calm, intimate nocturnal Indian poetry recitation with natural Marathi and Hindi pronunciation, expressive emotional depth, and soft pauses between stanzas.';

          const scriptText = `${poem.title}.\n\n${cleanBody}`;

          const invokeTts = async (modelName: string) =>
            ai.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: scriptText,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      speechMetadata: { style: styleDirection } as any,
                    },
                  ],
                },
              ],
              config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                  },
                },
              },
            });

          let response;
          try {
            response = await invokeTts('gemini-3.8-flash-lite-tts');
          } catch (primaryErr: unknown) {
            const msg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
            if (msg.includes('NOT_FOUND') || msg.includes('404')) {
              response = await invokeTts('gemini-3.8-flash-tts');
            } else {
              throw primaryErr;
            }
          }

          const base64Audio =
            response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (!base64Audio) {
            throw new Error('Voice synthesis returned empty audio payload.');
          }

          const wavBuffer = Buffer.from(base64Audio, 'base64');
          fs.writeFileSync(outPath, wavBuffer);
          return `/tts-cache/${filename}`;
        })();

        ttsInFlight.set(cacheKey, pending);
        pending.finally(() => ttsInFlight.delete(cacheKey));
      }

      const audioUrl = await pending;
      res.json({
        audioUrl,
        voiceGender,
        voiceName,
        cached: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to generate voice recitation.';
      console.error('Gemini TTS error:', message);
      res.status(502).json({ error: message });
    }
  });

  // Dynamic XML Sitemap
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl =
      process.env.APP_URL?.replace(/\/+$/, '') ||
      `${req.protocol}://${req.get('host')}`;
    const { books, poems, journal } = buildMergedCatalog(false);
    const urls = [
      `${baseUrl}/`,
      `${baseUrl}/books`,
      `${baseUrl}/poetry`,
      `${baseUrl}/stories`,
      `${baseUrl}/theatre`,
      `${baseUrl}/journal`,
      `${baseUrl}/author`,
      `${baseUrl}/midnight-page`,
      `${baseUrl}/moods`,
      `${baseUrl}/saved`,
      `${baseUrl}/audio`,
      ...books.flatMap((b) => [`${baseUrl}/books/${b.slug}`, `${baseUrl}/read/${b.slug}`]),
      ...poems.map((p) => `${baseUrl}/poetry/${p.slug}`),
      ...journal.map((j) => `${baseUrl}/journal/${j.slug}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc.replace(/&/g, '&amp;')}</loc>
    <changefreq>weekly</changefreq>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Author CMS Auth Status
  app.get('/api/cms/status', (req, res) => {
    const auth = readAuthStore();
    const cookies = parseCookies(req.headers.cookie);
    const authenticated = verifySessionToken(cookies.tejas_author_session, auth.sessionSecret);
    res.json({
      authenticated,
      needsSetup: !isAuthorPassphraseConfigured(),
    });
  });

  // One-time passphrase initialization when AUTHOR_CMS_PASSPHRASE is not set
  app.post('/api/cms/setup', (req, res) => {
    if (isAuthorPassphraseConfigured()) {
      res.status(403).json({ error: 'Author passphrase is already configured.' });
      return;
    }
    const passphrase = String(req.body?.passphrase || '').trim();
    if (passphrase.length < 6) {
      res.status(400).json({ error: 'Passphrase must be at least 6 characters.' });
      return;
    }
    const auth = readAuthStore();
    const salt = crypto.randomBytes(16).toString('hex');
    auth.passphraseSalt = salt;
    auth.passphraseHash = hashPassphrase(passphrase, salt);
    writeAuthStore(auth);

    const token = signSessionToken(auth.sessionSecret);
    res.setHeader(
      'Set-Cookie',
      `tejas_author_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`
    );
    res.json({ authenticated: true, needsSetup: false });
  });

  // Author CMS Login
  app.post('/api/cms/auth', (req, res) => {
    const passphrase = String(req.body?.passphrase || '');
    if (!isAuthorPassphraseConfigured()) {
      res.status(400).json({ error: 'Studio passphrase has not been initialized yet.' });
      return;
    }
    if (!verifyAuthorPassphrase(passphrase)) {
      res.status(401).json({ error: 'Invalid author passphrase.' });
      return;
    }
    const auth = readAuthStore();
    const token = signSessionToken(auth.sessionSecret);
    res.setHeader(
      'Set-Cookie',
      `tejas_author_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`
    );
    res.json({ authenticated: true });
  });

  // Author CMS Logout
  app.post('/api/cms/logout', (_req, res) => {
    res.setHeader(
      'Set-Cookie',
      'tejas_author_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    );
    res.json({ authenticated: false });
  });

  // Auth Guard Middleware for CMS mutations & drafts
  function requireAuthorSession(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const auth = readAuthStore();
    const cookies = parseCookies(req.headers.cookie);
    if (!verifySessionToken(cookies.tejas_author_session, auth.sessionSecret)) {
      res.status(401).json({ error: 'Author authentication required.' });
      return;
    }
    next();
  }

  // Full CMS Catalog (including unpublished items)
  app.get('/api/cms/catalog', requireAuthorSession, (_req, res) => {
    res.json(buildMergedCatalog(true));
  });

  // Upload PDF or Cover File
  app.post(
    '/api/cms/upload',
    requireAuthorSession,
    upload.single('file'),
    (req, res) => {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded.' });
        return;
      }
      res.json({
        url: `/uploads/${req.file.filename}`,
        originalFilename: req.file.originalname,
      });
    }
  );

  // Create Book
  app.post('/api/cms/books', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const body = req.body as Partial<BookPublication>;
    if (!body.title || !body.pdfUrl) {
      res.status(400).json({ error: 'Title and PDF file URL are required.' });
      return;
    }
    const id = `book-custom-${Date.now()}`;
    const newBook: BookPublication = {
      id,
      slug: body.slug ? slugify(body.slug) : `${slugify(body.title)}-${Date.now().toString().slice(-4)}`,
      title: body.title.trim(),
      subtitle: body.subtitle?.trim() || undefined,
      author: body.author?.trim() || 'Tejas Purvesh Phirake',
      authorCreditLabel: body.authorCreditLabel?.trim() || 'Tejas Purvesh Phirake',
      section: body.section || 'novels',
      editionLabel: body.editionLabel?.trim() || undefined,
      editionGroup: body.editionGroup?.trim() || undefined,
      language: body.language || 'मराठी',
      genre: body.genre?.trim() || 'Literary Work',
      pageCount: Number(body.pageCount) || 1,
      pdfUrl: body.pdfUrl,
      originalFilename: body.originalFilename || `${body.title.trim()}.pdf`,
      coverPageNumber: Number(body.coverPageNumber) || 1,
      customCoverUrl: body.customCoverUrl || undefined,
      coverTone: body.coverTone || 'midnight',
      description: body.description?.trim() || '',
      structureHighlights: Array.isArray(body.structureHighlights)
        ? body.structureHighlights
        : [],
      published: body.published ?? true,
      featured: body.featured ?? false,
      recentlyAdded: body.recentlyAdded ?? true,
      releaseOrder: Number(body.releaseOrder) || 100 + store.customBooks.length,
      createdAt: new Date().toISOString(),
    };
    store.customBooks.push(newBook);
    writeCmsStore(store);
    res.status(201).json(newBook);
  });

  // Update Book (works for both base & custom books)
  app.put('/api/cms/books/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    const patch = req.body as Partial<BookPublication>;
    const customIdx = store.customBooks.findIndex((b) => b.id === id);
    if (customIdx > -1) {
      store.customBooks[customIdx] = { ...store.customBooks[customIdx], ...patch };
    } else {
      store.bookOverrides[id] = { ...(store.bookOverrides[id] ?? {}), ...patch };
    }
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Delete Book
  app.delete('/api/cms/books/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    store.customBooks = store.customBooks.filter((b) => b.id !== id);
    if (!store.deletedBookIds.includes(id)) store.deletedBookIds.push(id);
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Create Poem
  app.post('/api/cms/poems', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const body = req.body as Partial<PoemEntry>;
    if (!body.title || !body.body) {
      res.status(400).json({ error: 'Poem title and verbatim text are required.' });
      return;
    }
    const id = `poem-custom-${Date.now()}`;
    const newPoem: PoemEntry = {
      id,
      slug: body.slug ? slugify(body.slug) : `poem-${Date.now().toString().slice(-6)}`,
      number: body.number,
      title: body.title.trim(),
      englishSubtitle: body.englishSubtitle?.trim() || undefined,
      body: body.body, // Preserve exact verbatim whitespace & punctuation
      language: body.language || 'मराठी',
      category: body.category || 'Unsaid Feelings',
      author: body.author?.trim() || 'Tejas Purvesh Phirake',
      sourcePublicationSlug: body.sourcePublicationSlug || undefined,
      sourceTitle: body.sourceTitle?.trim() || 'BENIYAAZ.ROOH',
      partName: body.partName?.trim() || undefined,
      dateLabel: body.dateLabel?.trim() || undefined,
      dedication: body.dedication || undefined,
      songs: Array.isArray(body.songs) ? body.songs : undefined,
      audioUrl: body.audioUrl?.trim() || undefined,
      audioDurationLabel: body.audioDurationLabel?.trim() || undefined,
      featured: body.featured ?? false,
      recentlyAdded: body.recentlyAdded ?? true,
      published: body.published ?? true,
      createdAt: new Date().toISOString(),
    };
    store.customPoems.unshift(newPoem);
    writeCmsStore(store);
    res.status(201).json(newPoem);
  });

  // Update Poem
  app.put('/api/cms/poems/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    const patch = req.body as Partial<PoemEntry>;
    const customIdx = store.customPoems.findIndex((p) => p.id === id);
    if (customIdx > -1) {
      store.customPoems[customIdx] = { ...store.customPoems[customIdx], ...patch };
    } else {
      store.poemOverrides[id] = { ...(store.poemOverrides[id] ?? {}), ...patch };
    }
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Delete Poem
  app.delete('/api/cms/poems/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    store.customPoems = store.customPoems.filter((p) => p.id !== id);
    if (!store.deletedPoemIds.includes(id)) store.deletedPoemIds.push(id);
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Create Journal Post
  app.post('/api/cms/journal', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const body = req.body as Partial<JournalPost>;
    if (!body.title || !body.content) {
      res.status(400).json({ error: 'Journal title and content are required.' });
      return;
    }
    const id = `journal-custom-${Date.now()}`;
    const newPost: JournalPost = {
      id,
      slug: body.slug ? slugify(body.slug) : `note-${Date.now().toString().slice(-6)}`,
      title: body.title.trim(),
      excerpt: body.excerpt?.trim() || body.content.trim().slice(0, 140),
      content: body.content,
      sourceLabel: body.sourceLabel?.trim() || 'Author Reflection · TEJAS · BENIYAAZ.ROOH',
      relatedBookSlug: body.relatedBookSlug || undefined,
      language: body.language || 'English',
      publishedAt: body.publishedAt || new Date().toISOString().slice(0, 10),
      published: body.published ?? true,
    };
    store.customJournal.unshift(newPost);
    writeCmsStore(store);
    res.status(201).json(newPost);
  });

  // Update Journal Post
  app.put('/api/cms/journal/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    const patch = req.body as Partial<JournalPost>;
    const customIdx = store.customJournal.findIndex((j) => j.id === id);
    if (customIdx > -1) {
      store.customJournal[customIdx] = { ...store.customJournal[customIdx], ...patch };
    } else {
      store.journalOverrides[id] = { ...(store.journalOverrides[id] ?? {}), ...patch };
    }
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Delete Journal Post
  app.delete('/api/cms/journal/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    store.customJournal = store.customJournal.filter((j) => j.id !== id);
    if (!store.deletedJournalIds.includes(id)) store.deletedJournalIds.push(id);
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Vite dev middleware OR production static files
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TEJAS · BENIYAAZ.ROOH server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
