import { useState } from 'react';
import { CONTACT } from '../data/resume';

// Contact-form state + delivery through FormSubmit, shared by the desktop and mobile layouts.
const EMPTY = { name: '', email: '', phone: '', message: '' };

export function useContactForm() {
  const [f, setF] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const set = (k) => (e) => { const v = e.target.value; setF((s) => ({ ...s, [k]: v })); setStatus((st) => (st === 'sending' ? st : 'idle')); };

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (e.currentTarget.elements._honey?.value) { setStatus('sent'); return; } // a bot filled the hidden field
    setStatus('sending');
    try {
      const res = await fetch(CONTACT.form, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...f, _subject: `Portfolio message from ${f.name}`, _replyto: f.email, _template: 'table', _captcha: 'false' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== 'true') throw new Error(data.message || `HTTP ${res.status}`);
      setStatus('sent');
      setF(EMPTY);
    } catch (err) {
      // e.g. "This form needs Activation..." until the owner clicks the link FormSubmit emails on first use
      console.warn('[contact form] not sent:', err && err.message);
      setStatus('error');
    }
  };

  // fallback when the form service is unreachable: open the visitor's mail app with everything filled in
  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`Portfolio message from ${f.name || 'a visitor'}`)}&body=${encodeURIComponent(`${f.message}\n\n${f.name}\n${f.email}${f.phone ? `\n${f.phone}` : ''}`)}`;
  const btnText = { idle: 'Submit', sending: 'Sending…', sent: 'Sent ✓', error: 'Try again' }[status];
  return { f, set, status, submit, mailto, btnText };
}

// visually hidden spam trap; real visitors never see or fill it
export const honeypotProps = { type: 'text', name: '_honey', tabIndex: -1, autoComplete: 'off', 'aria-hidden': true, style: { position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 } };
