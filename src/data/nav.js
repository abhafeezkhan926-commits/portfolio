/**
 * Primary navigation. `id` values must match the `id` on each home-page
 * section so the header can scroll to them and mark the active one.
 */

export const BOOK_CALL_PATH = '/book-call';
export const CV_PATH = '/cv';

export const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'journey', label: 'Experience' },
  { id: 'cv', label: 'CV' },
  { id: 'contact', label: 'Contact' },
];

export const NAV_IDS = NAV_LINKS.map((link) => link.id);

export default NAV_LINKS;
