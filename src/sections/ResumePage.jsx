import React, { createContext, useContext, useState } from 'react';
import * as R from '../data/resume';
import Lightbox, { LightboxHost } from '../components/Lightbox';
import { BrandIcon } from '../components/BrandIcons';
import { TABS } from '../components/Tabs';
import LoopVideo from '../components/LoopVideo';
import Playground from '../components/Playground';

// theme colours (the side tabs): strong `on` + soft `off`
const THEME = Object.fromEntries(TABS.map((t) => [t.id, { on: t.on, off: t.off }]));
const PINK = THEME.programs, YELLOW = THEME.portfolio, BLUE = THEME.contact, PURPLE = THEME.home, CYAN = THEME.about;

/* ---------------------------------------------------------------- sample-content helpers */

// "[[...]]" in resume.js marks sample text. While MARK_PLACEHOLDERS is on it shows with a dashed yellow highlight.
const isPh = (s) => typeof s === 'string' && /^\[\[.*\]\]$/.test(s.trim());
const clean = (s) => (typeof s === 'string' ? s.replace(/\[\[|\]\]/g, '') : s);
const Mark = ({ children }) => (R.MARK_PLACEHOLDERS ? (
  <span
    title="Sample content: replace with your real info"
    style={{ background: '#fff4b8', outline: '1.5px dashed #c99a1a', outlineOffset: 1, borderRadius: 3, padding: '0 3px' }}
  >{children}</span>
) : children);
// with marks off, sample parts are dropped so a visitor never sees draft text presented as fact
function T({ s }) {
  if (s == null) return null;
  return String(s).split(/(\[\[.+?\]\])/g).map((part, i) => (
    part.startsWith('[[')
      ? (R.MARK_PLACEHOLDERS ? <Mark key={i}>{clean(part)}</Mark> : null)
      : <React.Fragment key={i}>{part}</React.Fragment>
  ));
}
// drop sample entries (whole-string placeholders, sample images) unless marks are on
const real = (s) => s != null && s !== '' && (R.MARK_PLACEHOLDERS || !isPh(s));
const realItems = (items) => (items || []).filter((it) => R.MARK_PLACEHOLDERS || !(it.ph || isPh(it.caption)));
const SampleTag = ({ children = 'sample' }) => (R.MARK_PLACEHOLDERS ? (
  <span style={{ background: '#fde97a', color: '#5a4300', border: '1.5px dashed #c99a1a', borderRadius: 4, padding: '1px 8px', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{children}</span>
) : null);

/* ---------------------------------------------------------------- building blocks */

const OpenCtx = createContext(() => {});

const H1 = ({ children }) => (
  <h1 className="font-display m-0" style={{ fontSize: 64, lineHeight: '68px', fontWeight: 800, letterSpacing: '-.02em', textTransform: 'uppercase' }}>{children}</h1>
);
const H3 = ({ children, style }) => (
  <h3 className="font-display m-0" style={{ fontSize: 27, fontWeight: 800, lineHeight: '32px', marginBottom: 8, ...style }}>{children}</h3>
);
const P = ({ children, style }) => (
  <p style={{ fontSize: 20, lineHeight: '30px', margin: '0 0 20px', color: '#222', ...style }}>{children}</p>
);
const Label = ({ children, style }) => (
  <div className="font-mono" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555', margin: '30px 0 12px', ...style }}>{children}</div>
);
const List = ({ items }) => (
  <ul className="list-none p-0 m-0">
    {items.filter(real).map((t) => (
      <li key={t} style={{ fontSize: 20, lineHeight: '30px', marginBottom: 10, paddingLeft: 26, textIndent: -26 }}>-&nbsp;&nbsp; <T s={t} /></li>
    ))}
  </ul>
);
const Link = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{ color: '#111', textDecoration: 'underline' }}>{children}</a>
);
const Row = ({ k, v }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', columnGap: 30, padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,.25)', fontSize: 20, lineHeight: '30px' }}>
    <span style={{ fontWeight: 600 }}><T s={k} /></span>
    <span>{typeof v === 'string' ? <T s={v} /> : v}</span>
  </div>
);
const Head = ({ title, sub }) => (
  <div style={{ marginBottom: 44 }}>
    <H1>{title}</H1>
    {sub && <div style={{ fontSize: 22, marginTop: 14 }}>://&gt; {sub}</div>}
  </div>
);
const Tech = ({ t }) => (
  <div style={{ border: '1px solid #222', padding: '14px 20px', fontSize: 18, lineHeight: '28px', margin: '26px 0 20px' }}>
    <b>Technologies:</b> <T s={t} />
  </div>
);

// "Live demo ↗" / "GitHub ↗" pills. A sample link shows as a dashed pill that goes nowhere (hidden once marks are off).
function LinkBtn({ href, children, dark }) {
  if (!href) return null;
  const base = { display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', borderRadius: 22, fontSize: 17, textDecoration: 'none', border: '1.5px solid #222' };
  if (isPh(href)) {
    if (!R.MARK_PLACEHOLDERS) return null;
    return <span title="Sample link: add your real URL" style={{ ...base, background: '#fff4b8', borderStyle: 'dashed', borderColor: '#c99a1a', color: '#5a4300', cursor: 'not-allowed' }}>{children} &#8599;</span>;
  }
  return <a href={href} target="_blank" rel="noreferrer" style={{ ...base, background: dark ? '#111' : 'transparent', color: dark ? '#fff' : '#111' }}>{children} &#8599;</a>;
}
const Links = ({ live, repo }) => ((live || repo) ? (
  <div className="flex flex-wrap" style={{ gap: 12, margin: '4px 0 26px' }}>
    <LinkBtn href={live} dark>Live demo</LinkBtn>
    <LinkBtn href={repo}>GitHub</LinkBtn>
  </div>
) : null);

function Metrics({ items: all }) {
  const items = (all || []).filter(([v]) => real(v));
  if (!items.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 12, margin: '24px 0 6px' }}>
      {items.map(([v, l]) => (
        <div key={l} style={{ border: '1.5px solid #222', borderRadius: 10, padding: '14px 16px 12px', background: '#fafaf8' }}>
          <div className="font-display" style={{ fontSize: 32, lineHeight: '36px', fontWeight: 800 }}><T s={v} /></div>
          <div style={{ fontSize: 15, lineHeight: '20px', color: '#555', marginTop: 4 }}><T s={l} /></div>
        </div>
      ))}
    </div>
  );
}

