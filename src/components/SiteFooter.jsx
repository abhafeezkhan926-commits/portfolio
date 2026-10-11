import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUp, CalendarClock, FileText } from 'lucide-react';

import { BOOK_CALL_PATH, CV_PATH, NAV_LINKS } from '../data/nav';
import { profile } from '../data/profile';
import { isHomePath, scrollToSection, scrollToTop } from '../lib/scroll';
import SocialLinks from './SocialLinks';

export default function SiteFooter() {
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = isHomePath(location.pathname);
  const year = new Date().getFullYear();

  const goToSection = useCallback(
    (id) => (event) => {
      event.preventDefault();
      if (onHome) {
        scrollToSection(id);
      } else {
        navigate(`/#${id}`);
      }
    },
    [navigate, onHome],
  );

  return (
    <footer className="site-footer no-print relative mt-8 border-t border-[color:var(--color-line)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(77,166,255,0.5) 30%, rgba(139,92,246,0.5) 70%, transparent)',
        }}
      />

      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="brand-mark" aria-hidden="true">
                {profile.monogram}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--color-ink)]">
                  {profile.brand}
                </span>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[color:var(--color-faint)]">
                  {profile.title}
                </span>
              </div>
            </div>

            <p className="max-w-sm text-[0.92rem] leading-relaxed text-[color:var(--color-muted)]">
              {profile.shortBio}
            </p>

            <SocialLinks className="mt-1" />
          </div>

          <nav aria-label="Footer navigation" className="flex flex-col gap-3">
            <h2 className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[color:var(--color-faint)]">
              Sections
            </h2>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.filter((link) => link.id !== 'home').map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className="text-[0.92rem] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
                    onClick={goToSection(link.id)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[color:var(--color-faint)]">
              Get in touch
            </h2>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href={BOOK_CALL_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[0.92rem] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
                >
                  <CalendarClock size={15} aria-hidden="true" />
                  Book a 15-minute call
                </a>
              </li>
              <li>
                <a
                  href={CV_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[0.92rem] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
                >
                  <FileText size={15} aria-hidden="true" />
                  View CV
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-[0.92rem] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
                  onClick={goToSection('contact')}
                >
                  Contact form
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-[color:var(--color-line)] pt-6 sm:flex-row sm:items-center">
          <p className="text-[0.82rem] text-[color:var(--color-faint)]">
            © {year} {profile.name}. Built with React, Vite and Tailwind CSS.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="btn btn-ghost btn-sm"
            aria-label="Back to top of page"
          >
            <ArrowUp size={15} aria-hidden="true" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
