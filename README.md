# Urja Gajera · Portfolio

Personal portfolio of **Urja Gajera**, B.Tech CSE student at CHARUSAT: full-stack and AI developer, open to internships.

**Live:** https://urjagajera.vercel.app/ · **60-second summary:** add `#60s` to the link

## What's inside

- **A desk you scroll into.** The page zooms into a vintage computer; its "Portfolio > Browse" window holds projects, internship, education, skills, leadership, hackathons, achievements and a draggable certificate canvas.
- **Recruiter shortcuts.** An impact strip under the name, an "Open to internships" button and a one-screen 60-second view.
- **A real mobile layout.** Below 900px the site switches to a flow layout built for phones, read from the same data files.
- **Small touches.** Draggable hand-drawn stickers, a live wall clock, a looping demo clip of Nirman at CHAOS2COMMIT 2026, a visitor counter and a working contact form.

## Tech

React 19 · Vite 6 · Tailwind CSS 3 · plain CSS animations · deployed on Vercel.
Visitor counter: [Abacus](https://abacus.jasoncameron.dev). Contact form: [FormSubmit](https://formsubmit.co).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Editing content

All text lives in `src/data/`:

| File | Content |
| --- | --- |
| `resume.js` | Projects, internship, education, skills, leadership, hackathons, achievements, impact numbers, links |
| `certificates.js` | Certificates shown on the canvas |
| `programs.js` | The four "What I do" cards |
| `about.js` | About-me paragraphs |

Both the desktop and mobile layouts read from these files, so one edit updates both.
