import React, { useCallback, useEffect, useState } from 'react';
import * as R from '../data/resume';
import { PROGRAMS, AIMS, BELIEF } from '../data/programs';
import { ABOUT, ABOUT_TITLE } from '../data/about';
import { CERTS, CERT_CATEGORIES } from '../data/certificates';
import { TABS } from '../components/Tabs';
import QuickView from '../components/QuickView';
import VisitorCount from '../components/VisitorCount';
import LoopVideo from '../components/LoopVideo';
import Lightbox from '../components/Lightbox';
import Doodle from '../components/Doodle';
import { BrandIcon } from '../components/BrandIcons';
import { useContactForm, honeypotProps } from '../lib/contactForm';
import './mobile.css';

// The phone / small-tablet layout (< 900px wide). Same content as the desktop "desk" site, read from the same
// data files, but laid out in normal document flow at real CSS pixels so everything is readable and tappable.

const COLOR = Object.fromEntries(TABS.map((t) => [t.id, t]));
const NAV = [['home', 'Home'], ['portfolio', 'Details'], ['programs', 'What I do'], ['about', 'About'], ['contact', 'Contact']];
const clean = (s) => String(s ?? '').replace(/\[\[.*?\]\]/g, '').replace(/\s{2,}/g, ' ').trim();
const Rich = ({ parts }) => parts.map(([t, hi], i) => (hi ? <b key={i}>{t}</b> : <React.Fragment key={i}>{t}</React.Fragment>));
const go = (id) => document.getElementById(`m-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/* ---------------------------------------------------------------- navigation */

function useActiveSection() {
  const [active, setActiveRaw] = useState('home');
  const lock = React.useRef(0);
  // a tapped tab lights up at once; scroll tracking pauses while the smooth scroll travels there
  const pick = useCallback((id) => { lock.current = Date.now() + 1200; setActiveRaw(id); go(id); }, []);
  const setActive = (id) => { if (Date.now() > lock.current) setActiveRaw(id); };
  useEffect(() => {
    const els = NAV.map(([id]) => document.getElementById(`m-${id}`)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id.slice(2));
    }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));
    // the last section is short, so it never reaches the middle band: at the very bottom, mark it active
    const atEnd = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) setActive(NAV[NAV.length - 1][0]);
    };
    window.addEventListener('scroll', atEnd, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', atEnd); };
  }, []);
  return [active, pick];
}

function TopBar({ active, pick, onQuick }) {
  return (
    <header className="m-bar">
      <div className="m-bar-row">
        <button type="button" className="m-brand" onClick={() => go('home')}>Urja Gajera</button>
        <button type="button" className="m-quick" onClick={onQuick} aria-haspopup="dialog">&#9201; 60-sec view</button>
      </div>
      <nav className="m-tabs" aria-label="Sections">
        {NAV.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => pick(id)}
            className={active === id ? 'is-active' : undefined}
            style={{ background: active === id ? COLOR[id].on : COLOR[id].off }}
            aria-current={active === id ? 'true' : undefined}
          >{label}</button>
        ))}
      </nav>
    </header>
  );
}

const SectionHead = ({ kicker, title, color }) => (
  <div className="m-head">
    <span className="m-kicker" style={{ background: color }}>{kicker}</span>
    <h2 className="m-h2">{title}</h2>
  </div>
);

/* ---------------------------------------------------------------- hero */

const P1 = 'I don’t just believe in words.'.split(' ');

function Hero({ onQuick }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => { i += 1; setShown(i); if (i >= P1.length) clearInterval(id); }, 170);
    return () => clearInterval(id);
  }, []);
  return (
    <section id="m-home" className="m-hero grain">
      <div className="m-topline">
        <a href={`mailto:${R.CONTACT.email}`}>{R.CONTACT.email}</a>
        <a href={R.RESUME_PDF} target="_blank" rel="noreferrer" download className="underline">resume &#8595;</a>
      </div>
      <h1 className="m-0">
        <img className="m-wordmark" src="/assets/urja_gajera_wordmark.png" alt="URJA GAJERA" width="1864" height="252" fetchPriority="high" draggable={false} />
      </h1>
      <p className="m-tagline">Build · Create · Explore</p>
      <p className="m-headline">{R.HEADLINE}</p>
      <div className="m-status">
        <button type="button" className="m-open" onClick={() => go('contact')}><i className="visitor-dot" aria-hidden="true" />{R.AVAILABILITY} &rarr;</button>
        <VisitorCount />
      </div>
      <ul className="m-pills" aria-label="Highlights">
        {R.IMPACT.map(([v, , s], i) => <li key={s} className="impact-pill" style={{ animationDelay: `${200 + i * 90}ms` }}><b>{v}</b>{s}</li>)}
      </ul>
      <p className="m-motto">
        {P1.map((w, i) => <span key={i} style={{ color: i < shown ? '#161616' : '#c9c9cf', transition: 'color .35s' }}>{w} </span>)}
        <br />I believe in words that are <span className="m-hl">followed by action</span>.
      </p>
      <div className="m-cta">
        <button type="button" className="m-btn m-btn-dark" onClick={onQuick}>&#9201; 60-second view</button>
        <a className="m-btn" href={R.RESUME_PDF} target="_blank" rel="noreferrer" download>Download resume &#8595;</a>
      </div>
      <div className="m-play" aria-label="Stickers you can drag">
        <Doodle n="rocket" x={6} y={10} w={78} r={-10} hint="fly me" />
        <Doodle n="cat" x={120} y={22} w={70} r={-4} />
        <Doodle n="compass" x={220} y={8} w={64} r={-8} hint="move me" />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- shared bits for the folders */

const Metrics = ({ items }) => (items?.length ? (
  <div className="m-metrics">
    {items.filter(([v]) => clean(v)).map(([v, l]) => <div key={l}><b>{clean(v)}</b><span>{l}</span></div>)}
  </div>
) : null);

const List = ({ items }) => (
  <ul className="m-list">{items.map(clean).filter(Boolean).map((t) => <li key={t}>{t}</li>)}</ul>
);

function Thumbs({ items, open }) {
  const list = (items || []).filter((it) => !it.ph);
  if (!list.length) return null;
  return (
    <div className="m-thumbs">
      {list.map((it, i) => (
        <button key={it.src} type="button" onClick={() => open(list, i)}>
          <img src={it.src} alt={it.caption} loading="lazy" style={{ objectFit: it.src.includes('/certs/') ? 'contain' : 'cover' }} />
          <span>{it.caption}</span>
        </button>
      ))}
    </div>
  );
}

const Links = ({ repo, live }) => ((repo || live) ? (
  <div className="m-links">
    {live && !/^\[\[/.test(live) && <a className="m-btn m-btn-dark" href={live} target="_blank" rel="noreferrer">Live demo &#8599;</a>}
    {repo && <a className="m-btn" href={repo} target="_blank" rel="noreferrer">GitHub &#8599;</a>}
  </div>
) : null);

const Tech = ({ t }) => <p className="m-tech"><b>Tech:</b> {t}</p>;

/* ---------------------------------------------------------------- the ten folders */

function Projects({ open }) {
  return R.PROJECTS.map((p, i) => (
    <article key={p.name} className="m-project">
      <div className="m-muted">0{i + 1} / 0{R.PROJECTS.length}</div>
      <h4 className="m-h4">{p.name}</h4>
      <div className="m-sub">{p.subtitle}</div>
      <div className="m-muted m-italic">{clean(p.badge)} | {clean(p.meta)}</div>
      <Links repo={p.repo} live={p.live} />
      {p.video && <LoopVideo {...p.video} style={{ margin: '12px 0 4px' }} />}
      {p.paras?.map((t) => <p key={t.slice(0, 20)} className="m-p">{t}</p>)}
      {p.role && <p className="m-p"><b>My role:</b> {p.role}</p>}
      {p.points && <List items={p.points} />}
      <Metrics items={p.metrics} />
      {p.diagram && <Thumbs items={[p.diagram]} open={open} />}
      <Thumbs items={p.shots} open={open} />
      <Tech t={p.tech} />
      {p.achievement && <p className="m-p"><b>Achievement:</b> {p.achievement}</p>}
    </article>
  ));
}

function Internship({ open }) {
  const i = R.INTERNSHIP;
  return (
    <>
      <h4 className="m-h4">{i.role}</h4>
      <div className="m-sub">{i.company}</div>
      <div className="m-muted">{i.period}</div>
      <p className="m-p m-italic">{i.project}</p>
      <Links repo={i.repo} />
      <Metrics items={i.stats} />
      <List items={i.points} />
      <Thumbs items={i.shots} open={open} />
      <Tech t={i.tech} />
    </>
  );
}

function Education() {
  const e = R.EDUCATION;
  return (
    <>
      <h4 className="m-h4">{e.degree}</h4>
      <div className="m-muted">{e.period}</div>
      <p className="m-p">{e.school}</p>
      <dl className="m-dl"><dt>CGPA</dt><dd>{e.cgpa}</dd></dl>
    </>
  );
}

const Skills = () => <dl className="m-dl">{R.SKILLS.map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>;

function Leadership({ open }) {
  return (
    <>
      {R.LEADERSHIP.map((l) => (
        <div key={l.role} className="m-block">
          <h4 className="m-h4">{l.role}</h4>
          <div className="m-muted">{l.period}</div>
          <List items={l.points} />
        </div>
      ))}
      <Thumbs items={R.LEADERSHIP_MEDIA} open={open} />
    </>
  );
}

function Hackathons({ open }) {
  return (
    <>
      <Metrics items={R.HACKATHON_STATS} />
      {R.HACKATHONS.map((h) => (
        <div key={h.name} className="m-hack">
          <div className="m-hack-top"><h4 className="m-h4">{h.name}</h4>{h.result && <span className="m-badge">{clean(h.result)}</span>}</div>
          {h.by && <div className="m-muted">{h.by}</div>}
          {h.project && <p className="m-p"><b>Project:</b> {h.project}</p>}
          {h.role && <p className="m-p"><b>My role:</b> {h.role}</p>}
          {h.stack && <p className="m-p"><b>Stack:</b> {h.stack}</p>}
          <Thumbs items={h.media} open={open} />
        </div>
      ))}
    </>
  );
}

function Achievements({ open }) {
  const imgs = R.ACHIEVEMENTS.map((a) => a.img);
  return (
    <>
      <Metrics items={R.CODING_PROFILES} />
      {R.ACHIEVEMENTS.map((a, i) => (
        <button key={a.text} type="button" className="m-achieve" onClick={() => open(imgs, i)}>
          <img src={a.img.src} alt={a.img.caption} loading="lazy" />
          <span>{a.text}</span>
        </button>
      ))}
    </>
  );
}

function Certificates({ open }) {
  const [cat, setCat] = useState('All');
  const [sel, setSel] = useState(null);
  const list = CERTS.filter((c) => cat === 'All' || c.cat === cat);
  return (
    <>
      <div className="m-chips">
        {['All', ...CERT_CATEGORIES].map((c) => (
          <button key={c} type="button" className={cat === c ? 'is-on' : undefined} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="m-certs">
        {list.map((c) => (
          <button key={c.id} type="button" className="m-cert" onClick={() => setSel(c)}>
            <img src={c.src} alt={c.title} loading="lazy" />
            <b>{c.title}</b>
            <span>{c.date || c.cat}</span>
          </button>
        ))}
      </div>
      {sel && (
        <div className="m-sheet-bg" onClick={() => setSel(null)}>
          <div className="m-sheet" role="dialog" aria-modal="true" aria-label={sel.title} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="m-sheet-x" aria-label="Close" onClick={() => setSel(null)}>&times;</button>
            <button type="button" className="m-sheet-img" onClick={() => open([{ src: sel.src, caption: sel.title }], 0)}>
              <img src={sel.src} alt={sel.title} />
            </button>
            <div className="m-muted m-upper">{sel.cat}</div>
            <h4 className="m-h4">{sel.title}</h4>
            <div className="m-muted">{sel.by}{sel.date ? ` · ${sel.date}` : ''}</div>
            {sel.rows.map(([k, v]) => <p key={k} className="m-p"><b>{k}:</b> {v}</p>)}
          </div>
        </div>
      )}
    </>
  );
}

const Additional = () => <dl className="m-dl">{R.ADDITIONAL.map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>;

function SummaryContact() {
  const L = R.LINKS;
  const [chart, setChart] = useState(true);
  return (
    <>
      <p className="m-p">{R.SUMMARY}</p>
      <a className="m-btn m-btn-dark" href={R.RESUME_PDF} target="_blank" rel="noreferrer" download>Download resume (PDF) &#8595;</a>
      <ContactLinks />
      {chart && (
        <a className="m-chart" href={L.github} target="_blank" rel="noreferrer">
          <img src={`https://ghchart.rshah.org/c39bf8/${L.githubUser}`} alt="GitHub contribution chart" loading="lazy" onError={() => setChart(false)} />
          <span>GitHub contributions, last 12 months &#8599;</span>
        </a>
      )}
    </>
  );
}

