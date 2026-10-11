import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarClock, Menu, X } from 'lucide-react';

import { BOOK_CALL_PATH, NAV_LINKS, NAV_IDS } from '../data/nav';
import { profile } from '../data/profile';
import { isHomePath, scrollToSection } from '../lib/scroll';
import useScrollSpy from '../hooks/useScrollSpy';

export default function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = isHomePath(location.pathname);

  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeId = useScrollSpy(onHome ? NAV_IDS : []);

  const progressRef = useRef(null);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);

  /* Scroll state + reading-progress bar, rAF-throttled. */
  useEffect(() => {
    let frame = 0;

    const apply = () => {
      frame = 0;
      setScrolled(window.scrollY > 12);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
      }
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /* Close the drawer whenever the route changes. */
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  /* Drawer: lock body scroll, move focus in, close on Escape, restore focus. */
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 40);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      body.style.overflow = previousOverflow;
      menuButtonRef.current?.focus();
    };
  }, [drawerOpen]);

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

  const renderNavLink = (link) => {
    const isActive = onHome && activeId === link.id;
    return (
      <a
        key={link.id}
        href={`#${link.id}`}
        className={`nav-link${isActive ? ' is-active' : ''}`}
        aria-current={isActive ? 'true' : undefined}
        onClick={goToSection(link.id)}
      >
        {link.label}
      </a>
    );
  };

  return (
    <header
      className={`site-header no-print fixed inset-x-0 top-0 z-[50] ${scrolled ? 'is-scrolled' : ''}`}
    >
      <div className="header-surface" aria-hidden="true" />

      <div className="shell relative flex h-full items-center justify-between gap-3">
        <a
          href="#home"
          className="group flex shrink-0 items-center gap-2.5"
          onClick={goToSection('home')}
          aria-label={`${profile.name} — back to top`}
        >
          <span className="brand-mark" aria-hidden="true">
            {profile.monogram}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-[family-name:var(--font-display)] text-[0.95rem] font-semibold tracking-tight text-[color:var(--color-ink)]">
              {profile.brand}
            </span>
            <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.24em] text-[color:var(--color-faint)] sm:block">
              {profile.title}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {NAV_LINKS.map(renderNavLink)}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={BOOK_CALL_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm hidden sm:inline-flex"
          >
            <CalendarClock size={16} aria-hidden="true" />
            <span>Book a 15-Minute Call</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>

          <button
            ref={menuButtonRef}
            type="button"
            className="btn btn-ghost btn-sm px-3 lg:hidden"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div ref={progressRef} className="header-progress" aria-hidden="true" />

      {drawerOpen && (
        <div className="lg:hidden">
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />

          <div
            id="mobile-drawer"
            className="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[color:var(--color-faint)]">
                Navigate
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                className="btn btn-ghost btn-sm px-3"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <nav className="flex flex-col gap-1" aria-label="Primary (mobile)">
              {NAV_LINKS.map((link) => {
                const isActive = onHome && activeId === link.id;
                return (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    className={`drawer-link${isActive ? ' is-active' : ''}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={(event) => {
                      setDrawerOpen(false);
                      goToSection(link.id)(event);
                    }}
                  >
                    <span>{link.label}</span>
                    <span
                      className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--color-faint)]"
                      aria-hidden="true"
                    >
                      {String(NAV_LINKS.indexOf(link) + 1).padStart(2, '0')}
                    </span>
                  </a>
                );
              })}
            </nav>

            <div className="hairline my-4" aria-hidden="true" />

            <a
              href={BOOK_CALL_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full"
              onClick={() => setDrawerOpen(false)}
            >
              <CalendarClock size={16} aria-hidden="true" />
              <span>Book a 15-Minute Call</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>

            <p className="mt-3 text-center text-[0.78rem] text-[color:var(--color-faint)]">
              {profile.availability}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
