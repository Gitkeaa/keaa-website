import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Factory, ShieldCheck } from 'lucide-react';

const LOADER_DURATION = 3100;
const EXIT_DURATION = 400;

const stats = [
  { value: '42+', label: 'COUNTRIES', icon: Globe },
  { value: '5+', label: 'MANUFACTURING FACILITIES', icon: Factory },
  { value: '20+', label: 'YEARS OF TRUST', icon: ShieldCheck },
];

/* ---- Dotted world map ------------------------------------------------------
   Continents are approximated as unions of ellipses in a 200 x 100 map space
   (2:1, like an equirectangular world map). We drop a staggered dot grid and
   keep only the dots that fall on "land" — giving the dot-matrix world look. */
const CONTINENTS = [
  // North America
  { cx: 38, cy: 28, rx: 15, ry: 12 },
  { cx: 30, cy: 20, rx: 10, ry: 7 },
  { cx: 46, cy: 38, rx: 6, ry: 6 },
  // Greenland
  { cx: 64, cy: 13, rx: 6, ry: 5 },
  // South America
  { cx: 55, cy: 66, rx: 7, ry: 15 },
  { cx: 51, cy: 56, rx: 6, ry: 6 },
  // Europe
  { cx: 97, cy: 25, rx: 9, ry: 7 },
  // Africa
  { cx: 103, cy: 55, rx: 11, ry: 16 },
  { cx: 99, cy: 43, rx: 7, ry: 6 },
  // Asia (broad)
  { cx: 122, cy: 30, rx: 24, ry: 15 },
  { cx: 143, cy: 28, rx: 16, ry: 12 },
  // India
  { cx: 127, cy: 46, rx: 7, ry: 8 },
  // South-East Asia
  { cx: 150, cy: 52, rx: 8, ry: 6 },
  { cx: 156, cy: 60, rx: 6, ry: 5 },
  // Australia
  { cx: 163, cy: 73, rx: 12, ry: 8 },
];

const inLand = (x, y) =>
  CONTINENTS.some((c) => {
    const dx = (x - c.cx) / c.rx;
    const dy = (y - c.cy) / c.ry;
    return dx * dx + dy * dy <= 1;
  });

const MAP_DOTS = (() => {
  const dots = [];
  const step = 2;
  let row = 0;
  for (let y = 4; y <= 96; y += step) {
    const offset = row % 2 ? step / 2 : 0;
    for (let x = 3; x <= 197; x += step) {
      const xx = x + offset;
      if (xx <= 197 && inLand(xx, y)) dots.push({ x: xx, y });
    }
    row += 1;
  }
  return dots;
})();

/* Glowing city nodes + great-circle-style arcs across the map */
const NODES = [
  { x: 40, y: 30 }, { x: 34, y: 22 }, { x: 55, y: 64 }, { x: 97, y: 25 },
  { x: 103, y: 52 }, { x: 127, y: 46 }, { x: 145, y: 32 }, { x: 152, y: 55 },
  { x: 163, y: 71 },
];

const ARCS = [
  [{ x: 40, y: 30 }, { x: 97, y: 25 }],
  [{ x: 97, y: 25 }, { x: 127, y: 46 }],
  [{ x: 127, y: 46 }, { x: 152, y: 55 }],
  [{ x: 40, y: 30 }, { x: 55, y: 64 }],
  [{ x: 97, y: 25 }, { x: 103, y: 52 }],
  [{ x: 145, y: 32 }, { x: 163, y: 71 }],
  [{ x: 34, y: 22 }, { x: 145, y: 32 }],
];

const arcPath = (a, b) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const cy = my - dist * 0.4; // bow upward
  return `M ${a.x} ${a.y} Q ${mx} ${cy} ${b.x} ${b.y}`;
};

// when each arc finishes drawing — used to time the traveling pulse
const arcDrawEnd = (i) => 0.2 + i * 0.12 + 1.2;