function ContactLinks({ dark }) {
  const L = R.LINKS;
  const items = [
    ['Email', R.CONTACT.email, `mailto:${R.CONTACT.email}`],
    ['Phone', R.CONTACT.phone, `tel:${R.CONTACT.phone.replace(/\s/g, '')}`],
    ['LinkedIn', 'urja-gajera', L.linkedin],
    ['GitHub', L.githubUser, L.github],
    ['CodeChef', 'urja07', L.codechef],
    ['Codolio', L.codolioUser, L.codolio],
  ];
  return (
    <div className={`m-contacts ${dark ? 'is-dark' : ''}`}>
      {items.map(([name, handle, href], i) => (
        <a key={name} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={dark ? undefined : { background: TABS[i % TABS.length].off }}>
          <BrandIcon name={name} size={name === 'Codolio' ? 26 : 20} color={dark ? '#fff' : '#111'} />
          <span><b>{name}</b><small>{handle}</small></span>
        </a>
      ))}
    </div>
  );
}

const FOLDER_VIEWS = {
  'r-projects': Projects, 'r-internship': Internship, 'r-education': Education, 'r-skills': Skills,
  'r-leadership': Leadership, 'r-hackathons': Hackathons, 'r-achievements': Achievements,
  'r-certificates': Certificates, 'r-additional': Additional, 'r-contact': SummaryContact,
};
const FOLDER_COLORS = ['#86aaaa', '#7fb48a', '#8a5f8f', '#9a9a62'];

