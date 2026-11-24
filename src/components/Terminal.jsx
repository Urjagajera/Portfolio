import React, { useEffect, useRef, useState } from 'react';
import * as R from '../data/resume';
import { toggleTheme } from '../lib/theme';

// A secret retro terminal. Opens with the ` key anywhere on the site (when you're not typing in a form),
// or from the "terminal" buttons in the footers. Commands answer from the same data as the rest of the site.

const A = ({ href, children }) => <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{children}</a>;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

const HELP = [
  ['whoami', 'who I am, in one line'],
  ['about', 'a little more about me'],
  ['projects', 'everything I have built'],
  ['project <name>', 'one project in detail, e.g. project nirman'],
  ['skills', 'my toolkit'],
  ['experience', 'internship'],
  ['education', 'where I study'],
  ['achievements', 'prizes and badges'],
  ['contact', 'how to reach me'],
  ['resume', 'download my resume'],
  ['hire', 'the short pitch'],
  ['theme', 'pull the lamp (light / dark)'],
  ['guess', 'a tiny number game'],
  ['clear', 'clean the screen'],
  ['exit', 'close the terminal'],
];
const COMMANDS = ['help', 'whoami', 'about', 'projects', 'project', 'skills', 'experience', 'education', 'achievements', 'contact', 'resume', 'hire', 'theme', 'guess', 'clear', 'exit', 'ls', 'cat', 'date', 'sudo', 'github', 'linkedin', 'coffee'];

