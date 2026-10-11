import { BookOpenCheck, CircleDot, Sparkle } from 'lucide-react';

import { journey } from '../../data/journey';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

export default function Journey() {
  return (
    <section id="journey" className="section" aria-labelledby="journey-title">
      <div className="shell">
        <SectionHeading
          id="journey-title"
          eyebrow="Experience"
          title="A learning journey, kept honest"
          lead="This is a development timeline rather than an employment history — the stages below describe how the skill set was built and what is being worked on now. There are no invented employers, job titles or dates here."
        />

        <ol className="relative mt-14 flex flex-col gap-8 pl-6 sm:pl-10">
          <span
            className="pointer-events-none absolute left-[6px] top-2 h-[calc(100%-1rem)] w-px sm:left-[14px]"
            style={{
              background:
                'linear-gradient(180deg, rgba(77,166,255,0.55), rgba(139,92,246,0.45) 55%, transparent)',
            }}
            aria-hidden="true"
          />

          {journey.map((stage, index) => (
            <Reveal
              key={stage.id}
              as="li"
              delay={index * 70}
              className="relative"
            >
              <span
                className={`absolute -left-6 top-6 flex h-3.5 w-3.5 items-center justify-center rounded-full border sm:-left-10 ${
                  stage.current
                    ? 'border-[color:var(--color-cyan)] bg-[color:var(--color-cyan)] shadow-[0_0_16px_rgba(34,211,238,0.9)]'
                    : 'border-[color:var(--color-plasma)]/70 bg-[color:var(--color-void)]'
                }`}
                aria-hidden="true"
              >
                {stage.current && (
                  <span className="absolute h-3.5 w-3.5 animate-ping rounded-full bg-[color:var(--color-cyan)] opacity-55" />
                )}
              </span>

              <article className="glass edge-glow lift relative overflow-hidden p-6 md:p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="chip">
                    <Sparkle size={12} aria-hidden="true" />
                    {stage.stage}
                  </span>

                  {stage.badge && (
                    <span className="rounded-full border border-[color:var(--color-gold)]/35 bg-[color:var(--color-gold)]/10 px-2.5 py-0.5 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[color:var(--color-gold-soft)]">
                      {stage.badge}
                    </span>
                  )}

                  {stage.current && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-cyan)]/35 bg-[color:var(--color-cyan)]/10 px-2.5 py-0.5 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[color:var(--color-cyan)]">
                      <CircleDot size={11} aria-hidden="true" />
                      In progress
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl text-[color:var(--color-ink)]">
                  {stage.title}
                </h3>

                <p className="mt-2.5 max-w-3xl text-[0.95rem] leading-relaxed text-[color:var(--color-muted)]">
                  {stage.summary}
                </p>

                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {stage.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-[0.89rem] leading-relaxed text-[color:var(--color-muted)]"
                    >
                      <BookOpenCheck
                        size={14}
                        className="mt-[3px] shrink-0 text-[color:var(--color-plasma)]"
                        aria-hidden="true"
                      />
                      {point}
                    </li>
                  ))}
                </ul>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {stage.stack.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-void)]/55 px-2.5 py-1 font-mono text-[0.7rem] text-[color:var(--color-muted)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
