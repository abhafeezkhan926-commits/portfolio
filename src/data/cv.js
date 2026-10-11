/**
 * CV content — the single source for both the on-site CV section, the
 * dedicated /cv page and the generated PDF (client/scripts/generate-cv-pdf.mjs).
 * Edit this file once and every version of the CV updates together.
 *
 * Contact values (phone / email) come from the public frontend environment
 * variables in client/.env — see client/.env.example.
 */

import { contact, socials } from './profile.js';

export const cv = {
  name: 'Abdul Hafeez Khan',
  title: 'Frontend Developer',
  subtitle: 'React · Responsive Interfaces · UI Animation · Expanding into Full-Stack',
  summary:
    'Frontend developer building modern, responsive web applications with React, Vite and Tailwind CSS, with a strong interest in motion design and interface craft. Experienced in turning designs into accessible, performant components and in integrating REST APIs into real applications. Currently expanding into backend development with Node.js, Express and MongoDB, with the goal of working across the full stack.',
  skillGroups: [
    {
      title: 'Frontend',
      items: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Vite', 'Tailwind CSS', 'Ant Design'],
    },
    {
      title: 'UI & Animation',
      items: ['Responsive web design', 'GSAP', 'Interactive interface design', 'Canvas & SVG visuals'],
    },
    {
      title: 'Backend',
      items: ['Node.js', 'Express.js', 'REST APIs', 'Authentication concepts'],
    },
    {
      title: 'Database & Services',
      items: ['MongoDB', 'Mongoose', 'Firebase', 'Supabase'],
    },
    {
      title: 'Developer Tools',
      items: ['Git', 'GitHub', 'Postman', 'Vercel'],
    },
  ],
  projects: [
    {
      name: 'PLAY.TV',
      role: 'Video platform · React + Firebase',
      description:
        'A responsive video-platform-style web application with an explore feed, category filtering and search. Firebase Authentication unlocks liking, saving, commenting and subscribing, with library and history stored in Firestore.',
      links: [
        { label: 'Live demo', url: 'https://play-ten-phi.vercel.app/' },
        { label: 'Source', url: 'https://github.com/abhafeezkhan926-commits/play' },
      ],
    },
    {
      name: 'NexHub',
      role: 'Collectible car marketplace · React + Ant Design',
      description:
        'A marketplace frontend with product discovery, cart and wishlist persisted locally, a validated multi-step checkout, and an admin dashboard covering products, orders, users and analytics.',
      links: [{ label: 'Source', url: 'https://github.com/abhafeezkhan926-commits/nexhub' }],
    },
    {
      name: 'Raven Operations',
      role: 'Company management system · Deployed application',
      description:
        'An internal operations platform with separate employee and management workspaces, covering projects, tasks, attendance, leave and approval workflows behind an authenticated entry screen.',
      links: [{ label: 'Live demo', url: 'https://company-management-tau-ten.vercel.app/' }],
    },
  ],
  training: [
    {
      name: 'Saylani Mass IT Training (SMIT)',
      detail: 'Modern Web and App Development — Batch 18',
      description:
        'Project-based training covering the professional frontend workflow: responsive layout, component-based development, API integration and deployment.',
    },
  ],
  interests: [
    'Frontend engineering with React',
    'UI animation and interaction design',
    'Component systems and design consistency',
    'Full-stack development and REST APIs',
  ],
  links: {
    github: socials.github,
    linkedin: socials.linkedin,
  },
  /** Resolved at render time so empty values simply hide. */
  get contact() {
    return {
      phone: contact.phone,
      email: contact.email,
      github: socials.github,
      linkedin: socials.linkedin,
    };
  },
};

export default cv;
