import React from 'react';
import { RESUME_PDF } from '../data/resume';
import VisitorCount from './VisitorCount';

// Top-left contact line
export default function Header() {
  return (
    <div className="absolute flex items-center italic" style={{ left: 90, top: 28, fontSize: 18 }}>
      <a href="mailto:urjagajera12@gmail.com" style={{ textDecoration: 'none' }}>urjagajera12@gmail.com</a>
      <span style={{ margin: '0 12px', opacity: 0.5 }}>·</span>
      <a href={RESUME_PDF} target="_blank" rel="noreferrer" download style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>download resume &#8595;</a>
      <VisitorCount style={{ marginLeft: 26 }} />
    </div>
  );
}