// thumbnails that open in the viewer; certificates are shown whole, screenshots/photos fill the frame
function Gallery({ items: all, cols = 3 }) {
  const open = useContext(OpenCtx);
  const items = realItems(all);
  if (!items.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, marginTop: 14 }}>
      {items.map((it, i) => {
        const sample = it.ph && R.MARK_PLACEHOLDERS;
        const whole = it.src.includes('/certs/');
        return (
          <button key={it.src + i} onClick={() => open(items, i)} className="resume-thumb text-left" style={{ padding: 0, border: 0, background: 'transparent', position: 'relative' }}>
            <div style={{ aspectRatio: '16 / 10', overflow: 'hidden', borderRadius: 8, border: sample ? '2px dashed #c99a1a' : '1.5px solid #222', background: '#f1ede4' }}>
              <img src={it.src} alt={it.caption} loading="lazy" draggable={false} style={{ width: '100%', height: '100%', objectFit: whole ? 'contain' : 'cover', display: 'block' }} />
            </div>
            <div style={{ fontSize: 15, lineHeight: '20px', color: '#444', marginTop: 8 }}>{it.caption}</div>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- pages */

function Projects() {
  const open = useContext(OpenCtx);
  const list = R.PROJECTS.filter((p) => !p.sample || R.MARK_PLACEHOLDERS);
  return (
    <>
      <Head title="Projects" sub={list.map((p) => clean(p.name)).join(' | ')} />
      {list.map((p, i) => (
        <div key={p.name} style={{ paddingTop: i ? 56 : 0, marginTop: i ? 56 : 0, borderTop: i ? '1.5px solid #222' : 'none' }}>
          <div className="flex items-center" style={{ fontSize: 18, color: '#555', gap: 12 }}>
            0{i + 1} / 0{list.length} {p.sample && <SampleTag>sample project</SampleTag>}
          </div>
          <H3 style={{ fontSize: 40, lineHeight: '46px' }}><T s={p.name} /></H3>
          <div style={{ fontSize: 24, marginBottom: 6 }}><T s={p.subtitle} /></div>
          <div className="italic" style={{ fontSize: 19, marginBottom: 18 }}><T s={p.badge} /> | <T s={p.meta} /></div>
          <Links live={p.live} repo={p.repo} />
          {p.video && <LoopVideo {...p.video} style={{ margin: '6px 0 26px' }} />}
          {p.videos && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 22, margin: '6px 0 26px' }}>
              {p.videos.map((v) => (
                <div key={v.src}>
                  <Label style={{ margin: '0 0 8px' }}>{v.label}</Label>
                  <LoopVideo {...v} />
                </div>
              ))}
            </div>
          )}
          {p.paras && p.paras.map((t) => <P key={t}><T s={t} /></P>)}
          {p.role && <P><b>My role:</b> <T s={p.role} /></P>}
          {p.points && <List items={p.points} />}
          <Metrics items={p.metrics} />
          {p.diagram && (
            <>
              <Label>{p.diagram.caption}</Label>
              <button onClick={() => open([p.diagram], 0)} className="resume-thumb" style={{ padding: 0, border: 0, background: 'transparent', width: '100%', display: 'block' }}>
                <img src={p.diagram.src} alt={p.diagram.caption} draggable={false} style={{ width: '100%', display: 'block', borderRadius: 10, border: '1.5px solid #222' }} />
              </button>
            </>
          )}
          {realItems(p.shots).length > 0 && <><Label>Screenshots</Label><Gallery items={p.shots} /></>}
          <Tech t={p.tech} />
          {p.achievement && <P><b>Achievement:</b> {p.achievement}</P>}
        </div>
      ))}
    </>
  );
}

function Internship() {
  const i = R.INTERNSHIP;
  return (
    <>
      <Head title="Internship" sub="Software Development" />
      <H3>{i.role} - {i.company}</H3>
      <P style={{ margin: '0 0 6px' }}>{i.period}</P>
      <P style={{ fontStyle: 'italic', marginBottom: 10 }}>{i.project}</P>
      <Links repo={i.repo} />
      <Metrics items={i.stats} />
      <Label>What I did</Label>
      <List items={i.points} />
      {real(i.learned) && <P style={{ marginTop: 14 }}><b>What I learned:</b> <T s={i.learned} /></P>}
      {realItems(i.shots).length > 0 && <><Label>Proof</Label><Gallery items={i.shots} cols={2} /></>}
      {i.quote && real(i.quote.text) && (
        <blockquote style={{ margin: '34px 0 0', padding: '22px 28px', borderLeft: '5px solid #111', background: '#f4f1ea', borderRadius: '0 10px 10px 0' }}>
          <div style={{ fontSize: 22, lineHeight: '32px', fontStyle: 'italic' }}>&ldquo;<T s={i.quote.text} />&rdquo;</div>
          <div style={{ fontSize: 16, color: '#555', marginTop: 10 }}>- <T s={i.quote.by} /></div>
        </blockquote>
      )}
      <Tech t={i.tech} />
    </>
  );
}

function Education() {
  const e = R.EDUCATION;
  return (
    <>
      <Head title="Education" sub="Computer Science and Engineering" />
      <H3>{e.degree}</H3>
      <P style={{ margin: '0 0 6px' }}>{e.period}</P>
      <P style={{ marginBottom: 36 }}>{e.school}</P>
      <Row k="CGPA" v={e.cgpa} />
      {e.latest && <Row k={e.latest[0]} v={e.latest[1]} />}
      {real(e.coursework) && <Row k="Relevant coursework" v={e.coursework} />}
    </>
  );
}

function Skills() {
  return (
    <>
      <Head title="Technical Skills" />
      {R.SKILLS.map(([k, v]) => <Row key={k} k={k} v={v} />)}
    </>
  );
}

function Leadership() {
  return (
    <>
      <Head title="Leadership" sub="IEEE CHARUSAT" />
      {R.LEADERSHIP.map((l, i) => (
        <div key={l.role} style={{ marginTop: i ? 40 : 0 }}>
          <H3>{l.role}</H3>
          <P style={{ margin: '0 0 14px', color: '#555' }}>{l.period}</P>
          <List items={l.points} />
        </div>
      ))}
      <Label style={{ marginTop: 40 }}>On stage: presenting to the judges</Label>
      <LoopVideo {...R.LEADERSHIP_VIDEO} />
      <Label style={{ marginTop: 40 }}>Hosting: IEEE General Body Meeting</Label>
      <LoopVideo {...R.LEADERSHIP_EVENT_VIDEO} style={{ maxWidth: 400 }} />
      <Label style={{ marginTop: 40 }}>Events & certificates</Label>
      <Gallery items={R.LEADERSHIP_MEDIA} />
    </>
  );
}

function Hackathons() {
  return (
    <>
      <Head title="Hackathons & Participations" />
      <Metrics items={R.HACKATHON_STATS} />
      <div style={{ marginTop: 30 }}>
        {R.HACKATHONS.map((h) => (
          <div key={h.name} style={{ border: '1.5px solid #222', borderRadius: 12, padding: '22px 26px', marginBottom: 20, background: '#fff' }}>
            <div className="flex items-baseline justify-between flex-wrap" style={{ gap: 10 }}>
              <H3 style={{ marginBottom: 2 }}>{h.name}</H3>
              {h.result && (
                <span style={{ fontSize: 16, fontWeight: 700, padding: '4px 14px', borderRadius: 16, background: isPh(h.result) ? 'transparent' : '#111', color: isPh(h.result) ? '#111' : '#fff', border: '1.5px solid #111' }}>
                  <T s={h.result} />
                </span>
              )}
            </div>
            {h.by && <div style={{ fontSize: 17, color: '#555', marginBottom: 10 }}>{h.by}</div>}
            {(h.project || h.role || h.stack) && (
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: 6, fontSize: 19, lineHeight: '28px', marginTop: 8 }}>
                {h.project && <><b>Project</b><span><T s={h.project} /></span></>}
                {h.role && <><b>My role</b><span><T s={h.role} /></span></>}
                {h.stack && <><b>Stack</b><span>{h.stack}</span></>}
              </div>
            )}
            {h.media && <Gallery items={h.media} cols={4} />}
          </div>
        ))}
      </div>
    </>
  );
}

