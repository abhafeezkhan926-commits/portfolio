/**
 * Single source of truth for identity, contact details and social links.
 * Update this file to change the name, links or contact information
 * everywhere on the site (header, hero, footer, contact, CV, booking page).
 */

// `import.meta.env` exists under Vite; the fallback keeps this module usable
// from plain Node (the CV PDF generation script imports it).
const env = import.meta.env ?? {};

/**
 * Public contact values. These are read from frontend environment variables
 * on purpose — see client/.env.example. Anything in a VITE_ variable is
 * visible to visitors, so only public information belongs here.
 * Empty values are handled gracefully: the related option is hidden.
 */
export const contact = {
  phone: (env.VITE_CONTACT_PHONE || '').trim(),
  email: (env.VITE_CONTACT_EMAIL || '').trim(),
};

export const socials = {
  github: 'https://github.com/abhafeezkhan926-commits',
  linkedin: 'https://www.linkedin.com/in/abdul-hafeez-khan-2754562b4/',
  instagram: 'https://www.instagram.com/levi_akerman926/',
};

export const profile = {
  name: 'Abdul Hafeez Khan',
  firstName: 'Abdul Hafeez',
  monogram: 'AH',
  brand: 'Abdul Hafeez Khan',
  title: 'Frontend Developer',
  positioning:
    'Frontend developer building modern, responsive web applications, with an expanding focus on backend development and full-stack engineering.',
  availability: 'Open to opportunities and collaborations',
  timezone: 'Asia/Karachi',
  timezoneLabel: 'Pakistan Standard Time (PKT)',
  tagline: 'Building Digital Experiences Beyond the Ordinary.',
  roles: [
    'Frontend Developer',
    'React Developer',
    'Web Developer',
    'UI Animation Enthusiast',
    'Aspiring Full-Stack Developer',
  ],
  intro:
    'I design and build responsive, animation-driven web interfaces with React, Tailwind CSS and GSAP — interfaces that feel fast, considered and genuinely pleasant to use. My work sits where clean engineering meets visual craft: accessible layouts, meaningful motion and components that hold up on every screen size. Right now I am expanding into backend development with Node.js, Express and MongoDB, and building real full-stack features to grow from frontend developer into full-stack engineer.',
  shortBio:
    'Frontend developer focused on React, responsive interfaces and purposeful animation, currently expanding into Node.js, Express and MongoDB.',
  about: {
    lead: 'I build interfaces that feel effortless — and I care about every layer underneath them.',
    paragraphs: [
      'My work starts with structure: semantic HTML, a layout that behaves at every breakpoint, and components that stay readable as a project grows. From there I focus on the details that separate a working interface from a memorable one — spacing, contrast, motion timing and the small interaction states users never consciously notice but always feel.',
      'I work primarily in React with Vite, styling with Tailwind CSS and Ant Design, and I use GSAP when an interface benefits from motion that carries meaning rather than decoration. I review my own APIs in Postman, keep work versioned on GitHub, and ship on Vercel.',
      'Beyond the frontend, I am steadily building backend depth: Node.js and Express services, MongoDB data modelling with Mongoose, REST API design, and authentication concepts. The 15-minute call booking system on this website is built with that stack end to end — a small but complete example of where I am heading.',
    ],
    philosophy: [
      {
        title: 'Structure before styling',
        body: 'Semantic markup and a predictable component structure make everything after them easier — including accessibility, performance and future changes.',
      },
      {
        title: 'Motion with intent',
        body: 'Animation should explain an interface, not decorate it. I keep transitions short, purposeful and respectful of users who prefer reduced motion.',
      },
      {
        title: 'Performance is a feature',
        body: 'Fast first paint, lean bundles and animation work kept off the critical path. A beautiful interface that stutters is not a finished interface.',
      },
      {
        title: 'Accessible by default',
        body: 'Keyboard navigation, visible focus states and real contrast are part of the build, not a later pass. Every visitor should be able to use what I make.',
      },
    ],
    interests: [
      'Frontend engineering with React',
      'UI animation and interaction design',
      'Design systems and reusable components',
      'Full-stack development and REST APIs',
      'Web performance and accessibility',
    ],
    currentlyLearning: [
      'Node.js and Express service architecture',
      'MongoDB data modelling with Mongoose',
      'Authentication and session concepts',
      'Connecting React frontends to real databases',
    ],
  },
};

export default profile;
