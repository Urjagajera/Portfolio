// Resume content for the Portfolio > Browse folders. Source: Urja_Gajera_Resume_v4 (Oct 2026).
//
// SAMPLE CONTENT: anything wrapped in [[double brackets]] is a draft placeholder and images with `ph: true` are
// sample pictures. With MARK_PLACEHOLDERS = false they are hidden from visitors entirely; set it to true while
// editing to see them with a dashed yellow highlight.
export const MARK_PLACEHOLDERS = false;

export const RESUME_PDF = '/Urja_Gajera_Resume.pdf';

export const LINKS = {
  linkedin: 'https://linkedin.com/in/urja-gajera-a70aa631a',
  github: 'https://github.com/Urjagajera',
  githubUser: 'Urjagajera',
  codechef: 'https://www.codechef.com/users/urja07',
  codolio: 'https://codolio.com/profile/Urja12',
  codolioUser: 'Urja12',
};

export const FOLDERS = [
  { id: 'r-projects', label: 'Projects', open: true },
  { id: 'r-internship', label: 'Internship', open: true },
  { id: 'r-education', label: 'Education', open: true },
  { id: 'r-skills', label: 'Technical Skills', open: true },
  { id: 'r-leadership', label: 'Leadership', open: true },
  { id: 'r-hackathons', label: 'Hackathons', open: true },
  { id: 'r-achievements', label: 'Achievements', open: true },
  { id: 'r-certificates', label: 'Certificates', open: true },
  { id: 'r-additional', label: 'Additional Info', open: true },
  { id: 'r-contact', label: 'Summary & Contact', open: true },
];

export const SUMMARY = 'Computer Science student with a strong interest in full-stack web development and practical application of AI in real products. Comfortable across React, Next.js, Node.js, Flask and SQL databases, with experience taking projects from idea to working, deployed applications. Completed a software development internship at MCT IT Solutions, building role-based dashboards for a real agricultural supply-chain platform as part of a 4-person team, and has separately built and shipped individual full-stack projects on the side. Also active in hackathons, technical clubs and student leadership.';

// recruiter-facing summary: the hero impact strip and the 60-second view both read from these
export const HEADLINE = 'Full-stack & AI developer · B.Tech CSE, CHARUSAT (2024 - 2028)';
export const AVAILABILITY = 'Open to internships';
// [value, label in the 60-second view, short label for the hero strip]
export const IMPACT = [
  ['1300+', 'problems solved on CodeChef', 'CodeChef problems'],
  ['2nd', 'prize, CHAOS2COMMIT 2026', 'prize, CHAOS2COMMIT'],
  ['Intern', 'React & Node, MCT IT', 'React & Node'],
  ['Secretary', 'IEEE CHARUSAT Student Branch', 'IEEE Branch'],
  ['Elite', 'NPTEL, IIT Kanpur', 'NPTEL, IIT Kanpur'],
];

export const CONTACT = {
  phone: '+91 7984730725',
  email: 'urjagajera12@gmail.com',
  // contact-form delivery (formsubmit.co, no account). The first message triggers a one-time activation email
  // to the address above; after activating you can swap the address for the random alias FormSubmit gives you.
  form: 'https://formsubmit.co/ajax/urjagajera12@gmail.com',
};

const shot = (n, caption, ph = true) => ({ src: `/assets/resume/${n}.svg`, caption, ph });
const png = (n, caption) => ({ src: `/assets/resume/${n}.jpg`, caption, ph: false });
const cert = (file, caption) => ({ src: `/assets/certs/${file}`, caption });

export const EDUCATION = {
  degree: 'Bachelor of Technology in Computer Science and Engineering',
  period: 'July 2024 - May 2028',
  school: 'Charotar University of Science and Technology (CHARUSAT), CSPIT - Anand, India',
  cgpa: '7.88 / 10.00 (till Semester 4)',
  // kept for reference, not shown on the page
  sgpa: [['Semester 1', '7.74'], ['Semester 2', '7.50'], ['Semester 3', '7.63'], ['Semester 4', '8.14']],
};

