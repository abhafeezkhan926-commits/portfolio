/**
 * Projects. Every link below was verified before publishing.
 * `live` is `null` when no working deployment has been confirmed —
 * the UI then shows the demo as unavailable instead of a broken link.
 */

export const projects = [
  {
    id: 'play-tv',
    name: 'PLAY.TV',
    category: 'Video platform',
    year: '2025',
    tagline: 'A streaming-style video application with accounts, library and search.',
    description:
      'A responsive video-platform-style web application built with React and Vite. The explore feed is browsable without signing in using public demo videos, with category filtering, search and a watch view. Signing in with Firebase Authentication unlocks the personal side of the app — liking, saving, commenting and subscribing — with the library, history and collection stored in Firestore.',
    highlights: [
      'Explore feed with category filtering and search',
      'Watch view with public demo video sources',
      'Firebase Authentication supporting email and Google sign-in',
      'Liked videos, history, collection and subscriptions in Firestore',
      'Protected actions that prompt for login rather than failing silently',
    ],
    note: 'Video uploading is intentionally out of scope for this version.',
    stack: ['React 18', 'Vite', 'React Router', 'Firebase Auth', 'Firestore', 'Lucide React'],
    thumbnail: '/projects/play-tv.png',
    thumbnailAlt: 'PLAY.TV explore page showing the category filters and video feed',
    live: 'https://play-ten-phi.vercel.app/',
    source: 'https://github.com/abhafeezkhan926-commits/play',
    featured: true,
  },
  {
    id: 'nexhub',
    name: 'NexHub',
    category: 'Marketplace',
    year: '2025',
    tagline: 'A collectible car marketplace with cart, checkout and an admin dashboard.',
    description:
      'A premium frontend marketplace for collectible cars, built with React, Vite, Tailwind CSS and Ant Design. The storefront covers product discovery and detail pages, with the cart and wishlist persisted in localStorage so a session survives a refresh. Checkout is a validated multi-step flow, and an admin dashboard provides overview, products, orders, users and analytics views. All product artwork is original local SVG.',
    highlights: [
      'Storefront, product detail pages and category discovery',
      'Cart and wishlist persisted in localStorage',
      'Multi-step checkout with schema validation',
      'Customer and admin views with protected account pages',
      'Admin dashboard for products, orders, users and analytics',
    ],
    note: 'Demo authentication is frontend-only and is not a production security layer.',
    stack: ['React 18', 'Vite', 'React Router', 'Tailwind CSS', 'Ant Design', 'GSAP', 'React Hook Form', 'Zod'],
    thumbnail: '/projects/nexhub.svg',
    thumbnailAlt: 'NexHub collectible car product artwork',
    live: 'https://nexhub-wheat.vercel.app/',
    source: 'https://github.com/abhafeezkhan926-commits/nexhub',
    featured: true,
  },
  {
    id: 'raven-operations',
    name: 'Raven Operations',
    category: 'Company management system',
    year: '2025',
    tagline: 'An internal operations platform for projects, tasks, attendance and leave.',
    description:
      'A deployed company management platform with two role-based workspaces: an employee workspace for day-to-day work and a management workspace for administrators. It covers internal workflows around projects, tasks, attendance, leave requests and approvals, behind an authenticated entry screen.',
    highlights: [
      'Separate employee and management workspaces',
      'Project and task tracking across teams',
      'Attendance and leave request handling',
      'Approval workflows for management',
      'Deployed as a live, publicly reachable application',
    ],
    note: 'No public repository has been provided for this project, so only the live deployment is linked.',
    stack: ['React', 'Vite', 'Node.js', 'REST API', 'Authentication'],
    thumbnail: '/projects/raven-operations.svg',
    thumbnailAlt: 'Raven Operations workspace selection screen',
    live: 'https://company-management-tau-ten.vercel.app/',
    source: null,
    featured: false,
  },
];

export default projects;