function Achievements() {
  const open = useContext(OpenCtx);
  const imgs = R.ACHIEVEMENTS.map((a) => a.img);
  return (
    <>
      <Head title="Achievements" />
      <Label style={{ marginTop: 0 }}>Coding profile</Label>
      <Metrics items={R.CODING_PROFILES} />
      <div style={{ marginTop: 34 }}>
        {R.ACHIEVEMENTS.map((a, i) => {
          const sample = a.img.ph && R.MARK_PLACEHOLDERS;
          return (
            <div key={a.text} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 24, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,.2)' }}>
              <button onClick={() => open(imgs, i)} className="resume-thumb" style={{ padding: 0, border: 0, background: 'transparent' }}>
                <div style={{ aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 8, border: sample ? '2px dashed #c99a1a' : '1.5px solid #222', background: '#f1ede4' }}>
                  <img src={a.img.src} alt={a.img.caption} loading="lazy" draggable={false} style={{ width: '100%', height: '100%', objectFit: a.img.src.includes('/certs/') ? 'contain' : 'cover', display: 'block' }} />
                </div>
              </button>
              <div style={{ fontSize: 20, lineHeight: '30px' }}><T s={a.text} /></div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function PlaygroundPage() {
  return (
    <>
      <Head title="Playground" />
      <Playground />
    </>
  );
}

function Additional() {
  return (
    <>
      <Head title="Additional Information" />
      {R.ADDITIONAL.map(([k, v]) => <Row key={k} k={k} v={v} />)}
    </>
  );
}


// one button per profile: brand logo + name + handle, opening the exact page
function ContactButtons() {
  const L = R.LINKS;
  const items = [
    ['Email', 'Email', R.CONTACT.email, `mailto:${R.CONTACT.email}`, PINK],
    ['Phone', 'Phone', R.CONTACT.phone, `tel:${R.CONTACT.phone.replace(/\s/g, '')}`, YELLOW],
    ['LinkedIn', 'LinkedIn', 'urja-gajera', L.linkedin, BLUE],
    ['GitHub', 'GitHub', L.githubUser, L.github, PURPLE],
    ['CodeChef', 'CodeChef', 'urja07', L.codechef, CYAN],
    ['Codolio', 'Codolio', L.codolioUser, L.codolio, PINK],
  ];
  return (
    // each button: 15% narrower than a full third of the row, 10% taller than before (58 → 64)
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, calc((100% - 28px) / 3 * 0.85))', gap: 14, justifyContent: 'center', margin: '8px 0 14px' }}>
      {items.map(([icon, name, handle, href, c]) => (
        <a
          key={name}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="contact-btn"
          title={`${name}: ${handle}`}
          style={{ display: 'flex', alignItems: 'center', gap: 12, height: 64, padding: '0 22px', border: '1.5px solid #222', borderRadius: 32, background: c.on, color: '#111', textDecoration: 'none', minWidth: 0 }}
        >
          <BrandIcon name={icon} size={icon === 'Codolio' ? 32 : 24} color="#111" />
          <span style={{ flex: 1, fontSize: 19, fontWeight: 700, whiteSpace: 'nowrap' }}>{name}</span>
          <span style={{ fontSize: 18 }}>&#8599;</span>
        </a>
      ))}
    </div>
  );
}

function Contact() {
  const L = R.LINKS;
  const [chart, setChart] = useState(true);
  return (
    <>
      <Head title="Urja Gajera" sub="Summary & Contact" />
      <H3>Summary</H3>
      <P style={{ marginBottom: 26 }}>{R.SUMMARY}</P>
      <div className="flex items-center flex-wrap" style={{ gap: 14, marginBottom: 34 }}>
        <a href={R.RESUME_PDF} target="_blank" rel="noreferrer" download style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 56, padding: '0 28px', borderRadius: 28, background: '#111', color: '#fff', fontSize: 19, textDecoration: 'none', boxShadow: '4px 4px 0 #f4717f' }}>
          Download resume (PDF) &#8595;
        </a>
        <SampleTag>sample PDF for now</SampleTag>
      </div>
      <ContactButtons />
      {chart && (
        <>
          <Label style={{ marginTop: 40 }}>GitHub activity (live)</Label>
          <a href={L.github} target="_blank" rel="noreferrer" style={{ display: 'block', border: '1.5px solid #222', borderRadius: 10, padding: 18, background: '#fff' }}>
            <img src={`https://ghchart.rshah.org/c39bf8/${L.githubUser}`} alt="GitHub contribution chart" onError={() => setChart(false)} style={{ width: '100%', display: 'block' }} />
          </a>
          <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}>
            <div style={{ fontSize: 15, color: '#555', marginTop: 8 }}>Contributions in the last year, loaded live from GitHub.</div>
            <ProfileBtn href={L.github} c={PURPLE}>View on GitHub</ProfileBtn>
          </div>
        </>
      )}
      <Label style={{ marginTop: 40 }}>Coding activity on Codolio (live)</Label>
      <CodolioActivity user={L.codolioUser} />
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}>
        <div style={{ fontSize: 15, color: '#555', marginTop: 8 }}>CodeChef, LeetCode and HackerRank submissions, loaded live from Codolio.</div>
        <ProfileBtn href={L.codolio} c={YELLOW}>View on Codolio</ProfileBtn>
      </div>
    </>
  );
}


