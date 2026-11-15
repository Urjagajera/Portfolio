import React, { useState } from 'react';
import MaskWord from '../components/MaskWord';
import { asset } from '../lib/design';

const TYPES = ['Web Launch', 'Visual Identity', 'Brand in Motion', 'E-Commerce', 'Custom package needs', 'Retainer relatd', 'Other'];

const col = { fontSize: 28, lineHeight: '41px', color: '#1a1a1a' };

function Field({ label, req, style, type = 'text' }) {
  return (
    <label className="absolute block" style={{ fontSize: 24, color: '#333', ...style }}>
      {label}{req && ' *'}
      <input
        required={req} type={type}
        className="block w-full bg-transparent border-0 outline-none"
        style={{ borderBottom: '1px solid #444', marginTop: 22, height: 36, fontSize: 22 }}
      />
    </label>
  );
}

export default function ContactPage({ onGo }) {
  const [picked, setPicked] = useState([]);
  const [sent, setSent] = useState(false);
  const toggle = (t) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  const img = (n, l, t, w) => (
    <img src={asset(n)} alt="" draggable={false} className="absolute mul pointer-events-none" style={{ left: l, top: t, width: w }} />
  );

  return (
    <div className="relative" style={{ height: 2740 }}>
      <img src={asset('contact_top.jpg')} alt="" draggable={false} className="absolute mul pointer-events-none" style={{ left: 60, top: 0, width: 1290, WebkitMaskImage: 'linear-gradient(#000 70%, transparent)', maskImage: 'linear-gradient(#000 70%, transparent)' }} />
      <div className="absolute w-full text-center font-display" style={{ top: 294, fontSize: 50, fontWeight: 800, letterSpacing: '.005em' }}>PROJECT</div>
      <MaskWord word="inq" style={{ position: 'absolute', left: 500, top: 350 }} />

      <img src={asset('contact_mark_l.png')} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: 196, top: 706, width: 68 }} />
      <img src={asset('contact_mark_arc.png')} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: 841, top: 636, width: 109 }} />
      <p className="absolute m-0" style={{ left: 241, top: 682, width: 660, fontSize: 28, lineHeight: '41px' }}>
        Hey! <b>Great to see you!</b> In order to ensure we’re a good match, we’d love to learn more about what you’re working towards.
      </p>
      {img('contact_gummy.jpg', 1683, 651, 90)}

      <div className="absolute" style={{ left: 241, top: 918, width: 420, ...col }}>
        <b style={{ fontWeight: 600 }}>Project Duration:</b> Our wish is to help you achieve your desired vision, we’re fully devoted to our clients. As such, we expect a reasonable discussion and consideration of a project-appropriate timeline.
      </div>
      <div className="absolute" style={{ left: 733, top: 918, width: 480, ...col }}>
        <b style={{ fontWeight: 600 }}>Budget</b>: Budgets vary based on deliverables, timelines, and stakes. In order to have full clarity about your project, we would like an estimation to see if there’s a match in expectations. If your expectations are different, please don't be discouraged from continuing the conversation about budget limitations. We can discuss tailor packages to meet specific needs.
      </div>
      <div className="absolute" style={{ left: 1277, top: 918, width: 380, ...col }}>
        <b style={{ fontWeight: 600 }}>Scope:</b> Our best work lies in brand strategy, visual identity, website design, development, and campaigns. We’re open to other requests, unique ideas and design beyond one medium. Each project scope would be thoroughly discussed.
      </div>

      {img('contact_scissors.jpg', 79, 1393, 535)}
      {img('contact_calc.jpg', 1460, 1342, 428)}
      <button onClick={() => onGo('programs')} className="absolute bg-transparent border-0" style={{ left: 1015, top: 1465, width: 340, height: 170, transform: 'rotate(-8deg)' }} aria-label="Go browse the program page">
        <img src={asset('contact_squiggle.jpg')} alt="" draggable={false} className="mul" style={{ width: 374, marginLeft: -20, marginTop: -6 }} />
      </button>

      <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="absolute" style={{ left: 0, top: 1868, width: 1890, height: 800 }}>
        <Field label="Full Name" req style={{ left: 379, top: 0, width: 302 }} />
        <Field label="Your Email" req type="email" style={{ left: 379, top: 136, width: 302 }} />
        <Field label="Company" style={{ left: 379, top: 272, width: 302 }} />
        <Field label="Budget Estimation" style={{ left: 379, top: 408, width: 302 }} />
        <Field label="Timeline Expectation" style={{ left: 379, top: 544, width: 302 }} />

        <div className="absolute" style={{ left: 806, top: 0, width: 704, fontSize: 24, color: '#333' }}>
          Select Project Type
          <div className="flex flex-wrap" style={{ gap: '14px 10px', marginTop: 32, width: 700 }}>
            {TYPES.map((t) => (
              <button
                key={t} type="button" onClick={() => toggle(t)}
                style={{ border: '1px solid #333', borderRadius: 22, padding: '6px 20px', fontSize: 17, background: picked.includes(t) ? '#141414' : 'transparent', color: picked.includes(t) ? '#fff' : '#222', transition: 'all .2s' }}
              >{t}</button>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>Questions, project description, details: *</div>
          <textarea required className="block bg-transparent outline-none" style={{ marginTop: 22, width: 704, height: 124, border: '1px solid #333', fontSize: 20, padding: 12 }} />
        </div>
        <Field label="Which song do you have on repeat now?" style={{ left: 806, top: 544, width: 704 }} />

        <button type="submit" className="absolute" style={{ left: 1360, top: 654, width: 151, height: 43, borderRadius: 22, border: '1.5px solid #141414', background: '#b9f7a6', fontSize: 20 }}>
          {sent ? 'Sent ✓' : 'Send'}
        </button>
      </form>
    </div>
  );
}
