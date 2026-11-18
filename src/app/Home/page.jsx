"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

const fd = Bricolage_Grotesque({ subsets: ["latin"], variable: "--fd" });
const fb = Figtree({ subsets: ["latin"], variable: "--fb" });

// Reused class strings (Tailwind needs them written out in full)
const WRAP = "mx-auto max-w-[1180px] px-[clamp(20px,5vw,40px)]";
const H2 = "font-[family-name:var(--fd)] text-[length:clamp(2rem,4.5vw,3.4rem)] font-bold leading-[1.05] tracking-[-.03em]";
const HEAD = "[grid-area:1/1] max-w-[12ch] font-[family-name:var(--fd)] text-[length:clamp(3.2rem,9.5vw,8.6rem)] font-bold leading-[.95] tracking-[-.045em]";
const BTN = "inline-block rounded-full px-6 py-3.5 font-bold transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none";

const INK = "#0f1f3d";
const COLORS = [INK, "#8a4f1d", "#2347e8", "#d9a21b", "#9fb4c4"];

const SHAPES = {
  round: (x) => <circle cx={x} cy="50" r="30" />,
  square: (x) => <rect x={x - 31} y="22" width="62" height="50" rx="12" />,
  oval: (x) => <ellipse cx={x} cy="50" rx="34" ry="26" />,
  shield: (x) => <path d={`M${x - 31} 26H${x + 31}Q${x + 35} 70 ${x} 76Q${x - 35} 70 ${x - 31} 26Z`} />,
};