export const INTERNSHIP = {
  role: 'Software Development Intern',
  company: 'MCT IT Solutions Pvt. Ltd.',
  period: '12 May 2026 - 12 June 2026',
  project: 'Company Project: EGE Agritech (agricultural supply-chain platform) | 4-member team | Ahmedabad, Gujarat',
  stats: [['4', 'role-based portals'], ['Lead', 'frontend developer'], ['Live', 'data over REST APIs'], ['4', 'member team']],
  points: [
    'Led frontend development in a 4-member team and built all the role-based dashboards and portals in React 19 and TypeScript, for farmers, warehouse workers, operations managers and delivery partners.',
    'Connected the dashboards to Node.js, Express.js, Prisma and MySQL REST APIs so every dashboard shows live data, and developed the login module and API routes with the team.',
    'Implemented a responsive UI with Tailwind CSS across all portals.',
    'Added form validation on both the frontend and the backend.',
  ],
  shots: [{ src: '/assets/certs/mct-internship.jpg', caption: 'Internship completion letter, MCT IT Solutions' }],
  tech: 'React 19, TypeScript, Node.js, Express.js, MySQL, Prisma, JWT, Tailwind CSS, Socket.IO',
  repo: 'https://github.com/Urjagajera/EGE-agritech',
};

export const PROJECTS = [
  {
    name: 'Nirman',
    subtitle: 'AI-Powered Solution Builder',
    badge: 'CHAOS2COMMIT 2026 - 2nd Prize',
    meta: '3-member team',
    pitch: 'Turns an idea into a working, deployed app: finds missing requirements, builds a solution blueprint, then generates, previews and deploys the code. Won 2nd prize at CHAOS2COMMIT.',
    paras: [
      'Nirman is an AI-powered solution builder that takes an idea from concept to a structured, working application. Instead of jumping directly into development, it understands the problem, identifies missing requirements, recommends solutions, creates a complete solution blueprint, and helps build, preview, and deploy the application.',
      'The platform combines AI-driven business analysis, architecture planning, technology recommendations, design generation, code generation, build validation, live preview, and deployment into one workflow.',
    ],
    role: 'I was one of 2 full-stack developers in a 3-member team. I developed the React, TypeScript, Vite and Tailwind CSS frontend, including the full landing page, use case and ER diagrams, an interactive graph with node details, an editable solution blueprint and multilingual support. I also wrote the system prompts, built chat isolation, implemented RAG and chained the AI models into one pipeline for faster execution.',
    metrics: [['8', 'stages, idea to deploy'], ['3', 'LLM providers'], ['2nd', 'prize, CHAOS2COMMIT']],
    diagram: { src: '/assets/resume/nirman-how-it-works.jpg', caption: 'How Nirman works', whole: true },
    shots: [png('nirman-1', 'Nirman workspaces dashboard'), png('nirman-2', 'CampusBridge — a generated app'), png('photo-nirman-prize', 'Receiving the 2nd prize at CHAOS2COMMIT')],
    tech: 'React, TypeScript, Vite, Tailwind CSS, Python, FastAPI, PostgreSQL, SQLAlchemy, Pydantic, Alembic, JWT, Docker, Groq, Google Gemini, OpenRouter',
    video: { src: '/assets/resume/nirman-product-demo.mp4', poster: '/assets/resume/nirman-product-demo-poster.jpg', caption: 'Product demo: idea to deployed app, end to end', controls: true, ratio: '1280 / 680' },
    achievement: '2nd Prize at CHAOS2COMMIT 2026, organized by Futurizzon Technologies, Ahmedabad.',
  },
  {
    name: 'SchemeSetu',
    subtitle: 'Government Scheme Discovery Platform',
    badge: '2026',
    meta: 'Individual | Deployed',
    pitch: 'Helps citizens find the central and state government schemes they qualify for: 4,722 real schemes, eligibility filters, and English, Hindi and Gujarati.',
    points: [
      'Built a pan-India scheme discovery platform that organises 4,722 real central and state government schemes across all 36 states and union territories.',
      'Added multi-criteria eligibility filtering (state, age, gender, social category, occupation and family income) so people see only schemes they could qualify for.',
      'Made the whole site trilingual (English, Hindi and Gujarati), with scheme content translated through an LLM pipeline.',
      'Wrote a CSV ingestion pipeline that validates and repairs every scheme record, plus a weekly GitHub Actions job that pulls newly published schemes from myScheme into the database.',
      'Covered the frontend and backend with 1,100+ automated tests run in CI on every push.',
    ],
    metrics: [['4,722', 'government schemes'], ['36', 'states & UTs'], ['3', 'languages'], ['1,100+', 'automated tests']],
    diagram: { src: '/assets/resume/schemesetu-how-it-works.jpg', caption: 'How SchemeSetu works', whole: true },
    video: { src: '/assets/resume/schemesetu-demo.mp4', poster: '/assets/resume/schemesetu-demo-poster.jpg', caption: 'Search, eligibility filters, scheme details and the Gujarati version', controls: true },
    tech: 'React 19, TypeScript, Vite, Tailwind CSS, Node.js, Express, PostgreSQL, Prisma, Groq, GitHub Actions',
    repo: 'https://github.com/Urjagajera/SchemeSetu',
    live: 'https://schemesetu-chi.vercel.app',
  },
  {
    name: 'CourtCall',
    subtitle: 'Real-time Courtroom Communication',
    badge: 'Nexconn Build Challenge 2026',
    meta: '2-member team | Live',
    pitch: 'Juniors report courtroom progress in one tap; every lawyer sharing that courtroom sees it live and each client is alerted about their own case.',
    points: [
      'Built a real-time app for lawyers, junior lawyers, office staff and clients: a junior reports courtroom progress ("Item 12 is being heard") with one tap and everyone affected sees it instantly.',
      'Shared courtroom rooms work across different law offices, while each firm’s cases, clients and chat stay private to that firm.',
      'Clients get a private link (no app or sign-up needed) showing how far the court has reached with their case, with alerts as it gets close.',
      'All real-time messaging, calls and voice notes run on the Nexconn Chat SDK, with Web Push notifications and an installable PWA.',
      'Added one-tap demo accounts for every role, backed by sample data, so anyone can try the app without signing up.',
    ],
    metrics: [['5', 'user roles'], ['1-tap', 'progress updates'], ['0', 'sign-up needed for clients']],
    diagram: { src: '/assets/resume/courtcall-how-it-works.jpg', caption: 'How CourtCall works', whole: true },
    // recorded with the one-tap demo accounts (sample data only)
    video: { src: '/assets/resume/courtcall-demo.mp4', poster: '/assets/resume/courtcall-demo-poster.jpg', caption: 'A junior reports progress; the client and the lawyer see it live', controls: true },
    tech: 'React, TypeScript, Vite, Tailwind CSS, Node.js, Express, Zod, PostgreSQL (Supabase), Drizzle ORM, Nexconn Chat SDK, Web Push',
    repo: 'https://github.com/Urjagajera/CourtCall',
    live: 'https://courtcall-kappa.vercel.app',
  },
  {
    name: 'CrackIt',
    subtitle: 'AI Interview Coach',
    badge: '2026',
    meta: 'Individual',
    pitch: 'Upload a resume, match it against a job description, then practise voice mock interviews with an AI interviewer that scores answers and writes a report.',
    points: [
      'Built an AI interview coach: resume upload (PDF/DOCX), a detailed resume review, and job-description matching with tailoring advice.',
      'Mock interviews with AI-written questions that adapt to each answer, with voice answers transcribed by Whisper on Groq and a live speech preview.',
      'Grounded interview questions in the user’s own documents (project reports, specs, job descriptions) through RAG with a local embedding model.',
      'Each interview ends in a report: scores, per-question feedback, “what you could say”, answering-method guides like STAR, and a PDF download.',
      'FastAPI backend with SQLAlchemy and Alembic migrations on Supabase PostgreSQL, a React 19 frontend, and tests run in GitHub Actions on every push.',
    ],
    diagram: { src: '/assets/resume/crackit-how-it-works.jpg', caption: 'How CrackIt works', whole: true },
    tech: 'React 19, TypeScript, Vite, Tailwind CSS, Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL (Supabase), Groq, Whisper, sentence-transformers',
    // repo is private, so no link
  },
  {
    name: 'Strux',
    subtitle: 'AI Productivity Operating System',
    badge: '2025/2026',
    meta: 'Individual | Completed | Deployed',
    pitch: 'One AI workspace for chat, tasks, notes, calendar and habits, with long-term memory and automatic task extraction. Built and deployed solo on Vercel.',
    points: [
      'Built a single AI-powered workspace that combines chat, tasks, notes, calendar, habit tracking and a focus timer, instead of switching between separate apps.',
      'Added two AI modes with long-term memory using Groq SDK, so the assistant can recall context from earlier conversations.',
      'Built an autonomous background AI feature that reads a conversation and automatically pulls out action items as tasks.',
      'Designed 9 dashboard modules including a Pomodoro focus timer, a 365-day habit tracker and weekly AI-generated reports backed by a 10-table database.',
      'Handled the entire build individually: Next.js 16/React 19 frontend, Supabase PostgreSQL database, Google OAuth login via NextAuth, and deployment on Vercel.',
    ],
    metrics: [['9', 'dashboard modules'], ['10', 'table database'], ['2', 'AI modes with memory'], ['365', 'day habit tracker']],
    tech: 'Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL), NextAuth, Groq SDK',
    repo: 'https://github.com/Urjagajera/Strux',
    diagram: { src: '/assets/resume/strux-how-it-works.jpg', caption: 'How Strux works', whole: true },
  },
  {
    name: 'NutriFit',
    subtitle: 'Fitness & Nutrition Management Platform',
    badge: '2025',
    meta: 'Individual | Completed',
    pitch: 'Flask platform that generates diet and workout plans from each user’s BMI and BMR, with user and admin roles and progress dashboards.',
    points: [
      'Built a full-stack fitness and nutrition management platform in Flask where admins (dietitians) manage and assign personalized diet plans, workout links, and health recommendations.',
      'Designed dedicated User and Admin roles with secure authentication, password hashing, and CSRF protection using Flask-WTF.',
      'Implemented daily water and weight tracking dashboards with Chart.js visualizations so users can monitor progress against assigned plans.',
      'Structured the app across 12 - 15 pages and 6 database tables, covering health assessments, plan management, and administrative tracking.',
      'Used SQLAlchemy for database operations and handled secure file uploads for user health data.',
    ],
    metrics: [['12-15', 'pages'], ['6', 'database tables'], ['2', 'user roles']],
    shots: [png('nutrifit-1', 'NutriFit landing page'), png('nutrifit-2', 'User dashboard — cockpit'), png('nutrifit-3', 'Admin panel — tracking & plans')],
    tech: 'Python, Flask, MySQL, SQLAlchemy, Flask-WTF, Chart.js, HTML, CSS',
    repo: 'https://github.com/Urjagajera/NutriFit',
    // recorded on a local copy with made-up members (no real user data)
    videos: [
      { label: 'Member side', src: '/assets/resume/nutrifit-user-demo.mp4', poster: '/assets/resume/nutrifit-user-demo-poster.jpg', caption: 'Sign up, health quiz, personal dashboard and progress charts', controls: true },
      { label: 'Admin side', src: '/assets/resume/nutrifit-admin-demo.mp4', poster: '/assets/resume/nutrifit-admin-demo-poster.jpg', caption: 'Member list, a member’s progress, assigning a diet plan and workout', controls: true },
    ],
    diagram: { src: '/assets/resume/nutrifit-how-it-works.jpg', caption: 'How NutriFit works', whole: true },
  },
  {
    name: 'Smart Expense Analyzer',
    subtitle: 'CSV spending analysis tool',
    badge: '2025',
    meta: 'Individual | Completed',
    points: [
      'Built a Python tool that reads CSV bank/expense statements and analyzes spending automatically, without manual data entry.',
      'Grouped and totalled transactions across 4 expense categories using Python’s csv module.',
      'Generated pie chart visualizations with Matplotlib to make spending patterns easy to read at a glance.',
      "Added exportable reports so the analysis isn't locked inside the script.",
    ],
    shots: [png('expense-1', 'Expense distribution by category')],
    tech: 'Python, csv module, Matplotlib',
    diagram: { src: '/assets/resume/expense-how-it-works.jpg', caption: 'How Smart Expense Analyzer works', whole: true },
    repo: 'https://github.com/Urjagajera/Smart-Expense-Analyzer',
  },
];