function Details({ open }) {
  const [sel, setSel] = useState('r-projects');
  const toggle = (id) => {
    setSel((s) => (s === id ? null : id));
    requestAnimationFrame(() => document.getElementById(`m-f-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  return (
    <section id="m-portfolio" className="m-section m-desk">
      <SectionHead kicker="Details" title="Portfolio > Browse" color={COLOR.portfolio.on} />
      <p className="m-lead">Everything on my resume, with the proof behind it. Tap a folder to open it.</p>
      <div className="m-monitor">
        <div className="m-titlebar"><span /><i /><i /><i /></div>
        {R.FOLDERS.map((f, i) => {
          const View = FOLDER_VIEWS[f.id];
          const isOpen = sel === f.id;
          return (
            <div key={f.id} id={`m-f-${f.id}`} className="m-folder">
              <button type="button" className="m-folder-btn" aria-expanded={isOpen} onClick={() => toggle(f.id)}>
                <svg width="30" height="26" viewBox="0 0 40 34" aria-hidden="true"><path d="M1 4a2 2 0 0 1 2-2h9l3 4h22v26H1z" fill={FOLDER_COLORS[i % 4]} stroke="#222" strokeWidth="1.2" /></svg>
                <span>{f.label}</span>
                <b aria-hidden="true">{isOpen ? '−' : '+'}</b>
              </button>
              {isOpen && View && <div className="m-folder-body fade-in"><View open={open} /></div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- what I do */

function WhatIDo() {
  const fills = TABS.slice(0, 4).map((t) => t.on);
  return (
    <section id="m-programs" className="m-section">
      <SectionHead kicker="What I do" title="What I believe" color={COLOR.programs.on} />
      <p className="m-belief">I don’t just believe in words. I believe in words that are <span className="m-hl">followed by action</span>.</p>
      <p className="m-p">{BELIEF}</p>
      <h3 className="m-h3">What I aim for</h3>
      <ul className="m-aims">{AIMS.map(([parts], i) => <li key={i}><Rich parts={parts} /></li>)}</ul>
      <h3 className="m-h3">4 things that shape how I think, learn and build</h3>
      {PROGRAMS.map((p, i) => (
        <article key={p.id} className="m-program grain" style={{ background: fills[i] }}>
          <div className="m-program-tab">0{i + 1}</div>
          <h4 className="m-program-title">{p.title}</h4>
          <p className="m-italic">{p.tag}</p>
          <div className="m-tags">{p.chips.map(([c]) => <span key={c}>{c}</span>)}</div>
          <p className="m-p">{p.intro}</p>
          <div className="m-label">Where this helps</div>
          <ul className="m-list">{p.challenges.slice(0, 4).map((c, k) => <li key={k}><Rich parts={c} /></li>)}</ul>
          <div className="m-label">What I build</div>
          <ul className="m-list">{p.features.slice(0, 4).map((f) => <li key={f}>{f}</li>)}</ul>
          <p className="m-p m-small"><Rich parts={p.research} /></p>
          <div className="m-goals">{p.goals.map((g) => <span key={g}>{g}</span>)}</div>
        </article>
      ))}
    </section>
  );
}

/* ---------------------------------------------------------------- about + contact + footer */

function About() {
  return (
    <section id="m-about" className="m-section">
      <SectionHead kicker="About" title={ABOUT_TITLE} color={COLOR.about.on} />
      {ABOUT.map((t, i) => <p key={t.slice(0, 24)} className={`m-p ${i === 0 ? 'm-p-lead' : ''}`}>{t}</p>)}
      <div className="m-play" aria-label="Stickers you can drag">
        <Doodle n="headphones" x={10} y={10} w={74} r={-6} hint="drag me" />
        <Doodle n="book" x={130} y={20} w={70} r={5} />
        <Doodle n="bulb" x={235} y={12} w={60} r={4} />
      </div>
    </section>
  );
}

function Contact() {
  const { f, set, status, submit, mailto, btnText } = useContactForm();
  return (
    <section id="m-contact" className="m-section">
      <SectionHead kicker="Contact" title="Let’s talk" color={COLOR.contact.on} />
      <form className="m-form grain" onSubmit={submit}>
        <input {...honeypotProps} />
        <p className="m-p">Have an internship, a project or a question? Send a message and it lands straight in my inbox.</p>
        <label htmlFor="m-cf-name">name *</label>
        <input id="m-cf-name" name="name" required autoComplete="name" value={f.name} onChange={set('name')} placeholder="Your name" />
        <label htmlFor="m-cf-email">email *</label>
        <input id="m-cf-email" name="email" type="email" required autoComplete="email" value={f.email} onChange={set('email')} placeholder="you@company.com" />
        <label htmlFor="m-cf-phone">phone</label>
        <input id="m-cf-phone" name="phone" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} placeholder="optional" />
        <label htmlFor="m-cf-msg">message *</label>
        <textarea id="m-cf-msg" name="message" required rows={5} value={f.message} onChange={set('message')} placeholder="Hi Urja, we have an internship opening..." />
        <button type="submit" className="m-submit" disabled={status === 'sending'} style={{ background: status === 'sent' ? '#2f7d4f' : '#141414' }}>{btnText}</button>
        <div role="status" aria-live="polite" className="m-form-status">
          {status === 'sent' && 'Thanks! Your message reached my inbox. I’ll reply soon.'}
          {status === 'error' && <>Couldn’t send right now. <a href={mailto} className="underline">Email it instead</a>.</>}
        </div>
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="m-footer grain">
      <div className="m-footer-words">Build<br />Create<br />Explore</div>
      <ContactLinks dark />
      <div className="m-footer-copy">All rights reserved | Urja Gajera 2026</div>
      <div className="m-footer-credit">
        Desk oak photo: <a href="https://commons.wikimedia.org/wiki/File:Oak_Texture_-_5106733699_c1d5b0df29_b.jpg" target="_blank" rel="noreferrer" className="underline">William Warby</a>, CC BY 2.0 · shelf plant photo: <a href="https://commons.wikimedia.org/wiki/File:Aspidistra_01_(fcm).jpg" target="_blank" rel="noreferrer" className="underline">Frank C. Müller</a>, CC BY-SA 2.0
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- page */

export default function MobileSite() {
  const [active, pick] = useActiveSection();
  const [quick, setQuick] = useState(() => window.location.hash === '#60s');
  const [lb, setLb] = useState(null);
  const openQuick = () => { setQuick(true); try { history.replaceState(null, '', '#60s'); } catch { /* ignore */ } };
  const closeQuick = useCallback(() => {
    setQuick(false);
    try { if (window.location.hash === '#60s') history.replaceState(null, '', window.location.pathname + window.location.search); } catch { /* ignore */ }
  }, []);
  const open = useCallback((list, i) => setLb({ list, i }), []);

  return (
    <div className="m-site">
      <TopBar active={active} pick={pick} onQuick={openQuick} />
      <main>
        <Hero onQuick={openQuick} />
        <Details open={open} />
        <WhatIDo />
        <About />
        <Contact />
      </main>
      <Footer />
      <QuickView open={quick} onClose={closeQuick} />
      {lb && <Lightbox list={lb.list} i={lb.i} onClose={() => setLb(null)} onGo={(i) => setLb((s) => ({ ...s, i }))} />}
    </div>
  );
}
