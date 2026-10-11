import { useEffect, useRef } from 'react';
import { ArrowRight, CalendarClock, ChevronDown, FileText, Sparkles } from 'lucide-react';
import gsap from 'gsap';

import { BOOK_CALL_PATH, CV_PATH } from '../../data/nav';
import { profile, socials } from '../../data/profile';
import { scrollToSection } from '../../lib/scroll';
import { prefersReducedMotion } from '../../lib/environment';
import Typewriter from '../Typewriter';

function GithubGlyph({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.07.78 2.16v3.2c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function LinkedinGlyph({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export default function Hero() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll('[data-hero-item]');
    const reduced = prefersReducedMotion();

    if (reduced) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: 22 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.12,
        clearProps: 'transform',
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <section
      id="home"
      ref={rootRef}
      className="section relative flex min-h-[100svh] items-center pt-[calc(var(--header-h,62px)+2rem)]"
    >
      <div className="shell relative w-full">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.7fr)]">
          <div className="flex max-w-2xl flex-col gap-6">
            <div data-hero-item className="flex flex-wrap items-center gap-3">
              <span className="chip">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-cyan)] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--color-cyan)]" />
                </span>
                {profile.availability}
              </span>
              <span className="chip">
                <Sparkles size={13} aria-hidden="true" />
                {profile.timezoneLabel}
              </span>
            </div>

            <div data-hero-item className="flex flex-col gap-3">
              <span className="eyebrow">Hello — I&rsquo;m</span>
              <h1 className="text-gradient">{profile.name}</h1>
            </div>

            <p
              data-hero-item
              className="font-[family-name:var(--font-display)] text-[clamp(1.05rem,2.1vw,1.5rem)] font-medium text-[color:var(--color-ink)]"
            >
              <Typewriter phrases={profile.roles} />
            </p>

            <p data-hero-item className="max-w-xl text-[1.02rem] leading-relaxed text-[color:var(--color-muted)]">
              {profile.intro}
            </p>

            <p
              data-hero-item
              className="font-[family-name:var(--font-display)] text-lg font-medium tracking-tight text-[color:var(--color-ink)]/90"
            >
              &ldquo;{profile.tagline}&rdquo;
            </p>

            <div data-hero-item className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => scrollToSection('projects')}
              >
                Explore My Work
                <ArrowRight size={16} aria-hidden="true" />
              </button>

              <a
                href={CV_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                <FileText size={16} aria-hidden="true" />
                View CV
                <span className="sr-only">(opens in a new tab)</span>
              </a>

              <a
                href={BOOK_CALL_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
              >
                <CalendarClock size={16} aria-hidden="true" />
                Book a 15-Minute Call
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>

            <div data-hero-item className="flex flex-wrap items-center gap-5 pt-1">
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[0.9rem] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
              >
                <GithubGlyph />
                GitHub
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <span className="h-4 w-px bg-[color:var(--color-line)]" aria-hidden="true" />
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[0.9rem] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
              >
                <LinkedinGlyph />
                LinkedIn
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>

        <div data-hero-item className="mt-14 flex justify-center lg:justify-start">
          <button
            type="button"
            onClick={() => scrollToSection('about')}
            className="group inline-flex flex-col items-center gap-2 text-[color:var(--color-faint)] transition-colors hover:text-[color:var(--color-ink)]"
            aria-label="Scroll to the About section"
          >
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em]">Scroll</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] transition-colors group-hover:border-[color:var(--color-plasma)]">
              <ChevronDown size={16} className="scroll-cue" aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
