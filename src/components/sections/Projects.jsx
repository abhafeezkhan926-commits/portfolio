import { ArrowUpRight, CheckCircle2, Code2, Info, Lock } from 'lucide-react';

import { projects } from '../../data/projects';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

function Thumb({ project, className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-deep)] ${className}`}
    >
      <img
        src={project.thumbnail}
        alt={project.thumbnailAlt}
        loading="lazy"
        decoding="async"
        width={1440}
        height={1000}
        className="h-full w-full object-cover object-top transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.035]"
      />
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--color-void)]/85 via-transparent to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

function LinkRow({ project }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {project.live ? (
        <a
          href={project.live}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          Live demo
          <ArrowUpRight size={15} aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        <span className="btn btn-ghost btn-sm cursor-default opacity-70" aria-disabled="true">
          <Lock size={14} aria-hidden="true" />
          No public demo
        </span>
      )}

      {project.source ? (
        <a
          href={project.source}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
        >
          <Code2 size={15} aria-hidden="true" />
          Source code
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        <span className="btn btn-ghost btn-sm cursor-default opacity-70" aria-disabled="true">
          <Lock size={14} aria-hidden="true" />
          Private repository
        </span>
      )}
    </div>
  );
}

function ProjectMeta({ project }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="chip">{project.category}</span>
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
        {project.year}
      </span>
    </div>
  );
}

function StackChips({ project }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {project.stack.map((item) => (
        <li
          key={item}
          className="rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-void)]/55 px-2.5 py-1 font-mono text-[0.7rem] text-[color:var(--color-mist)]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Highlights({ project }) {
  return (
    <ul className="flex flex-col gap-2">
      {project.highlights.map((highlight) => (
        <li
          key={highlight}
          className="flex items-start gap-2.5 text-[0.9rem] leading-relaxed text-[color:var(--color-mist)]"
        >
          <CheckCircle2
            size={15}
            className="mt-[3px] shrink-0 text-[color:var(--color-cyan)]"
            aria-hidden="true"
          />
          {highlight}
        </li>
      ))}
    </ul>
  );
}

export default function Projects() {
  const featured = projects.filter((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="shell">
        <SectionHeading
          id="projects-title"
          eyebrow="Projects"
          title="Work you can open right now"
          lead="Three applications, each built and shipped as a complete interface. Every link below was checked before it was published — where a deployment or repository does not exist, the card says so instead of linking somewhere broken."
        />

        <div className="mt-14 flex flex-col gap-8">
          {featured.map((project, index) => (
            <Reveal
              key={project.id}
              delay={index * 80}
              as="article"
              className="glass edge-glow lift group relative overflow-hidden p-6 md:p-8"
            >
              <div
                className={`grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] ${
                  index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div className="flex flex-col gap-5">
                  <ProjectMeta project={project} />

                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--color-ink)]">
                      {project.name}
                    </h3>
                    <p className="mt-2 text-[0.98rem] font-medium text-[color:var(--color-plasma-soft)]">
                      {project.tagline}
                    </p>
                  </div>

                  <p className="text-[0.94rem] leading-relaxed text-[color:var(--color-mist)]">
                    {project.description}
                  </p>

                  <Highlights project={project} />

                  <StackChips project={project} />

                  {project.note && (
                    <p className="flex items-start gap-2 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-void)]/45 px-3.5 py-3 text-[0.84rem] leading-relaxed text-[color:var(--color-muted)]">
                      <Info size={14} className="mt-[3px] shrink-0" aria-hidden="true" />
                      {project.note}
                    </p>
                  )}

                  <LinkRow project={project} />
                </div>

                <Thumb project={project} className="aspect-[16/11] w-full" />
              </div>
            </Reveal>
          ))}

          {rest.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {rest.map((project, index) => (
                <Reveal
                  key={project.id}
                  as="article"
                  delay={index * 80}
                  className="glass edge-glow lift group flex flex-col overflow-hidden"
                >
                  <Thumb project={project} className="aspect-[16/9] rounded-none border-0 border-b" />

                  <div className="flex flex-1 flex-col gap-5 p-6">
                    <ProjectMeta project={project} />

                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[color:var(--color-ink)]">
                        {project.name}
                      </h3>
                      <p className="mt-2 text-[0.94rem] font-medium text-[color:var(--color-plasma-soft)]">
                        {project.tagline}
                      </p>
                    </div>

                    <p className="text-[0.92rem] leading-relaxed text-[color:var(--color-mist)]">
                      {project.description}
                    </p>

                    <Highlights project={project} />

                    <StackChips project={project} />

                    {project.note && (
                      <p className="flex items-start gap-2 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-void)]/45 px-3.5 py-3 text-[0.84rem] leading-relaxed text-[color:var(--color-muted)]">
                        <Info size={14} className="mt-[3px] shrink-0" aria-hidden="true" />
                        {project.note}
                      </p>
                    )}

                    <div className="mt-auto pt-1">
                      <LinkRow project={project} />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