export const SKILLS = [
  ['Programming Languages', 'Python, Java, C++, C, JavaScript, TypeScript, SQL, HTML, CSS'],
  ['Frameworks & Libraries', 'React, Next.js, Flask, FastAPI, Node.js, Express.js, Tailwind CSS'],
  ['AI / ML', 'Groq, Google Gemini, OpenRouter, LangChain, LangGraph, RAG, prompt engineering'],
  ['Databases', 'MySQL, PostgreSQL, Supabase'],
  ['Testing & DevOps', 'Jest, Pytest, Docker, GitHub Actions (CI/CD)'],
  ['Concepts', 'REST APIs, JWT authentication, Object-Oriented Programming, Data Structures & Algorithms'],
  ['Tools & Platforms', 'Git, GitHub, Postman, Vercel, Power BI, Jupyter Notebook, Figma, Google Colab, Kaggle'],
];

export const LEADERSHIP = [
  {
    role: 'Secretary, IEEE CHARUSAT Student Branch',
    period: 'July 2025 - June 2026',
    points: [
      'Organized 5+ workshops and a general body meeting for 100+ members.',
      'Coordinated "Introduction to Network Sniffing: Hands-on with Wireshark" (July 2025).',
    ],
  },
  {
    role: 'Secretary, IEEE CHARUSAT WIE Affinity Group',
    period: 'March 2025 - July 2025',
    points: [
      'Volunteered at the STEM outreach event with the NSS unit at S. I. Patel D. Kanya Vidhyalay, Roon (August 2025).',
    ],
  },
];
// presenting Nirman live to the CHAOS2COMMIT 2026 judges (we won 2nd prize): shown on the Leadership page
export const LEADERSHIP_VIDEO = {
  src: '/assets/resume/nirman-presentation.mp4',
  poster: '/assets/resume/nirman-presentation-poster.jpg',
  caption: 'Presenting Nirman live to the judges at CHAOS2COMMIT 2026 (2nd prize)',
};

