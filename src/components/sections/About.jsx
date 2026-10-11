import { Compass, GraduationCap, Sparkles } from 'lucide-react';

import { profile } from '../../data/profile';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

export default function About() {
  const { about } = profile;

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="shell">
        <SectionHeading
          id="about-title"
          eyebrow="About"
          title={about.lead}
          lead={about.paragraphs[0]}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <Reveal className="glass edge-glow lift relative overflow-hidden p-7 md:p-9" delay={60}>
            <span
              className="orbit-ring -right-24 -top-24 hidden h-64 w-64 md:block"
              aria-hidden="true"
            />
            <span className="node-dot right-16 top-16 hidden md:block" aria-hidden="true" />

            <h3 className="font-[family-name:var(--font-display)] text-xl text-[color:var(--color-ink)]">
              How I work
            </h3>

            <div className="mt-5 flex flex-col gap-4 text-[0.98rem] leading-relaxed text-[color:var(--color-muted)]">
              {about.paragraphs.slice(1).map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            <hr className="hairline my-8" />

            <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-base text-[color:var(--color-ink)]">
              <Sparkles size={16} className="text-[color:var(--color-cyan)]" aria-hidden="true" />
              Principles I build by
            </h3>

            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {about.philosophy.map((item, index) => (
                <li key={item.title} className="glass-soft p-4">
                  <span
                    className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--color-faint)]"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h4 className="mt-2 font-[family-name:var(--font-display)] text-[0.98rem] font-semibold text-[color:var(--color-ink)]">
                    {item.title}
                  </h4>
                  <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[color:var(--color-muted)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal className="glass lift relative overflow-hidden p-7" delay={120}>
              <span
                className="orbit-ring -bottom-20 -left-20 hidden h-56 w-56 md:block"
                aria-hidden="true"
              />
              <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg text-[color:var(--color-ink)]">
                <Compass size={17} className="text-[color:var(--color-plasma)]" aria-hidden="true" />
                Interests
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {about.interests.map((interest) => (
                  <li
                    key={interest}
                    className="flex items-start gap-2.5 text-[0.92rem] leading-relaxed text-[color:var(--color-muted)]"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-cyan)] shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                      aria-hidden="true"
                    />
                    {interest}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="glass lift relative overflow-hidden p-7" delay={180}>
              <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg text-[color:var(--color-ink)]">
                <GraduationCap size={17} className="text-[color:var(--color-gold)]" aria-hidden="true" />
                Currently learning
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {about.currentlyLearning.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[0.92rem] leading-relaxed text-[color:var(--color-muted)]"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-gold)] shadow-[0_0_8px_rgba(242,196,107,0.75)]"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-5 border-t border-[color:var(--color-line)] pt-4 text-[0.84rem] leading-relaxed text-[color:var(--color-faint)]">
                The 15-minute call booking system on this site is built with that stack end to end —
                React on the front, Express and MongoDB behind it.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
