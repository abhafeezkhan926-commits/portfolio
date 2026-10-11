/**
 * Generates the real CV PDF at client/public/Abdul-Hafeez-Khan-CV.pdf.
 *
 * The content comes from the same data module the /cv page renders
 * (src/data/cv.js), so the PDF and the web version can never drift apart.
 * Public contact values are read from the same VITE_ variables the site uses.
 *
 * Run: npm run cv:pdf
 */

import { createWriteStream, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import PDFDocument from 'pdfkit';

import cv from '../src/data/cv.js';
import { PDF_FILENAME } from '../src/data/cvPdf.js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDir, '..', 'public', PDF_FILENAME);

const INK = '#0b1220';
const ACCENT = '#1d4ed8';
const MUTED = '#5b6478';
const HAIRLINE = '#d8dee9';

const PAGE_WIDTH = 595.28; // A4
const MARGIN_X = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 52, bottom: 60, left: MARGIN_X, right: MARGIN_X },
  info: {
    Title: `CV — ${cv.name}`,
    Author: cv.name,
    Subject: `${cv.title} — curriculum vitae`,
    Keywords: 'frontend developer, react, cv',
  },
});

mkdirSync(dirname(outputPath), { recursive: true });
const stream = createWriteStream(outputPath);
doc.pipe(stream);

/* ------------------------------ helpers ------------------------------- */

function ensureSpace(needed) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function sectionTitle(text) {
  ensureSpace(44);
  doc.moveDown(0.55);
  doc
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .fillColor(ACCENT)
    .text(text.toUpperCase(), { characterSpacing: 1.4 });
  doc.moveDown(0.12);
  doc
    .moveTo(MARGIN_X, doc.y)
    .lineTo(MARGIN_X + CONTENT_WIDTH, doc.y)
    .lineWidth(0.7)
    .strokeColor(HAIRLINE)
    .stroke();
  doc.moveDown(0.42);
}

/* ------------------------------- header ------------------------------- */

doc.font('Helvetica-Bold').fontSize(22).fillColor(INK).text(cv.name);
doc.moveDown(0.2);
doc.font('Helvetica').fontSize(12).fillColor(ACCENT).text(cv.title);
doc.moveDown(0.12);
doc.font('Helvetica').fontSize(9.5).fillColor(MUTED).text(cv.subtitle);

const contactBits = [];
if (cv.contact.email) contactBits.push(cv.contact.email);
if (cv.contact.phone) contactBits.push(cv.contact.phone);
contactBits.push(cv.links.github, cv.links.linkedin);
doc.moveDown(0.25);
doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(contactBits.join('   ·   '));

/* ------------------------------ summary ------------------------------- */

sectionTitle('Summary');
doc.font('Helvetica').fontSize(9.6).fillColor(INK).text(cv.summary, { lineGap: 2.2 });

/* ------------------------------- skills ------------------------------- */

sectionTitle('Technical Skills');
for (const group of cv.skillGroups) {
  ensureSpace(24);
  doc.font('Helvetica-Bold').fontSize(9.6).fillColor(INK).text(`${group.title}: `, {
    continued: true,
  });
  doc.font('Helvetica').fillColor('#26303f').text(group.items.join(', '));
  doc.moveDown(0.22);
}

/* ------------------------------ projects ------------------------------ */

sectionTitle('Projects');
for (const project of cv.projects) {
  ensureSpace(70);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text(project.name);
  doc.moveDown(0.1);
  doc.font('Helvetica-Oblique').fontSize(9).fillColor(ACCENT).text(project.role);
  doc.moveDown(0.14);
  doc.font('Helvetica').fontSize(9.4).fillColor('#26303f').text(project.description, { lineGap: 2 });
  if (project.links.length > 0) {
    doc.moveDown(0.12);
    doc
      .font('Helvetica')
      .fontSize(8.6)
      .fillColor(MUTED)
      .text(project.links.map((link) => `${link.label}: ${link.url}`).join('    ·    '));
  }
  doc.moveDown(0.4);
}

/* ------------------------------ training ------------------------------ */

sectionTitle('Training');
for (const entry of cv.training) {
  ensureSpace(48);
  doc
    .font('Helvetica-Bold')
    .fontSize(10.2)
    .fillColor(INK)
    .text(entry.name, { continued: Boolean(entry.detail) });
  if (entry.detail) {
    doc.font('Helvetica-Oblique').fontSize(9.6).fillColor(MUTED).text(` — ${entry.detail}`);
  }
  doc.moveDown(0.14);
  doc.font('Helvetica').fontSize(9.4).fillColor('#26303f').text(entry.description, { lineGap: 2 });
  doc.moveDown(0.3);
}

/* ----------------------------- interests ------------------------------ */

sectionTitle('Interests');
doc.font('Helvetica').fontSize(9.6).fillColor('#26303f').text(cv.interests.join('  ·  '));

/* ------------------------------- footer ------------------------------- */

const footer = () => {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    // The footer sits inside the page margin; zero it while stamping so the
    // write does not trigger pdfkit's automatic page break.
    const page = doc.page;
    const bottomMargin = page.margins.bottom;
    page.margins.bottom = 0;
    doc
      .font('Helvetica')
      .fontSize(7.6)
      .fillColor(MUTED)
      .text(
        `${cv.name} — ${cv.title} · Curriculum Vitae`,
        MARGIN_X,
        page.height - 36,
        { width: CONTENT_WIDTH, align: 'center', lineBreak: false },
      );
    page.margins.bottom = bottomMargin;
  }
};

footer(); // stamp all pages before the document is finalised
doc.end();
stream.on('finish', () => {
  console.log(`[cv:pdf] wrote ${outputPath}`);
});
