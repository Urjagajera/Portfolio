import React, { useEffect } from 'react';
import { WindowButtons } from '../components/Portfolio';
import { asset } from '../lib/design';
import ResumePage, { RESUME_PAGES } from './ResumePage';

const H3 = ({ children, style }) => (
  <h3 className="font-display m-0" style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-.01em', lineHeight: '32px', marginBottom: 6, ...style }}>{children}</h3>
);
const P = ({ children, style }) => (
  <p style={{ fontSize: 20, lineHeight: '30px', margin: '0 0 30px', color: '#222', ...style }}>{children}</p>
);
const Img = ({ n, w, h, style }) => (
  <img src={asset(n)} alt="" draggable={false} style={{ display: 'block', width: w, height: h, border: '1px solid #222', ...style }} />
);
const Meta = ({ industry, deliverables }) => (
  <div className="absolute" style={{ left: 847, top: 111, width: 296 }}>
    <div style={{ fontSize: 21, color: '#333' }}>Industry</div>
    <div className="italic text-center flex items-center justify-center" style={{ height: 61, marginTop: 8, border: '1px solid #222', fontSize: 21 }}>{industry}</div>
    <div style={{ fontSize: 21, color: '#333', marginTop: 24 }}>Deliverables</div>
    <div className="italic text-center flex items-center justify-center" style={{ height: 133, marginTop: 8, border: '1px solid #222', fontSize: 21, lineHeight: '24px', padding: '0 24px' }}>{deliverables}</div>
  </div>
);
const Buttons = ({ onBack, onServices, onContact, left = 98 }) => {
  const b = { width: 291, height: 64, border: '1.5px solid #222', background: 'transparent', fontSize: 18, textTransform: 'uppercase' };
  return (
    <div className="relative" style={{ height: 64, marginTop: 40 }}>
      <button onClick={onBack} className="absolute" style={{ ...b, left: 0 }}>&lt; Back</button>
      <button onClick={onServices} className="absolute" style={{ ...b, left: 304 }}>What I do</button>
      <button onClick={onContact} className="absolute" style={{ ...b, left: 847, boxShadow: '4px 4px 0 #111' }}>Contact</button>
    </div>
  );
};

/* ------------------------------------------------------------------ Lena */
function Lena({ nav }) {
  return (
    <>
      <div className="relative" style={{ height: 573 - 189 + 0 }}>
        <div className="absolute" style={{ left: 0, top: 0 }}>
          <h1 className="font-display m-0" style={{ fontSize: 72, lineHeight: '72px', fontWeight: 800, letterSpacing: '-.02em', transform: 'scaleX(1.22)', transformOrigin: 'left' }}>LENA BALL</h1>
          <div style={{ fontSize: 22, marginTop: 14 }}>://&gt; Concept Ideation | Style Guidance</div>
          <Img n="lena_banner.webp" w={835} h={245} style={{ marginTop: 30 }} />
        </div>
        <div className="absolute" style={{ left: 0, top: 0 }}><Meta industry="Wellness, Coaching" deliverables="Brand identity, Logo Concept. Color Palette, Typography Guidelines" /></div>
      </div>
      <div className="flex" style={{ gap: 82, marginTop: 88 }}>
        <div style={{ width: 517 }}>
          <p className="font-bold" style={{ fontSize: 24, lineHeight: '34px', margin: 0, fontWeight: 700 }}>Lena Ball Coaching approached us with a vision to create a space for reconnection. One that nurtured the body, spirit, and mind. As a nutritionist offering empathetic guidance for women, she wanted her brand to communicate nurture, stability, and trust. Our role was to translate that vision into a cohesive identity from concept through to launch.</p>
          <div style={{ marginTop: 78 }}>
            <H3>THE CHALLENGE</H3>
            <P>In a crowded wellness space, the challenge was to develop a brand identity that felt distinctive while remaining calm, grounded, and credible. Through our conversations, it became clear that the brand was rooted in ideas of feminine wisdom, serenity, trust, and connection to nature. This led us towards an earth-inspired visual language that could express both emotional warmth and mature stability.</P>
          </div>
          <Img n="lena_cards.webp" w={517} h={377} style={{ marginTop: 56 }} />
          <div style={{ marginTop: 56 }}>
            <H3>LOGO AND TYPOGRAPHY</H3>
            <P style={{ marginBottom: 30 }}>Nature is the central motif of the identity. Inspired by the idea of growth between heaven and earth, the hydrangea was chosen as the defining symbol, both for its meaning and for how naturally its form complemented the circular logo structure. Rendered in delicate line art, the flower expressed nurture, while the visible roots suggested growth through both aspiration and introspection.</P>
            <P>The typography was selected to balance professionalism with softness. A thin, rounded sans serif brought a sense of calm, delicacy, and modern clarity, supporting the brand’s intention to feel both trustworthy and comforting.</P>
          </div>
        </div>
        <div style={{ width: 544 }}>
          <Img n="lena_palette.webp" w={544} h={411} />
          <div style={{ marginTop: 90 }}>
            <H3>COLOR PALETTE</H3>
            <P>To reflect the client’s emphasis on femininity, wisdom, and serenity while avoiding pastel tones, we developed a palette grounded in warmth, versatility, and emotional balance. Seashell peach was established as the primary background colour for the logo, with wider application across Instagram posts, website sections, and other brand materials.</P>
            <P>The palette was structured into four colour families,yellow, green, blue, and peach, each with light, saturated, and dark tonal variations. These tones were designed to be mixed and matched rather than used all at once, allowing for more balanced and complementary combinations. In practice, lighter shades support backgrounds, while darker tones are used for accents and text, helping the identity remain soft, grounded, and flexible across digital applications.</P>
          </div>
          <Img n="lena_logo.webp" w={544} h={434} style={{ marginTop: 52 }} />
        </div>
      </div>
      <div style={{ marginTop: 74 }}>
        <H3>OUTCOME</H3>
        <P style={{ maxWidth: 1143 }}>The result was a calm and cohesive brand identity that translated the brand’s values into a visual language of warmth, trust, and grounded femininity. Through a muted palette, nature-led symbolism, and soft typography, the brand was shaped to feel nurturing, credible, and emotionally resonant.</P>
      </div>
      <Buttons {...nav} />
    </>
  );
}

