/**
 * Developer journey timeline.
 * This is a learning and project timeline, not an employment history.
 * No employers, job titles, dates or awards are listed because none have
 * been provided — update this single file to extend the timeline later.
 */

export const journey = [
  {
    id: 'foundations',
    stage: 'Foundations',
    title: 'Web fundamentals',
    summary:
      'Started with the core building blocks of the web — semantic HTML, modern CSS layout and JavaScript — and learned to turn a design into a page that behaves properly at every screen width.',
    points: [
      'Semantic HTML5 structure and accessible markup',
      'CSS3 layout with Flexbox, Grid and responsive breakpoints',
      'JavaScript fundamentals, DOM interaction and events',
      'Version control with Git and a first GitHub workflow',
    ],
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Git'],
  },
  {
    id: 'react',
    stage: 'Frontend',
    title: 'Modern frontend with React',
    summary:
      'Moved from static pages to component-driven applications with React and Vite, adopting a modern styling workflow and learning to consume real APIs instead of hardcoded data.',
    points: [
      'Component architecture and state management in React',
      'Vite as a fast development and build tool',
      'Styling systems with Tailwind CSS and Ant Design',
      'Consuming REST APIs and inspecting them in Postman',
      'Route-based structure with React Router',
    ],
    stack: ['React', 'Vite', 'Tailwind CSS', 'Ant Design', 'React Router', 'Postman'],
  },
  {
    id: 'craft',
    stage: 'Craft',
    title: 'Interaction and interface craft',
    summary:
      'Focused on the quality of the interface itself — motion that communicates, interaction states that feel responsive, and the performance work needed to keep both smooth on real devices.',
    points: [
      'GSAP timelines for entrance and scroll-linked animation',
      'Micro-interactions, hover and press states',
      'Canvas and SVG work for lightweight visual systems',
      'Reduced-motion support and animation performance budgets',
      'Deployment workflows on Vercel',
    ],
    stack: ['GSAP', 'Canvas', 'SVG', 'Vercel'],
  },
  {
    id: 'training',
    stage: 'Training',
    title: 'Saylani Mass IT Training (SMIT)',
    summary:
      'Structured, project-based training in modern web and application development — covering the professional frontend workflow from layout and component design through to API integration and deployment.',
    points: [
      'Modern Web and App Development — Batch 18',
      'Hands-on, project-based assignments and reviews',
      'Professional development workflow and tooling',
      'Team-style code organisation and version control',
    ],
    stack: ['Modern Web', 'App Development'],
    badge: 'Training programme',
  },
  {
    id: 'fullstack',
    stage: 'Now',
    title: 'Moving toward full-stack',
    summary:
      'Currently building backend depth so that the applications I ship are complete rather than frontend-only — server logic, data modelling, APIs and authentication.',
    points: [
      'Node.js and Express service structure',
      'MongoDB data modelling with Mongoose',
      'REST API design, validation and error handling',
      'Authentication concepts and secure data flow',
      'Firebase and Supabase as managed backends',
    ],
    stack: ['Node.js', 'Express', 'MongoDB', 'Mongoose', 'Firebase', 'Supabase'],
    current: true,
  },
];

export default journey;