function run(raw, ctx) {
  const line = raw.trim();
  const [cmd, ...rest] = line.split(/\s+/);
  const arg = rest.join(' ');
  const c = (cmd || '').toLowerCase();
  if (ctx.game) {
    if (c === 'quit' || c === 'exit') { ctx.setGame(null); return 'Game over. The number was ' + ctx.game.n + '.'; }
    const g = Number(line);
    if (!Number.isFinite(g)) return 'Type a number between 1 and 100 (or quit).';
    const tries = ctx.game.tries + 1;
    if (g === ctx.game.n) { ctx.setGame(null); return <span className="t-ok">Got it in {tries} {tries === 1 ? 'try' : 'tries'}! {tries <= 7 ? 'That is binary-search energy.' : 'Next time, try halving the range ;)'}</span>; }
    ctx.setGame({ n: ctx.game.n, tries });
    return g < ctx.game.n ? 'Higher.' : 'Lower.';
  }
  switch (c) {
    case '': return null;
    case 'help':
      return (<div className="t-grid">{HELP.map(([k, v]) => <React.Fragment key={k}><b>{k}</b><span>{v}</span></React.Fragment>)}</div>);
    case 'whoami': return `Urja Gajera. ${R.HEADLINE}. ${R.AVAILABILITY}.`;
    case 'about': return R.SUMMARY;
    case 'ls': return <span>about.txt  skills.txt  projects/  <A href={R.RESUME_PDF}>resume.pdf</A></span>;
    case 'cat':
      if (/about/.test(arg)) return R.SUMMARY;
      if (/skills/.test(arg)) return run('skills', ctx);
      if (/resume/.test(arg)) return <span>It is a PDF, try <b>resume</b> instead.</span>;
      return `cat: ${arg || '(nothing)'}: no such file. Try ls.`;
    case 'projects':
      return (
        <div className="t-grid">
          {R.PROJECTS.map((p) => <React.Fragment key={p.name}><b>{slug(p.name)}</b><span>{p.name}: {p.subtitle}</span></React.Fragment>)}
          <i />
          <span className="t-dim">type project &lt;name&gt; for details</span>
        </div>
      );
    case 'project': {
      const p = R.PROJECTS.find((x) => slug(x.name).startsWith(slug(arg || '-')));
      if (!p) return `No project called "${arg}". Try: ${R.PROJECTS.map((x) => slug(x.name)).join(', ')}`;
      return (
        <div>
          <div className="t-h">{p.name} <span className="t-dim">· {p.subtitle}</span></div>
          <div>{p.pitch || (p.points && p.points[0]) || (p.paras && p.paras[0])}</div>
          <div className="t-dim">{p.tech}</div>
          {(p.live || p.repo) && <div>{p.live && <A href={p.live}>live ↗</A>}{p.live && p.repo && '  '}{p.repo && <A href={p.repo}>code ↗</A>}</div>}
        </div>
      );
    }
    case 'skills':
      return (<div className="t-grid">{R.SKILLS.map(([g, l]) => <React.Fragment key={g}><b>{g}</b><span>{l}</span></React.Fragment>)}</div>);
    case 'experience':
      return (<div><div className="t-h">{R.INTERNSHIP.role}, {R.INTERNSHIP.company}</div><div className="t-dim">{R.INTERNSHIP.period}</div><div>{R.INTERNSHIP.points[0]}</div></div>);
    case 'education':
      return (<div><div className="t-h">{R.EDUCATION.degree}</div><div>{R.EDUCATION.school}</div><div className="t-dim">{R.EDUCATION.period} · CGPA {R.EDUCATION.cgpa}</div></div>);
    case 'achievements':
      return (<ul className="t-list">{R.ACHIEVEMENTS.map((a) => <li key={a.text}>{a.text}</li>)}</ul>);
    case 'contact':
      return (
        <div className="t-grid">
          <b>email</b><span><A href={`mailto:${R.CONTACT.email}`}>{R.CONTACT.email}</A></span>
          <b>linkedin</b><span><A href={R.LINKS.linkedin}>{R.LINKS.linkedin.replace('https://', '')}</A></span>
          <b>github</b><span><A href={R.LINKS.github}>{R.LINKS.github.replace('https://', '')}</A></span>
        </div>
      );
    case 'github': window.open(R.LINKS.github, '_blank', 'noopener'); return 'Opening GitHub...';
    case 'linkedin': window.open(R.LINKS.linkedin, '_blank', 'noopener'); return 'Opening LinkedIn...';
    case 'resume': return <span>Here you go: <A href={R.RESUME_PDF}>Urja_Gajera_Resume.pdf ↓</A></span>;
    case 'hire':
      return (
        <div>
          <div className="t-h">Why hire me?</div>
          <ul className="t-list">
            <li>I finish things: {R.PROJECTS.length} projects built, several live.</li>
            <li>Internship experience leading a frontend in a 4-member team.</li>
            <li>{R.CODING_PROFILES[0][0]} problems on CodeChef and a 2nd prize at CHAOS2COMMIT.</li>
          </ul>
          <div>Say hi: <A href={`mailto:${R.CONTACT.email}?subject=Internship%20opportunity`}>{R.CONTACT.email}</A></div>
        </div>
      );
    case 'theme': setTimeout(() => toggleTheme(window.innerWidth - 40, 90), 50); return 'Pulling the lamp cord...';
    case 'guess': ctx.setGame({ n: 1 + Math.floor(Math.random() * 100), tries: 0 }); return 'I picked a number from 1 to 100. Your guess? (quit to stop)';
    case 'date': return new Date().toString();
    case 'sudo': return /hire/.test(arg) ? <span className="t-ok">Permission granted. Excellent decision. Run: contact</span> : 'Nice try. This incident will be reported to the lamp.';
    case 'coffee': return 'Brewing... ☕ (it is always coffee o\'clock somewhere)';
    case 'exit': ctx.close(); return null;
    default: return `command not found: ${cmd}. Type help.`;
  }
}

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const [game, setGame] = useState(null);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (e.key === '`' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); setOpen((o) => !o); }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-terminal', onOpen);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('open-terminal', onOpen); };
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!lines.length) {
      setLines([{ out: <span className="t-boot">URJA-OS v2026.11 · booting... done.{'\n'}Welcome! Type <b>help</b> to see what I can do, or <b>hire</b> if you are in a hurry.</span> }]);
    }
    setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [lines]);

  const submit = (e) => {
    e.preventDefault();
    const raw = input;
    setInput(''); setHi(-1);
    if (raw.trim()) setHist((h) => [raw, ...h].slice(0, 50));
    if (raw.trim().toLowerCase() === 'clear') { setLines([]); return; }
    const out = run(raw, { game, setGame, close: () => setOpen(false) });
    setLines((l) => [...l, { cmd: raw, prompt: game ? 'guess>' : null, out }]);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.min(hi + 1, hist.length - 1); if (n >= 0) { setHi(n); setInput(hist[n]); } }
    if (e.key === 'ArrowDown') { e.preventDefault(); const n = hi - 1; setHi(n); setInput(n >= 0 ? hist[n] : ''); }
    if (e.key === 'Tab') {
      e.preventDefault();
      const [w, ...more] = input.split(' ');
      if (!more.length) { const m = COMMANDS.filter((c) => c.startsWith(w.toLowerCase())); if (m.length === 1) setInput(m[0] + ' '); }
      else if (w === 'project') { const m = R.PROJECTS.map((p) => slug(p.name)).filter((s) => s.startsWith(slug(more.join('')))); if (m.length === 1) setInput('project ' + m[0]); }
    }
  };

  if (!open) return null;
  return (
    <div className="term-wrap" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="term keep-dark" role="dialog" aria-modal="true" aria-label="Terminal">
        <div className="term-bar">
          <span className="term-dots"><i /><i /><i /></span>
          <span>urja@portfolio: ~</span>
          <button type="button" aria-label="Close terminal" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="term-body" ref={bodyRef} onClick={() => inputRef.current && inputRef.current.focus()}>
          {lines.map((l, i) => (
            <div key={i} className="term-line">
              {l.cmd !== undefined && <div><span className="t-prompt">{l.prompt || 'urja@portfolio:~$'}</span> {l.cmd}</div>}
              {l.out && <div className="t-out">{l.out}</div>}
            </div>
          ))}
          <form onSubmit={submit} className="term-input">
            <span className="t-prompt">{game ? 'guess>' : 'urja@portfolio:~$'}</span>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} spellCheck={false} autoCapitalize="off" autoComplete="off" aria-label="Terminal command" />
          </form>
        </div>
      </div>
    </div>
  );
}
