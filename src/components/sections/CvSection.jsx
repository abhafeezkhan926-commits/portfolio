import { Download, ExternalLink, FileText, Printer } from 'lucide-react';

import { cv } from '../../data/cv';
import { PDF_FILENAME, PDF_PATH } from '../../data/cvPdf';
import { CV_PATH } from '../../data/nav';
import { profile } from '../../data/profile';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

export default function CvSection() {
  const { contact } = cv;

  return (
    <section id="cv" className="section" aria-labelledby="cv-title">
      <div className="shell">
        <SectionHeading
          id="cv-title"
          eyebrow="Curriculum Vitae"
          title="The full CV, one click away"
          lead="The CV below is the same document in three forms — a readable page on this site, a print-ready layout, and a PDF download. All three are generated from a single source file, so they never drift apart."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <Reveal className="glass edge-glow relative overflow-hidden p-7 md:p-9" delay={60}>
            <span className="orbit-ring -right-28 -top-28 hidden h-72 w-72 md:block" aria-hidden="true" />

            <div className="flex flex-wrap items-center gap-3">
              <span className="chip">
                <FileText size={12} aria-hidden="true" />
                PDF · A4
              </span>
              <span className="chip">{profile.timezoneLabel}</span>
            </div>

            <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl text-[color:var(--color-ink)]">
              {cv.name}
            </h3>
            <p className="mt-1 text-[0.95rem] font-medium text-[color:var(--color-plasma-soft)]">
              {cv.title}
            </p>
            <p className="mt-1 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--color-faint)]">
              {cv.subtitle}
            </p>

            <p className="mt-5 text-[0.95rem] leading-relaxed text-[color:var(--color-muted)]">
              {cv.summary}
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {cv.skillGroups.slice(0, 4).map((group) => (
                <div key={group.title}>
                  <h4 className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[color:var(--color-cyan)]">
                    {group.title}
                  </h4>
                  <p className="mt-2 text-[0.87rem] leading-relaxed text-[color:var(--color-muted)]">
                    {group.items.join(' · ')}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 border-t border-[color:var(--color-line)] pt-6">
              <h4 className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[color:var(--color-cyan)]">
                Training
              </h4>
              {cv.training.map((item) => (
                <div key={item.name} className="mt-2">
                  <p className="text-[0.92rem] font-medium text-[color:var(--color-ink)]">
                    {item.name}
                  </p>
                  <p className="text-[0.86rem] text-[color:var(--color-muted)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal className="glass edge-glow lift flex flex-col gap-4 p-7" delay={120}>
              <h3 className="font-[family-name:var(--font-display)] text-lg text-[color:var(--color-ink)]">
                Get the CV
              </h3>
              <p className="text-[0.88rem] leading-relaxed text-[color:var(--color-muted)]">
                Open the readable version in a new tab, download the PDF, or print the page straight
                from the browser.
              </p>

              <div className="flex flex-col gap-2.5 pt-1">
                <a
                  href={CV_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  View CV
                  <span className="sr-only">(opens in a new tab)</span>
                </a>

                <a href={PDF_PATH} download={PDF_FILENAME} className="btn btn-ghost w-full">
                  <Download size={16} aria-hidden="true" />
                  Download CV (PDF)
                </a>

                <a
                  href={PDF_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost w-full"
                >
                  <Printer size={16} aria-hidden="true" />
                  Open PDF for printing
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            </Reveal>

            <Reveal className="glass lift flex flex-col gap-3 p-7" delay={180}>
              <h3 className="font-[family-name:var(--font-display)] text-base text-[color:var(--color-ink)]">
                On the CV
              </h3>
              <ul className="flex flex-col gap-2 text-[0.86rem] leading-relaxed text-[color:var(--color-muted)]">
                <li>Frontend engineering with React and Vite</li>
                <li>Responsive layout and accessible components</li>
                <li>Motion and interface craft with GSAP</li>
                <li>REST API integration and Firebase services</li>
                <li>Backend development in progress — Node.js, Express, MongoDB</li>
              </ul>

              {contact.email && (
                <p className="mt-2 border-t border-[color:var(--color-line)] pt-3 text-[0.84rem] text-[color:var(--color-faint)]">
                  Email: <span className="text-[color:var(--color-muted)]">{contact.email}</span>
                </p>
              )}
              {contact.phone && (
                <p className="text-[0.84rem] text-[color:var(--color-faint)]">
                  Phone: <span className="text-[color:var(--color-muted)]">{contact.phone}</span>
                </p>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