function Frames({ shape = "round", color = INK, className = "" }) {
  const id = useId().replace(/:/g, "");
  const Lens = SHAPES[shape];
  return (
    <svg viewBox="0 0 200 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".6" />
          <stop offset=".55" stopColor="#9fd3e6" stopOpacity=".25" />
          <stop offset="1" stopColor="#4f86b8" stopOpacity=".4" />
        </linearGradient>
      </defs>
      <g
        style={{ stroke: color }}
        className="transition-[stroke] duration-300 motion-reduce:transition-none"
        fill={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
      >
        {Lens(55)}
        {Lens(145)}
        <path d="M85 44Q100 34 115 44" fill="none" />
        <path d="M25 40L3 34M175 40L197 34" fill="none" />
      </g>
    </svg>
  );
}

const PRODUCTS = [
  ["Aria", "round", 1990, [0, 1, 3]],
  ["Noor", "square", 2290, [0, 2, 1]],
  ["Luna", "oval", 1890, [1, 4, 0]],
  ["Atlas", "shield", 2790, [0, 3, 1]],
  ["Kite", "round", 2190, [2, 0, 4]],
  ["Onyx", "square", 2490, [1, 0, 3]],
  ["Mira", "oval", 2090, [2, 3, 0]],
  ["Zephyr", "shield", 2990, [4, 0, 2]],
].map(([name, shape, price, c]) => ({ name, shape, price, colors: c.map((i) => COLORS[i]) }));

const TABS = ["All", "Round", "Square", "Oval", "Shield"];

const PERKS = [
  ["Try four at home", "Choose four frames, wear them for 5 days, send them back free."],
  ["Lenses included", "Single-vision lenses with anti-glare and UV400 on every pair."],
  ["30-day returns", "Change the frame or get a refund if the fit feels wrong."],
  ["Delivery", "24 hours in Dhaka, 2 to 3 days everywhere else in Bangladesh."],
];

function Card({ p, onAdd }) {
  const [c, setC] = useState(p.colors[0]);
  const [ok, setOk] = useState(false);
  const [on, setOn] = useState(false);

  // New cards ease in when a shape filter is applied
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <article className={`transition duration-500 motion-reduce:transition-none ${on ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
      <div className="mb-3.5 grid aspect-[5/4] place-items-center rounded-[6px_44px_6px_44px] bg-white">
        <Frames shape={p.shape} color={c} className="w-3/4" />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--fd)] text-xl font-bold">{p.name}</h3>
        <span className="font-semibold">৳{p.price.toLocaleString("en-US")}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-2">
          {p.colors.map((k, i) => (
            <button
              key={k}
              aria-label={`Colour ${i + 1}`}
              aria-pressed={k === c}
              onClick={() => setC(k)}
              style={{ background: k }}
              className={`h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-[#eef3f7] transition ${k === c ? "ring-[#0f1f3d]" : "ring-transparent"}`}
            />
          ))}
        </div>
        <button
          className="rounded-full bg-[#0f1f3d] px-3.5 py-2 text-sm font-semibold text-white"
          onClick={() => {
            onAdd();
            setOk(true);
            setTimeout(() => setOk(false), 1400);
          }}
        >
          {ok ? "Added" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const wrap = useRef(null);
  const headingRef = useRef(null);
  const touched = useRef(false);
  const [cart, setCart] = useState(0);
  const [bump, setBump] = useState(false);
  const [tab, setTab] = useState("All");

  // The lens drifts across the headline until the visitor takes over.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    let animationFrameId;

    const animateLens = (time) => {
      if (!touched.current) {
        const { width, height } = el.getBoundingClientRect();
        const x = width * (0.45 + 0.35 * Math.sin(time / 1700));
        const y = height * (0.5 + 0.25 * Math.sin(time / 1100));

        setLensPosition(x, y);
      }

      animationFrameId = window.requestAnimationFrame(animateLens);
    };

    animationFrameId = window.requestAnimationFrame(animateLens);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Keep the outer glass and the heading's clipping circle in sync.
  // The glass is positioned relative to the wrapper, while clip-path
  // coordinates are relative to the heading element itself.
  const setLensPosition = (x, y) => {
    const el = wrap.current;
    const heading = headingRef.current;
    if (!el || !heading) return;

    const wrapperRect = el.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();

    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
    el.style.setProperty("--clip-x", `${x - (headingRect.left - wrapperRect.left)}px`);
    el.style.setProperty("--clip-y", `${y - (headingRect.top - wrapperRect.top)}px`);
  };

  const move = (e) => {
    if (!wrap.current) return;

    touched.current = true;
    const r = wrap.current.getBoundingClientRect();
    setLensPosition(e.clientX - r.left, e.clientY - r.top);
  };

  const addToCart = () => {
    setCart((n) => n + 1);
    setBump(true);
    setTimeout(() => setBump(false), 200);
  };

  const shown = PRODUCTS.filter((p) => tab === "All" || p.shape === tab.toLowerCase());

  return (
    <main className={`${fd.variable} ${fb.variable} overflow-x-hidden bg-[#eef3f7] font-[family-name:var(--fb)] text-[#0f1f3d]`}>
      {/* Hero */}
      <section className="flex min-h-screen flex-col bg-[#2347e8] px-[clamp(20px,5vw,64px)] pb-16 text-white">
        <nav className="flex items-center justify-between py-5">
          <a href="#" className="flex items-center gap-2.5 font-[family-name:var(--fd)] text-2xl font-bold">
            <Frames color="#fff" className="w-11" />
            Verra
          </a>
          <div className="hidden gap-8 sm:flex">
            <a href="#shop">Shop</a>
            <a href="#perks">Why Verra</a>
            <a href="#test">Eye test</a>
          </div>
          <button className="rounded-full px-4 py-1.5 ring-2 ring-white">
            Cart{" "}
            <b className={`inline-block min-w-[1ch] transition-transform duration-200 motion-reduce:transition-none ${bump ? "scale-150" : ""}`}>{cart}</b>
          </button>
        </nav>

        <div
          ref={wrap}
          onPointerEnter={() => {
            touched.current = true;
          }}
          onPointerMove={move}
          onPointerLeave={() => {
            touched.current = false;
          }}
          className="relative cursor-default my-auto grid w-fit max-w-full py-[4vh] [--x:300px] [--y:150px] [--clip-x:300px] [--clip-y:150px]"
        >
          <p aria-hidden="true" className={`${HEAD} opacity-50 blur-sm motion-reduce:hidden`}>
            Sharper days start at the lens.
          </p>
          <h1
            ref={headingRef}
            className={`${HEAD} [clip-path:circle(120px_at_var(--clip-x)_var(--clip-y))] max-sm:[clip-path:circle(90px_at_var(--clip-x)_var(--clip-y))] motion-reduce:[clip-path:none]`}
          >
            Sharper days start at the lens.
          </h1>
          <span
            aria-hidden="true"
            className=" pointer-events-none absolute left-[var(--x)] top-[var(--y)] isolate h-60 w-60 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[6px] border-[#ffcf3d] bg-transparent shadow-[0_18px_45px_#0f1f3d55,inset_0_0_0_1px_#ffffffaa] max-sm:h-44 max-sm:w-44 motion-reduce:hidden"
          >
            {/* Transparent glass layer: lets the text show through the lens. */}
            <span
              className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_28%_18%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.07)_14%,rgba(174,224,255,0.035)_42%,rgba(76,151,205,0.025)_72%,rgba(255,255,255,0.10)_100%)] shadow-[inset_0_0_16px_rgba(255,255,255,0.16),inset_0_-10px_20px_rgba(38,111,164,0.08)]"
            />
            {/* Soft reflection near the upper edge of the glass. */}
            <span className="absolute left-[12%] top-[10%] h-[14%] w-[42%] rotate-[-28deg] rounded-full bg-white/25 blur-[3px]" />
            <span className="absolute right-[13%] bottom-[13%] h-[6%] w-[18%] rotate-[-28deg] rounded-full bg-white/15 blur-[2px]" />
          </span>
        </div>

        <p className="mb-7 max-w-[46ch] text-lg">
          Prescription-ready frames from ৳1,890, with anti-glare lenses included. Try four pairs at home, free.
        </p>
        <div className="flex flex-wrap gap-3.5">
          <a href="#shop" className={`${BTN} bg-[#ffcf3d] text-[#0f1f3d]`}>Shop frames</a>
          <a href="#perks" className={`${BTN} ring-2 ring-inset ring-white`}>How home try-on works</a>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className={`${WRAP} pt-24`}>
        <h2 className={H2}>Pick a shape, then a colour.</h2>
        <div className="mb-9 mt-7 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              aria-pressed={t === tab}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 ring-2 ring-inset ring-[#0f1f3d] transition-colors ${t === tab ? "bg-[#0f1f3d] text-white" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-7 gap-y-9">
          {shown.map((p) => (
            <Card key={p.name} p={p} onAdd={addToCart} />
          ))}
        </div>
      </section>

      {/* Perks */}
      <section id="perks" className={`${WRAP} pt-24`}>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
          {PERKS.map(([t, d]) => (
            <div key={t} className="border-t-2 border-[#0f1f3d] pt-4">
              <dt className="mb-1.5 font-[family-name:var(--fd)] text-xl font-bold">{t}</dt>
              <dd className="max-w-[34ch]">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Eye test */}
      <section id="test" className="mt-24 bg-[#ffcf3d] py-[72px]">
        <div className={`${WRAP} grid justify-items-start gap-4`}>
          <h2 className={H2}>Not sure of your prescription?</h2>
          <p className="max-w-[52ch] text-lg">Book a free eye test at a partner clinic, then order with your result.</p>
          <a href="#" className={`${BTN} bg-[#0f1f3d] text-white`}>Book an eye test</a>
        </div>
      </section>

      <footer className={`${WRAP} py-7 text-sm`}>© 2026 Verra Eyewear</footer>
    </main>
  );
}