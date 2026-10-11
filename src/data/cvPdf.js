/**
 * The generated CV PDF lives in client/public, so it is served from the site
 * root. Both the CV section and the /cv page link to it, and
 * client/scripts/generate-cv-pdf.mjs writes to exactly this filename — change
 * it here and the generator follows.
 */

export const PDF_FILENAME = 'Abdul-Hafeez-Khan-CV.pdf';
export const PDF_PATH = `/${PDF_FILENAME}`;

export default PDF_PATH;
