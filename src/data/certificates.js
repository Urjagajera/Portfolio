// Certificates for the draggable canvas in Portfolio > Browse > Certificates.
// `w`/`h` are the image pixel sizes (used for layout).
const img = (n) => `/assets/certs/${n}`;

export const CERT_CATEGORIES = ['Leadership & Work', 'Courses & Coding', 'Hackathons', 'Sports'];

export const CERTS = [
  {
    id: 'chaos2commit-winner', cat: 'Hackathons', file: 'chaos2commit-winner.jpg', w: 1400, h: 1018,
    title: 'CHAOS2COMMIT 2026: 2nd Position', by: 'Futurrizon Technologies × CHARUSAT University', date: '25 to 26 September 2026 (2 days)',
    rows: [
      ['Achievement', 'Secured 2nd position at this 2-day technology innovation hackathon with Nirman, an AI-powered solution builder that takes an idea from concept to a structured, working application.'],
      ['My role', 'One of 2 full-stack developers in a 3-member team: built the React/TypeScript frontend (landing page, use case and ER diagrams, interactive graph, editable blueprint, multilingual support), wrote the system prompts and implemented RAG.'],
      ['Key takeaway', 'We hit network issues and ran out of API credits just before the final presentation. Fixing it under time pressure taught me to stay calm and decide what to do next.'],
    ],
  },
  {
    id: 'mct-internship', cat: 'Leadership & Work', file: 'mct-internship.jpg', w: 1100, h: 1513,
    title: 'Industry Internship: React & Node.js', by: 'MCT IT Solutions Pvt. Ltd., Ahmedabad', date: '12 May to 12 June 2026',
    rows: [
      ['Role', 'Software Development Intern, working on project-based learning in React and Node.js under the guidance of Nihal Bhatasna.'],
      ['What I did', 'Built role-based dashboards for a real agricultural supply-chain platform as part of a 4-person team.'],
      ['Feedback', 'Described in the completion letter as diligent, hardworking and inquisitive.'],
    ],
  },
  {
    id: 'ieee-sb-secretary', cat: 'Leadership & Work', file: 'ieee-sb-secretary.jpg', w: 1400, h: 989,
    title: 'Secretary, IEEE CHARUSAT Student Branch', by: 'IEEE Certificate of Volunteering', date: 'July 2025 to June 2026',
    rows: [
      ['Recognition', 'Official IEEE certificate recognizing my service to the mission and members of IEEE as Secretary of the CHARUSAT Student Branch.'],
      ['What it involved', 'Coordinating branch activities, workshops and technical events, communicating with members and faculty, and keeping things moving behind the scenes.'],
    ],
  },
  {
    id: 'isro-bah-2026', cat: 'Hackathons', file: 'isro-bah-2026.jpg', w: 997, h: 752,
    title: 'Bharatiya Antariksh Hackathon 2026', by: 'Indian Space Research Organisation (ISRO), powered by Hack2skill', date: '2026',
    rows: [
      ['Recognition', 'Certificate of participation for a successful idea submission in ISRO’s national space-tech innovation hackathon.'],
      ['Details', 'Worked on an idea for a real-world space challenge as part of a national innovation initiative.'],
    ],
  },
  {
    id: 'nptel-toc', cat: 'Courses & Coding', file: 'nptel-toc.jpg', w: 843, h: 598,
    title: 'Theory of Computation: NPTEL Elite', by: 'IIT Kanpur, NPTEL (Govt. of India)', date: 'July to September 2026 (8-week course)',
    rows: [
      ['Result', 'Elite certificate with a consolidated score of 64% (proctored exam plus online assignments), one of 754 candidates certified.'],
      ['Course details', 'Automata, regular and context-free languages, Turing machines and decidability: the formal foundations behind compilers and computation.'],
    ],
  },
  {
    id: 'codechef-1000', cat: 'Courses & Coding', file: 'codechef-1000.jpg', w: 1080, h: 1080,
    title: '1000 Problems Solved on CodeChef', by: 'CodeChef, Problem Solver Diamond Badge', date: '',
    rows: [
      ['Achievement', 'Crossed 1000 solved problems on CodeChef (1300+ today) and earned the Diamond Problem Solver badge, after the 500-problem Golden Badge.'],
      ['Details', 'Consistent daily practice in competitive programming that sharpened algorithmic thinking, speed and code quality.'],
    ],
  },
  {
    id: 'coursera-daa-bits', cat: 'Courses & Coding', file: 'coursera-daa-bits.jpg', w: 1008, h: 780,
    title: 'Algorithm Design: Mastering Computational Problem Solving', by: 'BITS Pilani, Coursera', date: '17 March 2026',
    rows: [
      ['Course details', 'Algorithm design techniques such as divide and conquer, greedy methods and dynamic programming, with a focus on analysing correctness and efficiency.'],
    ],
  },
  {
    id: 'coursera-mlops-duke', cat: 'Courses & Coding', file: 'coursera-mlops-duke.jpg', w: 1400, h: 1082,
    title: 'Python Essentials for MLOps', by: 'Duke University, Coursera', date: '6 October 2026',
    rows: [
      ['Course details', 'Python for machine-learning operations: writing testable, maintainable code, working with data, and building the tooling around models that takes them from a notebook to production.'],
    ],
  },
  {
    id: 'ibm-python-ds-ai', cat: 'Courses & Coding', file: 'ibm-python-ds-ai.jpg', w: 802, h: 622,
    title: 'Python for Data Science, AI & Development', by: 'IBM, Coursera', date: '1 April 2026',
    rows: [
      ['Course details', 'Python for data work: data structures, pandas and NumPy, APIs and web scraping.'],
      ['Part of a series', 'One of 8 IBM data science courses I completed, alongside Data Science Methodology, Databases and SQL for Data Science, Data Analysis with Python and Data Visualization with Python.'],
    ],
  },
  {
    id: 'ieee-wie-secretary', cat: 'Leadership & Work', file: 'ieee-wie-secretary.jpg', w: 1400, h: 989,
    title: 'Secretary, IEEE CHARUSAT WIE Affinity Group', by: 'IEEE Certificate of Volunteering', date: 'March 2025 to July 2025',
    rows: [
      ['Recognition', 'Official IEEE certificate recognizing my service as Secretary of the Women in Engineering Affinity Group at CHARUSAT.'],
      ['What it involved', 'Helping plan and run WIE outreach and technical events, including the STEM outreach session with the NSS unit.'],
    ],
  },
  {
    id: 'hedera-hashgraph', cat: 'Courses & Coding', file: 'hedera-hashgraph.jpg', w: 1152, h: 646,
    title: 'Hashgraph Developer Course', by: 'The Hashgraph Association, built on Hedera', date: '12 December 2025',
    rows: [
      ['Course details', 'Distributed-ledger development on Hedera: accounts, tokens, the consensus service and smart contracts, a hands-on introduction to building on Web3.'],
    ],
  },
  {
    id: 'odoo-hackathon', cat: 'Hackathons', file: 'odoo-hackathon.jpg', w: 1600, h: 1200,
    title: 'Odoo x CHARUSAT Hackathon 2025', by: 'TaxMate project, my first hackathon', date: '2 March 2025 (24 hours)',
    rows: [
      ['My role', 'Part of the API & Integration team: connecting financial APIs and backend services, working with real-time data and contributing to the smart automation capabilities.'],
      ['Project', 'TaxMate is a smart tax assistant for freelancers and small business owners. It tracks income and expenses, suggests tax-saving tips and enables e-filing, integrating AI and banking APIs.'],
      ['Tech stack', 'React.js; Node.js, Express.js, PostgreSQL; Python (AI/ML); Kaggle APIs'],
    ],
  },
  {
    id: 'dhyan-chand-cup', cat: 'Sports', file: 'dhyan-chand-cup.jpg', w: 1240, h: 930,
    title: 'Major Dhyan Chand Cup: Basketball Champions', by: 'CHARUSAT, National Sports Day', date: '2024',
    rows: [
      ['My contribution', 'Represented my department, CSE - CSPIT, CHARUSAT, on the basketball team, showing teamwork, leadership and sportsmanship throughout the tournament.'],
      ['Achievement', 'Our team emerged as champions of the Major Dhyan Chand Cup.'],
      ['Details', 'Organized by CHARUSAT to celebrate National Sports Day, promoting fitness, team spirit and sports culture among students.'],
    ],
  },
].map((c) => ({ ...c, src: img(c.file) }));
