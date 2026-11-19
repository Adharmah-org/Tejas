import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="border-t border-[#2A223D] bg-[#07060B] text-[#988FA8]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="min-w-0 md:col-span-5">
            <Link
              to="/"
              className="font-literary text-xl font-semibold tracking-[0.16em] text-[#F3EFE6]"
            >
              BENIYAAZ ROOH
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#988FA8]">
              Tejas Purvesh Phirake
            </p>
            <p className="mt-4 max-w-sm font-literary text-lg italic text-[#C9A45C]">
              Some feelings leave. The words stay.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#988FA8]">
              An independent literary archive across Marathi, Hindi, and English —
              preserving novels, Marathi theatre, multilingual poetry, story dossiers,
              and spoken readings.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#F3EFE6]">
                Library &amp; Stage
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/books" className="hover:text-[#DEC07C]">
                    The Library
                  </Link>
                </li>
                <li>
                  <Link to="/stories" className="hover:text-[#DEC07C]">
                    Story Archives
                  </Link>
                </li>
                <li>
                  <Link to="/theatre" className="hover:text-[#DEC07C]">
                    The Theatre
                  </Link>
                </li>
                <li>
                  <Link
                    to="/books?section=special-editions"
                    className="hover:text-[#DEC07C]"
                  >
                    Special Editions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#F3EFE6]">
                Poetry &amp; Moods
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/poetry" className="hover:text-[#DEC07C]">
                    Poetry Room
                  </Link>
                </li>
                <li>
                  <Link to="/midnight-page" className="hover:text-[#DEC07C]">
                    Midnight Page
                  </Link>
                </li>
                <li>
                  <Link to="/moods" className="hover:text-[#DEC07C]">
                    Choose Your Mood
                  </Link>
                </li>
                <li>
                  <Link to="/audio" className="hover:text-[#DEC07C]">
                    Audio Corner
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#F3EFE6]">
                Author &amp; Reader
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/author" className="hover:text-[#DEC07C]">
                    Author&apos;s Archive
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#DEC07C]">
                    About the Author
                  </Link>
                </li>
                <li>
                  <Link to="/journal" className="hover:text-[#DEC07C]">
                    Unsaid Journal
                  </Link>
                </li>
                <li>
                  <Link to="/saved" className="hover:text-[#DEC07C]">
                    My Bookshelf
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-[#2A223D]/70 pt-6 text-xs text-[#988FA8] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Tejas Purvesh Phirake · TEJAS | BENIYAAZ ROOH</p>
          <p>Original manuscripts and verses preserved verbatim.</p>
        </div>
      </div>
    </footer>
  );
}
