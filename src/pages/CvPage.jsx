import { useEffect } from 'react';
import { Printer, FileDown, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cv } from '../data/cv';
import { PDF_FILENAME, PDF_PATH } from '../data/cvPdf';

function Section({ title, children }) {
  return (
    <section className="print-block mt-7 first:mt-0">
      <h2 className="border-b border-[color:var(--color-line)] pb-2 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-[color:var(--color-cyan)]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function CvPage() {
  const contact = cv.contact;

  useEffect(() => {
    document.title = `${cv.name} — Curriculum Vitae`;
    return () => {
      document.title = 'Abdul Hafeez Khan — Frontend Developer Portfolio';
    };
  }, []);

  return (
    <main className="section pt-[calc(var(--header-h,62px)+2.5rem)]">
      <div className="shell">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[0.86rem] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to the portfolio
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <a href={PDF_PATH} download={PDF_FILENAME} className="btn btn-ghost btn-sm">
              <FileDown size={15} aria-hidden="true" />
              Download PDF
            </a>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <Printer size={15} aria-hidden="true" />
              Print this page
            </button>
          </div>
        </div>

        <article className="print-doc glass mx-auto max-w-[820px] p-8 md:p-12">
          <header className="print-block">
            <h1 className="font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[color:var(--color-ink)] md:text-[2.4rem]">
              {cv.name}
            </h1>
            <p className="mt-2 text-[1.05rem] font-medium text-[color:var(--color-plasma-soft)]">
              {cv.title}
            </p>
            <p className="mt-1 font-mono text-[0.74rem] uppercase tracking-[0.14em] text-[color:var(--color-faint)]">
              {cv.subtitle}
            </p>

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.86rem] text-[color:var(--color-muted)]">
              <li>
                <a
                  href={cv.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[color:var(--color-ink)]"
                >
                  github.com/abhafeezkhan926-commits
                </a>
              </li>
              <li>
                <a
                  href={cv.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[color:var(--color-ink)]"
                >
                  linkedin.com/in/abdul-hafeez-khan
                </a>
              </li>
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="transition-colors hover:text-[color:var(--color-ink)]"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="transition-colors hover:text-[color:var(--color-ink)]"
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
            </ul>
          </header>

          <Section title="Summary">
            <p className="text-[0.95rem] leading-relaxed text-[color:var(--color-muted)]">
              {cv.summary}
            </p>
          </Section>

          <Section title="Technical skills">
            <div className="grid gap-4 sm:grid-cols-2">
              {cv.skillGroups.map((group) => (
                <div key={group.title} className="print-block">
                  <h3 className="text-[0.86rem] font-semibold text-[color:var(--color-ink)]">
                    {group.title}
                  </h3>
                  <p className="mt-1 text-[0.88rem] leading-relaxed text-[color:var(--color-muted)]">
                    {group.items.join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Projects">
            <div className="flex flex-col gap-5">
              {cv.projects.map((project) => (
                <div key={project.name} className="print-block">
                  <h3 className="text-[0.98rem] font-semibold text-[color:var(--color-ink)]">
                    {project.name}
                  </h3>
                  <p className="text-[0.82rem] text-[color:var(--color-plasma-soft)]">
                    {project.role}
                  </p>
                  <p className="mt-1.5 text-[0.9rem] leading-relaxed text-[color:var(--color-muted)]">
                    {project.description}
                  </p>
                  <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem]">
                    {project.links.map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[color:var(--color-plasma-soft)] underline decoration-[color:var(--color-line)] underline-offset-2 transition-colors hover:text-[color:var(--color-ink)]"
                        >
                          {link.label}: {link.url.replace(/^https?:\/\//, '')}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Training">
            {cv.training.map((item) => (
              <div key={item.name} className="print-block">
                <h3 className="text-[0.98rem] font-semibold text-[color:var(--color-ink)]">
                  {item.name}
                </h3>
                <p className="text-[0.85rem] text-[color:var(--color-plasma-soft)]">{item.detail}</p>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed text-[color:var(--color-muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </Section>

          <Section title="Interests">
            <ul className="flex flex-wrap gap-2">
              {cv.interests.map((interest) => (
                <li
                  key={interest}
                  className="rounded-lg border border-[color:var(--color-line)] px-2.5 py-1 text-[0.82rem] text-[color:var(--color-muted)]"
                >
                  {interest}
                </li>
              ))}
            </ul>
          </Section>

          <footer className="no-print mt-10 border-t border-[color:var(--color-line)] pt-5">
            <p className="text-[0.8rem] leading-relaxed text-[color:var(--color-faint)]">
              Use &ldquo;Print this page&rdquo; and choose &ldquo;Save as PDF&rdquo; to produce a
              copy that matches the downloadable PDF. A formatted A4 version is also available as{' '}
              <a
                href={PDF_PATH}
                download={PDF_FILENAME}
                className="text-[color:var(--color-plasma-soft)] underline underline-offset-2"
              >
                {PDF_FILENAME}
              </a>
              .
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}
