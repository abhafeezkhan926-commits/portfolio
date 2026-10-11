/**
 * Skill groups. Each entry maps a technology to an icon key resolved by
 * src/components/TechIcon.jsx. No proficiency scores or durations are stored
 * here on purpose — the display is descriptive, not a rating.
 */

export const skillGroups = [
  {
    id: 'frontend',
    title: 'Frontend',
    blurb: 'Building responsive interfaces with a modern component workflow.',
    accent: '#4DA6FF',
    skills: [
      { name: 'HTML5', icon: 'SiHtml5', color: '#E34F26' },
      { name: 'CSS3', icon: 'SiCss', color: '#1572B6' },
      { name: 'JavaScript', icon: 'SiJavascript', color: '#F7DF1E' },
      { name: 'React', icon: 'SiReact', color: '#61DAFB' },
      { name: 'Vite', icon: 'SiVite', color: '#9B6BFF' },
      { name: 'Tailwind CSS', icon: 'SiTailwindcss', color: '#38BDF8' },
      { name: 'Ant Design', icon: 'SiAntdesign', color: '#1890FF' },
    ],
  },
  {
    id: 'ui-animation',
    title: 'UI & Animation',
    blurb: 'Interaction craft — layout, motion and the details in between.',
    accent: '#22D3EE',
    skills: [
      { name: 'Responsive Design', icon: 'lucide:MonitorSmartphone', color: '#22D3EE' },
      { name: 'GSAP Animation', icon: 'SiGreensock', color: '#8BE64B' },
      { name: 'Interactive Interfaces', icon: 'lucide:MousePointerClick', color: '#A5F3FC' },
      { name: 'Canvas Visuals', icon: 'lucide:Orbit', color: '#F2C46B' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    blurb: 'Server-side foundations for full-stack applications.',
    accent: '#8B5CF6',
    skills: [
      { name: 'Node.js', icon: 'SiNodedotjs', color: '#5FA04E' },
      { name: 'Express.js', icon: 'SiExpress', color: '#D6D6D6' },
      { name: 'REST APIs', icon: 'lucide:RadioTower', color: '#8B5CF6' },
      { name: 'Authentication Concepts', icon: 'SiJsonwebtokens', color: '#E6B3FF' },
    ],
  },
  {
    id: 'data',
    title: 'Database & Services',
    blurb: 'Storing and syncing application data.',
    accent: '#34D399',
    skills: [
      { name: 'MongoDB', icon: 'SiMongodb', color: '#47A248' },
      { name: 'Mongoose', icon: 'SiMongoose', color: '#880000' },
      { name: 'Firebase', icon: 'SiFirebase', color: '#FFCA28' },
      { name: 'Supabase', icon: 'SiSupabase', color: '#3ECF8E' },
    ],
  },
  {
    id: 'tools',
    title: 'Developer Tools',
    blurb: 'The everyday workflow — version control, testing and shipping.',
    accent: '#F2C46B',
    skills: [
      { name: 'Git', icon: 'SiGit', color: '#F05032' },
      { name: 'GitHub', icon: 'SiGithub', color: '#E6EDF3' },
      { name: 'Postman', icon: 'SiPostman', color: '#FF6C37' },
      { name: 'Vercel', icon: 'SiVercel', color: '#E6EDF3' },
    ],
  },
];

export default skillGroups;