// faint drifting stars for atmosphere
const STARS = [
  { top: '12%', left: '8%', d: 0 }, { top: '20%', left: '82%', d: 0.6 },
  { top: '32%', left: '18%', d: 1.1 }, { top: '16%', left: '54%', d: 1.6 },
  { top: '44%', left: '90%', d: 0.3 }, { top: '58%', left: '12%', d: 0.9 },
  { top: '26%', left: '68%', d: 1.4 }, { top: '38%', left: '41%', d: 2.0 },
  { top: '10%', left: '30%', d: 0.5 }, { top: '52%', left: '76%', d: 1.2 },
  { top: '64%', left: '46%', d: 1.8 }, { top: '22%', left: '95%', d: 0.7 },
];

export default function PageLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let frameId;
    const start = performance.now();
    const animate = (time) => {
      const elapsed = Math.min(time - start, LOADER_DURATION);
      setProgress((elapsed / LOADER_DURATION) * 100);
      if (elapsed < LOADER_DURATION) {
        frameId = requestAnimationFrame(animate);
      } else {
        setIsExiting(true);
      }
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!isExiting) return undefined;
    const timer = window.setTimeout(() => onComplete?.(), EXIT_DURATION);
    return () => window.clearTimeout(timer);
  }, [isExiting, onComplete]);

  const pct = Math.min(100, Math.round(progress));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1, filter: isExiting ? 'blur(6px)' : 'blur(0px)' }}
      transition={{ duration: EXIT_DURATION / 1000, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#030a17] text-white"
    >
      {/* deep-space wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(28,79,143,0.28),transparent_55%),radial-gradient(ellipse_at_50%_120%,rgba(58,130,220,0.22),transparent_45%)]" />

      {/* drifting starfield */}
      <div className="absolute inset-0">
        {STARS.map((s, i) => (
          <motion.span
            key={i}
            className="absolute h-[2px] w-[2px] rounded-full bg-white"
            style={{ top: s.top, left: s.left, boxShadow: '0 0 6px rgba(255,255,255,0.6)' }}
            initial={{ opacity: 0.12 }}
            animate={{ opacity: [0.12, 0.85, 0.12] }}
            transition={{ duration: 3.4, repeat: Infinity, delay: s.d, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Dotted world map + connection arcs */}
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 top-0 h-[82%]"
      >
        <svg
          viewBox="0 0 200 100"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD873" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F5B400" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* land dots */}
          <g fill="#4c86c6">
            {MAP_DOTS.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r="0.42" opacity={0.55} />
            ))}
          </g>

          {/* connection arcs (draw themselves in) */}
          <g fill="none" stroke="#F5B400" strokeWidth="0.5" strokeLinecap="round">
            {ARCS.map((arc, i) => (
              <motion.path
                key={i}
                id={`arc-${i}`}
                d={arcPath(arc[0], arc[1])}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 + i * 0.12 }}
                style={{ filter: 'drop-shadow(0 0 1.4px rgba(245,180,0,0.9))' }}
              />
            ))}
          </g>

          {/* light pulses travelling along each arc */}
          <g>
            {ARCS.map((arc, i) => (
              <circle
                key={i}
                r="0.9"
                fill="#FFF1C4"
                opacity="0"
                style={{ filter: 'drop-shadow(0 0 2.2px rgba(255,220,120,0.95))' }}
              >
                <animateMotion
                  dur="2.8s"
                  begin={`${arcDrawEnd(i)}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                >
                  <mpath href={`#arc-${i}`} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  dur="2.8s"
                  begin={`${arcDrawEnd(i)}s`}
                  repeatCount="indefinite"
                  values="0;1;1;0"
                  keyTimes="0;0.12;0.85;1"
                />
              </circle>
            ))}
          </g>

          {/* glowing city nodes */}
          <g>
            {NODES.map((n, i) => (
              <g key={i}>
                <circle cx={n.x} cy={n.y} r="2.4" fill="url(#nodeGlow)" />
                {/* expanding ping ring */}
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r="0.7"
                  fill="none"
                  stroke="#F5B400"
                  strokeWidth="0.35"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 0.55, 0], scale: [0.6, 3.6, 4.4] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    delay: 0.9 + i * 0.2,
                    ease: 'easeOut',
                  }}
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                />
                {/* pulsing core */}
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r="0.7"
                  fill="#FFDD8A"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.35, 1, 0.5], scale: [0.9, 1.15, 0.95] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                />
              </g>
            ))}
          </g>
        </svg>
      </motion.div>

      {/* Earth horizon glow at the bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] overflow-hidden">
        <div
          className="absolute left-1/2 top-6 aspect-square w-[190%] -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(90,160,255,0.22), rgba(3,10,23,0) 46%)',
            boxShadow:
              'inset 0 3px 60px rgba(120,180,255,0.28), 0 -8px 60px rgba(60,130,220,0.25)',
            borderTop: '1.5px solid rgba(150,200,255,0.35)',
          }}
        />
        <div
          className="absolute left-1/2 top-6 aspect-square w-[190%] -translate-x-1/2 rounded-full"
          style={{
            background: 'transparent',
            boxShadow: '0 -1px 22px 1px rgba(245,180,0,0.14)',
          }}
        />
      </div>

      {/* corner slide marker (from the reference) */}
      <span className="absolute left-6 top-5 font-display text-sm font-medium tracking-widest text-white/35">
        02
      </span>

      {/* ---- Centered content --------------------------------------------- */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Logo lockup */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <svg viewBox="0 0 100 100" className="h-16 w-16 drop-shadow-[0_8px_24px_rgba(43,132,218,0.45)]" aria-hidden="true">
            <defs>
              <mask id="loader-cube-mask">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                <line x1="50" y1="50" x2="5" y2="50" stroke="black" strokeWidth="5.5" />
                <line x1="50" y1="50" x2="73" y2="10" stroke="black" strokeWidth="5.5" />
                <line x1="50" y1="50" x2="73" y2="90" stroke="black" strokeWidth="5.5" />
              </mask>
            </defs>
            <g mask="url(#loader-cube-mask)">
              <polygon points="10,50 30,15.36 70,15.36 50,50" fill="#79c7f9" />
              <polygon points="10,50 50,50 70,84.64 30,84.64" fill="#2b84da" />
              <polygon points="50,50 70,15.36 90,50 70,84.64" fill="#2065be" />
            </g>
          </svg>
          <div className="mt-3 leading-none">
            <span className="font-body text-4xl font-bold tracking-tight text-white">keaa</span>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.5em] text-white/55">
              International
            </p>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="mt-8 font-display text-lg font-bold uppercase leading-snug tracking-[0.14em] text-gold-400 sm:text-xl"
        >
          Building Connections.
          <br />
          Delivering Excellence.
        </motion.h1>

        {/* Stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.28 }}
          className="mt-8 flex flex-col divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm sm:flex-row sm:divide-x sm:divide-y-0"
        >
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/10 text-gold-400">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <div className="text-left">
                <p className="font-display text-lg font-bold leading-none text-white">{value}</p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 w-full max-w-md"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/45">
            Connecting Industries Worldwide…
          </p>
          <div className="flex items-center gap-4">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute inset-y-0 left-0 overflow-hidden rounded-full bg-gradient-to-r from-[#F7CC4D] via-[#F5B400] to-[#D99700] shadow-[0_0_20px_rgba(245,180,0,0.5)] transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              >
                {/* moving shine */}
                <motion.span
                  className="absolute inset-y-0 w-10 -skew-x-12 bg-white/45 blur-[2px]"
                  animate={{ x: ['-3rem', '18rem'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>
            <span className="min-w-[3rem] text-right font-display text-sm font-semibold tabular-nums text-gold-400">
              {pct}%
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