export const LEADERSHIP_MEDIA = [
  cert('ieee-sb-secretary.jpg', 'IEEE certificate: Secretary, Student Branch'),
  cert('ieee-wie-secretary.jpg', 'IEEE certificate: Secretary, WIE Affinity Group'),
  cert('wireshark-workshop.jpg', 'Wireshark workshop, IEEE CHARUSAT SB'),
  cert('ieee-stem.jpg', 'STEM outreach, IEEE WIE x NSS'),
  cert('step-talk.jpg', 'STEP Talk, IEEE CSPIT SB'),
];

export const HACKATHON_STATS = [['5+', 'hackathons'], ['15', 'events volunteered'], ['4', 'events organized'], ['2nd', 'prize at CHAOS2COMMIT']];

export const HACKATHONS = [
  {
    name: 'CHAOS2COMMIT 2026',
    by: 'Futurizzon Technologies, Ahmedabad',
    project: 'Nirman, an AI-powered solution builder',
    role: 'One of 2 full-stack developers: built the React/TypeScript frontend (landing page, use case and ER diagrams, interactive graph, editable solution blueprint, multilingual support), wrote the system prompts, built chat isolation and implemented RAG in the AI pipeline.',
    result: '2nd Prize',
    media: [png('photo-nirman-prize', 'Receiving the 2nd prize'), cert('chaos2commit-winner.jpg', 'CHAOS2COMMIT winner certificate')],
  },
  {
    name: 'Odoo x CHARUSAT Hackathon 2025',
    by: '24 hours, 2 March 2025 (my first hackathon)',
    project: 'TaxMate, a smart tax assistant for freelancers and small business owners: tracks income and expenses, suggests tax-saving tips and supports e-filing',
    role: 'API & Integration team: financial APIs, backend services, real-time data',
    result: 'Selected for the Project Development Round',
    stack: 'React.js, Node.js, Express.js, PostgreSQL, Python (AI/ML), Kaggle APIs',
    media: [cert('odoo-hackathon.jpg', 'Odoo x CHARUSAT certificate')],
  },
  {
    name: 'MSBC Company Hackathon 2025',
    project: 'AI Meeting Analyzer',
    role: 'Frontend development: designed and built the UI pages',
    result: 'Finalist',
  },
  {
    name: 'Bharatiya Antariksh Hackathon 2026 (ISRO)',
    by: 'Presented by ISRO, powered by Hack2skill',
    result: 'Idea submitted',
    media: [cert('isro-bah-2026.jpg', 'ISRO participation certificate')],
  },
  {
    name: 'We For She Hacker-ramp 2026',
    result: 'Participated',
  },
];