/* ------------------------------------------------------------------ Busy */
function Busy({ nav }) {
  return (
    <>
      <div className="relative" style={{ height: 385 }}>
        <div className="absolute" style={{ left: 0, top: 0 }}>
          <h1 className="font-display m-0" style={{ fontSize: 72, lineHeight: '72px', fontWeight: 800, letterSpacing: '-.02em', whiteSpace: 'nowrap', transform: 'scaleX(1.12)', transformOrigin: 'left' }}>BUSY BUT THRIVING</h1>
          <div style={{ fontSize: 22, marginTop: 14 }}>://&gt; Print design | Journal Design</div>
          <img src={asset('busy_covers.webp')} alt="" draggable={false} style={{ display: 'block', width: 767, height: 232, marginTop: 24 }} />
        </div>
        <Meta industry="E-Commerce, Print" deliverables="Cover Designs, Spread Designs, Page Content, Body Copy" />
      </div>
      <div className="flex" style={{ gap: 62, marginTop: 34 }}>
        <div style={{ width: 553 }}>
          <p style={{ fontSize: 24, lineHeight: '34px', margin: 0, fontWeight: 700, width: 470 }}>Busy But Thriving is a personal project developed as a 90-day “glow-up” journal designed to capture the experience of blooming through youth via self-care and personal affirmations while navigating an ambitious yet joy-filled life.</p>
          <div style={{ marginTop: 68 }}>
            <H3>THE CHALLENGE</H3>
            <P>When developing the idea of a self improvement journal, we looked to spring as the project’s emotional and visual foundation – a season in which life begins to return after winter, and softness carries its own quiet momentum.</P>
            <P>From there, the journal was shaped around the idea of blooming: not as a final state, but as an unfolding. This became the conceptual centre of the book, influencing both the tone of the writing and the visual direction of the design. The result was a journal intended to feel uplifting without becoming overly prescriptive or structured. Importance was placed on maintaining warmth and enjoyment.</P>
          </div>
          <Img n="busy_spread1.webp" w={553} h={343} style={{ marginTop: 40, border: 0 }} />
          <div style={{ marginTop: 40 }}>
            <H3>CONTENT DESIGN</H3>
            <P>The interior was designed to support both reflection and routine. Rather than creating pages that felt rigid or overly optimized, the aim was to offer a framework that could hold different forms of expression: writing, doodling, sticker placement, small check-ins, and moments of pause.</P>
            <P>The introductory spread was treated as an invitation rather than instruction. It guides the reader into the journal’s mindset, reinforcing the idea that growth does not arrive through perfection, but through participation.</P>
          </div>
          <Img n="busy_pattern.webp" w={553} h={440} style={{ marginTop: 40 }} />
          <div style={{ marginTop: 8 }}>
            <H3>PAGE LOGIC</H3>
            <P>The left-hand side is designed as a simplified checkpoint area; a quieter framework for daily maintenance and self-observation.<br />Clear subheadings help to preserve the aesthetic while making each section feel light and approachable.</P>
            <P>Decorative motifs like blue colored shapes, miniature circle decors and geometric shapes remind of fluidity, imperfection and carry unruliness that’s meant to encourage exploration without strictness, reminding that growth is layered. Sections such as “End of Day Highlights” and “I want to …….. Tomorrow” create room for reflection and projection, holding the little wonders of the day alongside the hopes of tomorrow.</P>
            <P>The right-hand side has more open space for writing and personal expression, shaped around the natural habits of right-handed users and their tendency to write diaries from this side first. This makes the page feel more intuitive and generous.</P>
            <P>Leaving half a page for writing and half for artistic expression was intentional. There is enough space to encourage writing, but not so much that it feels barren or overwhelming to fill. Additional space is provided for drawing, pasting pictures, or even more writing, if desired. There are no rules, only suggestions.</P>
            <P>To carry forward the themes of nature and glowing up, small acts of self-care were given dedicated space on daily pages and the 3 dedicated “30-day Report” pages. These cover themes like sleep, hydration, nutrition, and positivity. They are treated not as performance metrics, but as reminders that growth is often built through small, repeated gestures of care.</P>
          </div>
        </div>
        <div style={{ width: 528 }}>
          <Img n="busy_mock.webp" w={546} h={665} style={{ border: 0, marginLeft: 26 }} />
          <div style={{ marginTop: 40 }}>
            <H3>COVER SYSTEM</H3>
            <P>The cover direction drew directly from the project’s central metaphor. Floral motifs were introduced as a visual expression of emergence, softness, and growth, positioning the book for a teen and young adult audience.</P>
            <P>The cover was developed in an assortment of colours, suggesting the passage of time. The different colourways subtly reflecting the four quarters of the year. The effect was both practical and symbolic: a journal that could feel personal in selection, yet still belong to a wider seasonal logic.</P>
          </div>
          <Img n="busy_spread2.webp" w={550} h={352} style={{ marginTop: 36, border: 0, marginLeft: 10 }} />
          <div style={{ marginTop: 44 }}>
            <H3>TYPOGRAPHY</H3>
            <P>Marker-style typography was selected for the title, imparting a sense of comfort and approachability to the cover. Its organic nature softens the overall appearance, creating a more personal touch and reducing rigidity. The graphic floral design letters enhance the playful aesthetic, providing visual contrast between the bold and delicate characters on the cover.</P>
            <P>For the remainder of the journal, typography was approached with clarity and familiarity in mind. A classic typewriter font was utilized for the interior, ensuring that the pages evoke nostalgia while remaining easy to read.</P>
          </div>
          <Img n="busy_spread3.webp" w={570} h={364} style={{ marginTop: 30, border: 0, marginLeft: 10 }} />
          <Img n="busy_spread4.webp" w={570} h={383} style={{ marginTop: 30, border: 0, marginLeft: 10 }} />
          <div style={{ marginTop: 38 }}>
            <H3>OUTCOME</H3>
            <P>The result is a light-hearted, easy-going journal with thoughtful page arrangements, inviting stressless participation. The option to choose different color covers adds more to the experience of discovery and curiosity for the buyer. For people who love to collect beautiful books, this collection will also look aesthetically wonderful on the shelf!</P>
          </div>
        </div>
      </div>
      <Buttons {...nav} />
    </>
  );
}

