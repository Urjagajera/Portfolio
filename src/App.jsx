import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { DesignProvider, useDesign } from './lib/design';
import Tabs from './components/Tabs';
import Footer from './components/Footer';
import HomePage from './sections/HomePage';
import ProjectPage from './sections/ProjectPage';
import ThemeCord from './components/ThemeCord';
import Terminal from './components/Terminal';
import PencilCursor from './components/PencilCursor';

function Shell() {
  const { z, vh } = useDesign();
  const [activeTab, setActiveTab] = useState('home');
  const [project, setProject] = useState(null);
  const [computerOn, setComputerOn] = useState(false);
  const [mode, setMode] = useState('home');
  const footerRef = useRef(null);
  const savedScroll = useRef(0);
  const isAutoScrolling = useRef(false);
  const autoScrollTimer = useRef(null);

  // Scroll spy to update active tab when scrolling manually
  useEffect(() => {
    if (project) return;

    const onScroll = () => {
      if (mode === 'portfolio') {
        setActiveTab('portfolio');
        return;
      }
      if (isAutoScrolling.current) return;

      const sections = [
        { id: 'contact', el: document.getElementById('contact') },
        { id: 'about', el: document.getElementById('about') },
        { id: 'programs', el: document.getElementById('programs') },
        { id: 'portfolio', el: document.getElementById('portfolio') },
        { id: 'home', el: document.getElementById('home') },
      ];

      const threshold = window.innerHeight * 0.45;
      for (const s of sections) {
        if (!s.el) continue;
        const rect = s.el.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom > 0) {
          setActiveTab(s.id);
          return;
        }
      }
      setActiveTab('home');
    };

    let raf = 0;
    const onFrame = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; onScroll(); }); };
    window.addEventListener('scroll', onFrame, { passive: true });
    onScroll();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onFrame); };
  }, [mode, z, project]);

  const scrollTo = useCallback((id) => {
    if (project) {
      setProject(null);
      requestAnimationFrame(() => {
        setTimeout(() => scrollTo(id), 60);
      });
      return;
    }

    setActiveTab(id);
    isAutoScrolling.current = true;
    clearTimeout(autoScrollTimer.current);
    autoScrollTimer.current = setTimeout(() => {
      isAutoScrolling.current = false;
    }, 1000);

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'portfolio') {
      setComputerOn(true);
      const el = document.getElementById('portfolio');
      if (el) {
        const top = (el.getBoundingClientRect().top + window.scrollY) / z;
        const target = (top + 1065 - vh + 1300 + 20) * z;
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    } else {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }, [project, z, vh]);

  const openProject = useCallback((id) => {
    savedScroll.current = window.scrollY;
    setProject(id);
  }, []);

  const closeProject = () => {
    setProject(null);
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScroll.current, behavior: 'auto' });
    });
  };

  if (project) {
    return (
      <ProjectPage
        id={project}
        onBack={closeProject}
        onServices={() => { closeProject(); setTimeout(() => scrollTo('programs'), 100); }}
        onContact={() => { closeProject(); setTimeout(() => scrollTo('contact'), 100); }}
      />
    );
  }

  const dark = mode === 'portfolio';

  return (
    <>
      <Tabs active={activeTab} onSelect={scrollTo} dark={dark} footerRef={footerRef} />
      <main>
        <HomePage
          on={computerOn}
          setOn={setComputerOn}
          onOpenProject={openProject}
          onMode={setMode}
          onGo={scrollTo}
        />
      </main>
      <Footer ref={footerRef} />
    </>
  );
}

// Below 900px the scaled "desk" design gets too small to read, so phones and small tablets get their own
// flow layout (loaded on demand, so desktop visitors never download it).
const MobileSite = lazy(() => import('./mobile/MobileSite'));
const MOBILE_MQ = '(max-width: 899px)';

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE_MQ).matches);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const on = () => setMobile(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on));
  }, []);
  return mobile;
}

export default function App() {
  const mobile = useIsMobile();
  return (
    <>
      <ThemeCord className={mobile ? 'is-mobile' : ''} />
      <Terminal />
      {!mobile && <PencilCursor />}
      {mobile ? (
        <Suspense fallback={null}>
          <MobileSite />
        </Suspense>
      ) : (
        <DesignProvider>
          <Shell />
        </DesignProvider>
      )}
    </>
  );
}