// Live coding activity from Codolio's public profile feed (only problem counts + dates are used).
const CODOLIO_API = (user) => `https://api.codolio.com/profile?userKey=${user}`;
const dayKey = (d) => d.toISOString().slice(0, 10);

function CodolioActivity({ user }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  React.useEffect(() => {
    let alive = true;
    fetch(CODOLIO_API(user))
      .then((r) => r.json())
      .then((j) => {
        const list = j?.data?.platformProfiles?.platformProfiles || [];
        const days = {};
        const platforms = [];
        list.forEach((pf) => {
          const n = pf?.totalQuestionStats?.totalQuestionCounts || 0;
          if (n) platforms.push([pf.platform, n]);
          const cal = pf?.dailyActivityStatsResponse?.submissionCalendar || {};
          Object.entries(cal).forEach(([ts, c]) => {
            const k = dayKey(new Date(Number(ts) * 1000));
            days[k] = (days[k] || 0) + Number(c || 0);
          });
        });
        if (alive) setData({ days, platforms });
      })
      .catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [user]);

  if (failed) return null;
  if (!data) return <div style={{ fontSize: 15, color: '#777', padding: '18px 0' }}>Loading Codolio activity...</div>;

  // last 53 weeks, columns = weeks (Sunday first), like GitHub's chart
  const today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 52 * 7 - today.getUTCDay());
  const cells = [];
  let active = 0, streak = 0, best = 0, inYear = 0;
  for (let d = new Date(start), i = 0; d <= today; d.setUTCDate(d.getUTCDate() + 1), i++) {
    const c = data.days[dayKey(d)] || 0;
    cells.push({ i, c, date: dayKey(d), month: d.getUTCMonth(), dom: d.getUTCDate() });
    if (c > 0) { active++; streak++; best = Math.max(best, streak); inYear += c; } else streak = 0;
  }
  const max = Math.max(1, ...cells.map((x) => x.c));
  // theme ramp: soft yellow → yellow → soft pink → pink
  const shade = (c) => (c === 0 ? '#ebe6dc' : [YELLOW.off, YELLOW.on, PINK.off, PINK.on][Math.min(3, Math.floor((c / max) * 4))]);
  const S = 15, G = 3;
  const weeks = Math.ceil(cells.length / 7);
  const total = data.platforms.reduce((a, [, n]) => a + n, 0);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div style={{ border: '1.5px solid #222', borderRadius: 10, padding: 18, background: '#fff' }}>
      <svg viewBox={`0 0 ${weeks * (S + G) + 30} ${7 * (S + G) + 22}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="Codolio submission activity over the last year">
        {cells.filter((x) => x.dom <= 7 && x.i % 7 === 0).map((x) => (
          <text key={'m' + x.i} x={30 + Math.floor(x.i / 7) * (S + G)} y="11" fontSize="11" fill="#777">{MONTHS[x.month]}</text>
        ))}
        {['Mon', 'Wed', 'Fri'].map((t, k) => <text key={t} x="0" y={22 + (k * 2 + 1) * (S + G) + 11} fontSize="10" fill="#777">{t}</text>)}
        {cells.map((x) => (
          <rect key={x.i} x={30 + Math.floor(x.i / 7) * (S + G)} y={20 + (x.i % 7) * (S + G)} width={S} height={S} rx="3" fill={shade(x.c)}>
            <title>{`${x.date}: ${x.c} submission${x.c === 1 ? '' : 's'}`}</title>
          </rect>
        ))}
      </svg>
      <div className="flex flex-wrap" style={{ gap: 10, marginTop: 14, fontSize: 15 }}>
        {[[total.toLocaleString(), 'problems solved'], [String(active), 'active days this year'], [String(best), 'day best streak'], ...data.platforms.map(([p, n]) => [n.toLocaleString(), p])].map(([v, l]) => (
          <span key={l} style={{ border: '1px solid #ccc', borderRadius: 16, padding: '4px 12px', background: '#faf7f1' }}><b>{v}</b> {l}</span>
        ))}
      </div>
    </div>
  );
}

const ProfileBtn = ({ href, children, c }) => (
  <a href={href} target="_blank" rel="noreferrer" className="contact-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 42, padding: '0 18px', borderRadius: 21, border: '1.5px solid #222', background: c.on, color: '#111', fontSize: 16, fontWeight: 600, textDecoration: 'none', marginTop: 12 }}>{children} &#8599;</a>
);

export const RESUME_PAGES = {
  'r-playground': PlaygroundPage,
  'r-projects': Projects,
  'r-internship': Internship,
  'r-education': Education,
  'r-skills': Skills,
  'r-leadership': Leadership,
  'r-hackathons': Hackathons,
  'r-achievements': Achievements,
  'r-additional': Additional,
  'r-contact': Contact,
};

export default function ResumePage({ id, nav, wide = false }) {
  const C = RESUME_PAGES[id];
  const host = useContext(LightboxHost);
  const [lb, setLb] = useState(null);
  return (
    <div style={{ maxWidth: wide ? 1400 : 1000, transition: 'max-width .45s cubic-bezier(.2,.9,.3,1)' }}>
      <OpenCtx.Provider value={(list, i) => setLb({ list, i })}>
        <C />
      </OpenCtx.Provider>
      {lb && <Lightbox list={lb.list} i={lb.i} host={host} onClose={() => setLb(null)} onGo={(i) => setLb((s) => ({ ...s, i }))} />}
      <div style={{ marginTop: 56 }}>
        <button onClick={nav.onBack} style={{ width: 291, height: 64, border: '1.5px solid #222', background: 'transparent', fontSize: 18, textTransform: 'uppercase' }}>&lt; Back</button>
      </div>
    </div>
  );
}
