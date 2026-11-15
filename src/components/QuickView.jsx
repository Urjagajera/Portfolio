import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as R from '../data/resume';
import LoopVideo from './LoopVideo';

// "60-second view": a one-screen recruiter summary over the playful site. Portalled to <body> so it renders at
// real CSS pixels (outside the design-scale zoom) and stays readable on phones. Opens from the hero button or
// a link to #60s; closes with Esc, the X, or a click on the backdrop.

const Btn = ({ href, children, primary, download, onClick }) => {
  const cls = `qv-btn ${primary ? 'qv-btn-primary' : ''}`;
  if (onClick) return <button type="button" className={cls} onClick={onClick}>{children}</button>;
  return <a className={cls} href={href} download={download} target={href.startsWith('http') || download ? '_blank' : undefined} rel="noreferrer">{children}</a>;
};

const Section = ({ title, children }) => (
  <section className="qv-section">
    <h3 className="qv-h3">{title}</h3>
    {children}
  </section>
);

const firstTech = (t, n = 5) => t.split(',').map((s) => s.trim()).slice(0, n).join(' · ');

export default function QuickView({ open, onClose }) {
  const panel = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const before = document.activeElement;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    panel.current?.focus({ preventScroll: true });
    const key = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      html.style.overflow = prevOverflow;
      before && before.focus && before.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(R.CONTACT.email); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { window.location.href = `mailto:${R.CONTACT.email}`; }
  };

  const i = R.INTERNSHIP;
  const projects = R.PROJECTS.filter((p) => p.pitch).slice(0, 3);
  const skillRows = R.SKILLS.slice(0, 4);

  return createPortal(
    <div className="qv-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={panel} className="qv-panel" role="dialog" aria-modal="true" aria-labelledby="qv-title" tabIndex={-1}>
        <button type="button" className="qv-close" aria-label="Close the 60-second view" onClick={onClose}>&times;</button>

        <header className="qv-head">
          <span className="qv-kicker">60-second view</span>
          <h2 id="qv-title" className="qv-name">Urja Gajera</h2>
          <p className="qv-headline">{R.HEADLINE}</p>
          <span className="qv-open"><i className="visitor-dot" aria-hidden="true" />{R.AVAILABILITY}</span>
          <div className="qv-actions">
            <Btn href={R.RESUME_PDF} download primary>Download resume &#8595;</Btn>
            <Btn onClick={copyEmail}>{copied ? 'Email copied ✓' : R.CONTACT.email}</Btn>
            <Btn href={R.LINKS.linkedin}>LinkedIn &#8599;</Btn>
            <Btn href={R.LINKS.github}>GitHub &#8599;</Btn>
            <Btn href={R.LINKS.codechef}>CodeChef &#8599;</Btn>
          </div>
        </header>

        <div className="qv-stats">
          {R.IMPACT.map(([v, l]) => (
            <div key={l} className="qv-stat"><b>{v}</b><span>{l}</span></div>
          ))}
        </div>

        <Section title="Experience">
          <div className="qv-row">
            <div><b>{i.role}</b>, {i.company}</div>
            <div className="qv-muted">{i.period}</div>
          </div>
          <p className="qv-p">{i.points[0]}</p>
          <p className="qv-tech">{firstTech(i.tech, 6)}</p>
        </Section>

        <Section title="Top projects">
          <div className="qv-projects">
            {projects.map((p) => (
              <article key={p.name} className="qv-card">
                {p.video && <LoopVideo src={p.video.src} poster={p.video.poster} caption="" className="qv-video" />}
                <div className="qv-card-top"><b>{p.name}</b><span className="qv-muted">{p.badge.replace(/ - /, ' · ')}</span></div>
                <p className="qv-p">{p.pitch}</p>
                <p className="qv-tech">{firstTech(p.tech)}</p>
                {p.repo && <a className="qv-link" href={p.repo} target="_blank" rel="noreferrer">Code on GitHub &#8599;</a>}
              </article>
            ))}
          </div>
        </Section>

        <div className="qv-two">
          <Section title="Leadership & wins">
            <ul className="qv-list">
              <li><b>Secretary, IEEE CHARUSAT Student Branch</b> (2025 - 2026): 5+ workshops, general body meeting for 100+ members</li>
              <li><b>Secretary, IEEE WIE Affinity Group</b> (2025)</li>
              <li><b>NPTEL Elite</b>, Theory of Computation, IIT Kanpur</li>
              <li><b>Champions</b>, Major Dhyan Chand Cup basketball, CHARUSAT</li>
            </ul>
          </Section>
          <Section title="Skills">
            <dl className="qv-skills">
              {skillRows.map(([k, v]) => (
                <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>
              ))}
            </dl>
          </Section>
        </div>

        <Section title="Education">
          <div className="qv-row">
            <div><b>B.Tech, Computer Science & Engineering</b>, CHARUSAT (CSPIT), Anand</div>
            <div className="qv-muted">{R.EDUCATION.period} · CGPA {R.EDUCATION.cgpa.split(' (')[0]}</div>
          </div>
        </Section>

        <footer className="qv-foot">
          <span>Want the full story? Projects, certificates and more are on the desk.</span>
          <button type="button" className="qv-btn" onClick={onClose}>Explore the site &#8595;</button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