export const CODING_PROFILES = [['1300+', 'problems solved on CodeChef'], ['Diamond', 'Problem Solver badge']];

export const ACHIEVEMENTS = [
  { text: '2nd Prize at CHAOS2COMMIT 2026, organized by Futurizzon Technologies, Ahmedabad (Nirman).', img: png('photo-nirman-prize', 'CHAOS2COMMIT 2nd prize') },
  { text: 'Solved 1300+ problems on CodeChef and earned the Problem Solver Diamond Badge, across C, C++, Java, Python and Web Development.', img: cert('codechef-diamond.jpg', 'CodeChef Problem Solver Diamond Badge') },
  { text: 'NPTEL Elite certification in Theory of Computation, IIT Kanpur (one of 754 candidates certified).', img: cert('nptel-toc.jpg', 'NPTEL Elite: Theory of Computation') },
  { text: 'Won first place and the Dhyan Chand Trophy in the inter-institute basketball tournament at CHARUSAT.', img: cert('dhyan-chand-cup.jpg', 'Major Dhyan Chand Cup, basketball champions') },
];

export const ADDITIONAL = [
  ['Languages', 'English, Hindi, Gujarati'],
  ['Interests', 'Sketching & Realistic Portrait Drawing, Sports & Fitness, Karate (Wado-kai, Purple Belt), Volunteering, Hackathons'],
];