/* ------------------------------------------------------------------- Web */
function Web({ nav }) {
  const link = <a href="https://www.framer.com" target="_blank" rel="noreferrer" style={{ color: '#2a9fd6', fontSize: 19, textDecoration: 'underline' }}>See Live Here</a>;
  return (
    <div>
      <h1 className="font-display m-0" style={{ fontSize: 76, lineHeight: '76px', fontWeight: 800, letterSpacing: '-.025em', marginTop: 4, transform: 'scaleX(1.12)', transformOrigin: 'left' }}>WEB DEVELOPMENT</h1>
      <div style={{ fontSize: 21, marginTop: 10 }}>://&gt; Web interactions | Animation design</div>
      <div style={{ height: 445 }} />
      <div className="flex" style={{ gap: 40 }}>
        <div style={{ width: 600 }}>
          <p style={{ fontSize: 22, lineHeight: '32px', margin: '0 0 30px', fontWeight: 700 }}>In addition to our visual design expertise, creative thinking, and problem-solving abilities, our core team includes a Framer Pro expert developer. Fred excels at crafting unique, engaging, and innovative digital interactions, web effects, and solutions. He truly brings a static web page's design to life!</p>
          <p style={{ fontSize: 22, lineHeight: '32px', margin: 0, fontWeight: 700 }}>Fred's work offers an immersive experience, so be sure to follow the select links to explore some of his interactive creations.</p>
        </div>
        <div style={{ width: 602, marginLeft: 20 }}>
          <H3 style={{ marginTop: -6 }}>WEB ANIMATION</H3>
          <p style={{ fontSize: 18, lineHeight: '30px', margin: '20px 0 40px' }}>Websites that incorporate subtle animations, refined visual effects, and immersive interactions create a more engaging browsing experience for visitors. These elements help communicate professionalism, attention to detail, and brand quality, which can strengthen user trust. As a result, businesses often benefit from improved conversion rates, increased engagement, and a greater likelihood of visitors becoming customers, subscribers, or followers.</p>
          <H3>SMART USE OF INTERACTIONS</H3>
        </div>
      </div>
      <div style={{ height: 480 }} />
      <div style={{ marginLeft: 20, maxWidth: 1260 }}>
        {link}
        <p style={{ fontSize: 18, lineHeight: '30px', margin: '18px 0 30px' }}>No one wants to be overwhelmed by excessive animations or distracting visual effects while trying to navigate a website and find information. That is why every animation and interactive element we implement serves a clear purpose, whether it is guiding attention, improving usability, or enhancing the overall experience.</p>
        <p style={{ fontSize: 18, lineHeight: '30px', margin: 0 }}>We carefully balance creativity with established UX and UI principles to ensure the website remains intuitive, accessible, and easy to navigate. The result is an experience that feels polished and engaging while allowing important content, imagery, portfolio projects, and galleries to stand out exactly where they should.</p>
      </div>
      <div style={{ height: 360 }} />
      <div style={{ marginLeft: 20, width: 560 }}>
        {link}
        <p style={{ fontSize: 18, lineHeight: '30px', margin: '18px 0 30px' }}>For those open to bold ideas, we design richer animations and interactions that feel distinctive, premium, and visually striking.</p>
        <p style={{ fontSize: 18, lineHeight: '30px', margin: 0 }}>We offer this approach to clients who encourage us to think bigger, challenge conventions, and fully explore the potential of modern web animation.</p>
      </div>
      <h3 className="font-display" style={{ fontSize: 30, fontWeight: 800, margin: '48px 0 0' }}>So...</h3>
      <div style={{ fontSize: 20, marginTop: 6 }}>Let's bring your website to life!</div>
      <div className="flex flex-col justify-center" style={{ marginTop: 34, height: 186, border: '1px solid #222', padding: '0 40px', maxWidth: 1240 }}>
        <div style={{ fontSize: 27 }}>"Have used Fred for me personally and also several of my clients, does amazing work."</div>
        <div className="flex items-center" style={{ gap: 20, marginTop: 32, fontSize: 21 }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #f0a8ff, #7a58e8)' }} />
          Verified Contra Client
        </div>
      </div>
      <div style={{ marginLeft: 0 }}><Buttons {...nav} /></div>
    </div>
  );
}

const PROJECTS = {
  lena: { bar: '#f2a05f', C: Lena, pad: 104 },
  busy: { bar: '#f2a05f', C: Busy, pad: 104 },
  web: { bar: '#6cc0ec', C: Web, pad: 50 },
  ...Object.fromEntries(Object.keys(RESUME_PAGES).map((k, i) => [k, {
    bar: ['#f2a05f', '#6cc0ec', '#f0f23a'][i % 3],
    C: ({ nav }) => <ResumePage id={k} nav={nav} />,
    pad: 104,
  }])),
};

export default function ProjectPage({ id, onBack, onServices, onContact }) {
  const { bar, C, pad } = PROJECTS[id];
  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  const nav = { onBack, onServices, onContact };
  return (
    <div className="relative keep-dark-bg" style={{ background: '#232323', minHeight: '100vh', paddingTop: 79, paddingBottom: 90 }}>
      <div className="relative grain fade-in" style={{ width: 1341, marginLeft: 274, background: '#fafaf8', borderRadius: 6, padding: `0 ${pad}px 80px`, minHeight: 800 }}>
        <div className="absolute flex items-center justify-between" style={{ left: 9, right: 10, top: 13, height: 31 }}>
          <div style={{ flex: 1, height: '100%', background: bar, marginRight: 20 }} />
          <WindowButtons onClose={onBack} color="#222" />
        </div>
        <div className="absolute" style={{ left: 34, top: 62, fontSize: 15 }}>Portfolio &gt; Browse &gt; View</div>
        <div style={{ paddingTop: 189 }}>
          <C nav={nav} />
        </div>
      </div>
    </div>
  );
}
