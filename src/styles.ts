/* All CSS lives here so the package works from a single JS import (styles are injected once at runtime). */

const T = (d: string) => `.tc-toast[data-design="${d}"]`;
const D = (d: string) => `.tc-region[data-theme="dark"] .tc-toast[data-design="${d}"]`;

const BASE = `
.tc-region{
  --tc-c-default:#4b5563;--tc-c-success:#16a34a;--tc-c-error:#dc2626;--tc-c-warning:#d97706;--tc-c-info:#2563eb;--tc-c-loading:#6b7280;
  position:fixed;z-index:var(--tc-z,9999);width:var(--tc-width,360px);max-width:calc(100vw - 2 * var(--tc-offset-x,16px));
  display:flex;flex-direction:column;margin:0;padding:0;list-style:none;pointer-events:none;box-sizing:border-box;
}
.tc-region[data-theme="dark"]{--tc-c-default:#a1a1aa;--tc-c-success:#22c55e;--tc-c-error:#f87171;--tc-c-warning:#fbbf24;--tc-c-info:#60a5fa;--tc-c-loading:#a1a1aa}
.tc-region[data-position^="top"]{top:var(--tc-offset-y,16px)}
.tc-region[data-position^="bottom"]{bottom:var(--tc-offset-y,16px);flex-direction:column-reverse}
.tc-region[data-position$="left"]{left:var(--tc-offset-x,16px);--tc-sx:-110%;--tc-sy:0}
.tc-region[data-position$="right"]{right:var(--tc-offset-x,16px);--tc-sx:110%;--tc-sy:0}
.tc-region[data-position$="center"]{left:50%;transform:translateX(-50%);--tc-sx:0}
.tc-region[data-position="top-center"]{--tc-sy:-110%}
.tc-region[data-position="bottom-center"]{--tc-sy:110%}
.tc-region[data-stacked="true"]{--tc-stack-overlap:44px}
.tc-region[data-stacked="true"] .tc-item{position:relative}
.tc-region[data-stacked="true"] .tc-item:not(:first-child){margin-top:calc(var(--tc-stack-overlap) * -1)}
.tc-region[data-stacked="true"] .tc-item:nth-child(n+4){opacity:.72}
.tc-region[data-stacked="true"] .tc-item:nth-child(n+5){opacity:.45}
.tc-region[data-stacked="true"] .tc-item:nth-child(n+6){opacity:.25}
.tc-region[data-stacked="true"] .tc-item:hover,.tc-region[data-stacked="true"]:focus-within .tc-item{z-index:2}
.tc-region[data-stacked="true"]:hover .tc-item:not(:first-child),.tc-region[data-stacked="true"]:focus-within .tc-item:not(:first-child){margin-top:0}
.tc-region[data-stacked="true"]:hover .tc-item:nth-child(n+4),.tc-region[data-stacked="true"]:focus-within .tc-item:nth-child(n+4){opacity:1}
[dir="rtl"].tc-region[data-position$="left"]{--tc-sx:-110%}

.tc-item{display:grid;grid-template-rows:1fr;transition:grid-template-rows .32s ease}
.tc-item[data-state="enter"],.tc-item[data-state="leave"]{grid-template-rows:0fr}
.tc-clip{min-height:0}
.tc-region[data-position^="top"] .tc-spacer{padding-bottom:var(--tc-gap,10px)}
.tc-region[data-position^="bottom"] .tc-spacer{padding-top:var(--tc-gap,10px)}

.tc-toast{
  --tc-accent:var(--tc-c-default);--tc-bg:#fff;--tc-fg:#111827;--tc-muted:#4b5563;--tc-ease:cubic-bezier(.21,1.02,.73,1);
  position:relative;display:flex;align-items:flex-start;gap:12px;box-sizing:border-box;padding:14px 16px;
  font-family:var(--tc-font,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif);
  font-size:var(--tc-font-size,14px);line-height:1.45;color:var(--tc-fg);background:var(--tc-bg);
  pointer-events:auto;overflow:hidden;touch-action:pan-y;-webkit-tap-highlight-color:transparent;
  transition:transform .4s var(--tc-ease),opacity .3s ease;
}
.tc-toast[data-type="success"]{--tc-accent:var(--tc-c-success)}
.tc-toast[data-type="error"]{--tc-accent:var(--tc-c-error)}
.tc-toast[data-type="warning"]{--tc-accent:var(--tc-c-warning)}
.tc-toast[data-type="info"]{--tc-accent:var(--tc-c-info)}
.tc-toast[data-type="loading"]{--tc-accent:var(--tc-c-loading)}
.tc-toast[data-clickable]{cursor:pointer}
.tc-toast[data-swiping]{transition:none;user-select:none;cursor:grabbing}

.tc-icon{flex:none;width:20px;height:20px;display:grid;place-items:center;color:var(--tc-accent);margin-top:1px;font-size:18px;line-height:1}
.tc-icon svg{width:100%;height:100%;display:block}
.tc-body{flex:1;min-width:0}
.tc-title{font-weight:600;overflow-wrap:anywhere}
.tc-desc{margin-top:2px;color:var(--tc-muted);overflow-wrap:anywhere}
.tc-title:empty,.tc-desc:empty{display:none}
.tc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.tc-action{appearance:none;font:inherit;font-size:.86em;font-weight:600;line-height:1.2;padding:6px 11px;border-radius:7px;border:1px solid transparent;cursor:pointer;background:var(--tc-accent);color:#fff}
.tc-action[data-variant="secondary"]{background:transparent;color:inherit;border-color:color-mix(in srgb,currentColor 35%,transparent)}
.tc-action:hover{filter:brightness(1.08)}
.tc-region[data-theme="dark"] :where(.tc-action[data-variant="primary"]){color:#0b0b0e}
.tc-close{flex:none;appearance:none;display:grid;place-items:center;width:24px;height:24px;margin:-3px -6px 0 0;padding:0;border:0;border-radius:6px;background:transparent;color:inherit;opacity:.55;cursor:pointer}
.tc-close svg{width:15px;height:15px}
.tc-close:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}
[dir="rtl"] .tc-close{margin:-3px 0 0 -6px}
.tc-toast :focus-visible{outline:2px solid var(--tc-accent);outline-offset:2px}
.tc-toast:focus-visible{outline:2px solid var(--tc-accent);outline-offset:2px}

.tc-progress{position:absolute;left:0;right:0;bottom:0;height:3px;pointer-events:none}
.tc-progress-bar{height:100%;background:var(--tc-accent);transform-origin:left center;animation:tc-progress linear forwards;animation-duration:var(--tc-duration,4000ms)}
[dir="rtl"] .tc-progress-bar{transform-origin:right center}
.tc-toast[data-paused] .tc-progress-bar{animation-play-state:paused}
@keyframes tc-progress{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.tc-spin{animation:tc-spin .9s linear infinite}
@keyframes tc-spin{to{transform:rotate(360deg)}}
@keyframes tc-blink{50%{opacity:0}}

/* Animations: hidden pose while entering / leaving */
.tc-item:not([data-state="visible"]) .tc-toast{opacity:0}
.tc-item:not([data-state="visible"]) .tc-toast[data-anim="slide"]{transform:translate(var(--tc-sx,0),var(--tc-sy,0))}
.tc-toast[data-anim="bounce"]{--tc-ease:cubic-bezier(.34,1.56,.64,1);transition-duration:.55s,.3s}
.tc-item:not([data-state="visible"]) .tc-toast[data-anim="bounce"]{transform:translate(var(--tc-sx,0),var(--tc-sy,0)) scale(.9)}
.tc-item:not([data-state="visible"]) .tc-toast[data-anim="pop"]{transform:scale(.82)}
.tc-toast[data-anim="pop"]{--tc-ease:cubic-bezier(.34,1.4,.64,1)}
.tc-region[data-position^="top"] .tc-toast[data-anim="flip"]{transform-origin:top center}
.tc-region[data-position^="bottom"] .tc-toast[data-anim="flip"]{transform-origin:bottom center}
.tc-item:not([data-state="visible"]) .tc-toast[data-anim="flip"]{transform:perspective(700px) rotateX(-75deg)}
.tc-region[data-position^="bottom"] .tc-item:not([data-state="visible"]) .tc-toast[data-anim="flip"]{transform:perspective(700px) rotateX(75deg)}
.tc-toast[data-anim="none"],.tc-item:has(.tc-toast[data-anim="none"]){transition:none}

@media (prefers-reduced-motion:reduce){
  .tc-toast,.tc-item{transition-duration:.01ms!important}
  .tc-item:not([data-state="visible"]) .tc-toast{transform:none!important}
  .tc-spin{animation:none}
}
`;

const DESIGNS: Record<string, string> = {
  minimal: `
${T('minimal')}{--tc-bg:#fff;--tc-fg:#111827;--tc-muted:#6b7280;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 6px 16px -4px rgba(17,24,39,.08),0 1px 2px rgba(17,24,39,.05)}
${D('minimal')}{--tc-bg:#18181b;--tc-fg:#f4f4f5;--tc-muted:#a1a1aa;border-color:#2e2e33;box-shadow:0 10px 28px -6px rgba(0,0,0,.55)}`,

  pastel: `
${T('pastel')}{--tc-bg:color-mix(in srgb,var(--tc-accent) 11%,#fff);--tc-fg:color-mix(in srgb,var(--tc-accent) 62%,#000);--tc-muted:color-mix(in srgb,var(--tc-accent) 48%,#2b2b2b);border:1px solid color-mix(in srgb,var(--tc-accent) 26%,transparent);border-radius:14px}
${D('pastel')}{--tc-bg:color-mix(in srgb,var(--tc-accent) 16%,#121214);--tc-fg:color-mix(in srgb,var(--tc-accent) 30%,#fff);--tc-muted:color-mix(in srgb,var(--tc-accent) 22%,#c9c9cf)}
${T('pastel')} .tc-action[data-variant="secondary"]{border-color:color-mix(in srgb,var(--tc-accent) 40%,transparent)}`,

  glass: `
${T('glass')}{--tc-bg:rgba(255,255,255,.58);--tc-fg:#0f172a;--tc-muted:#334155;-webkit-backdrop-filter:blur(18px) saturate(180%);backdrop-filter:blur(18px) saturate(180%);border:1px solid rgba(255,255,255,.65);border-radius:18px;box-shadow:0 10px 34px -6px rgba(15,23,42,.22),inset 0 1px 0 rgba(255,255,255,.75)}
${D('glass')}{--tc-bg:rgba(30,30,36,.5);--tc-fg:#f8fafc;--tc-muted:#cbd5e1;border-color:rgba(255,255,255,.12);box-shadow:0 10px 34px -6px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08)}
${T('glass')} .tc-progress{left:18px;right:18px;bottom:5px;height:3px;border-radius:3px;overflow:hidden;background:rgba(127,127,127,.15)}`,

  neon: `
${T('neon')}{--tc-bg:#08080f;--tc-fg:#f2f2ff;--tc-muted:#a4a4c4;border:1px solid var(--tc-accent);border-radius:10px;box-shadow:0 0 0 1px color-mix(in srgb,var(--tc-accent) 35%,transparent),0 0 22px -2px color-mix(in srgb,var(--tc-accent) 60%,transparent),inset 0 0 18px -6px color-mix(in srgb,var(--tc-accent) 55%,transparent)}
${T('neon')}[data-type="success"]{--tc-accent:#3dff8f}${T('neon')}[data-type="error"]{--tc-accent:#ff3d71}${T('neon')}[data-type="warning"]{--tc-accent:#ffd60a}${T('neon')}[data-type="info"]{--tc-accent:#2ad4ff}${T('neon')}[data-type="default"],${T('neon')}[data-type="loading"]{--tc-accent:#c77dff}
${T('neon')} .tc-title{color:var(--tc-accent);text-shadow:0 0 10px color-mix(in srgb,var(--tc-accent) 70%,transparent)}
${T('neon')} .tc-icon{filter:drop-shadow(0 0 6px var(--tc-accent))}
${T('neon')} .tc-action{background:transparent;color:var(--tc-accent);border-color:var(--tc-accent);box-shadow:0 0 10px -2px var(--tc-accent)}
${T('neon')} .tc-progress-bar{box-shadow:0 0 10px var(--tc-accent)}`,

  brutalist: `
${T('brutalist')}{--tc-bg:#fffdf2;--tc-fg:#000;--tc-muted:#1f1f1f;--tc-ink:#000;border:2.5px solid var(--tc-ink);border-radius:0;box-shadow:6px 6px 0 var(--tc-ink);font-family:ui-monospace,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;font-size:13px;margin:0 6px 6px 0}
${D('brutalist')}{--tc-bg:#141414;--tc-fg:#fff;--tc-muted:#d8d8d8;--tc-ink:#f2f2f2}
${T('brutalist')} .tc-title{font-family:"Arial Black","Helvetica Neue",Arial,sans-serif;font-weight:900;font-size:15px;letter-spacing:-.01em}
${T('brutalist')} .tc-icon{width:30px;height:30px;padding:5px;box-sizing:border-box;margin:-2px 0;background:var(--tc-accent);color:#000;border:2px solid var(--tc-ink)}
${T('brutalist')} .tc-action{border-radius:0;border:2px solid var(--tc-ink);color:#000;box-shadow:3px 3px 0 var(--tc-ink);font-family:inherit}
${T('brutalist')} .tc-action[data-variant="secondary"]{background:var(--tc-bg);color:var(--tc-fg)}
${T('brutalist')} .tc-action:active{transform:translate(3px,3px);box-shadow:none}
${T('brutalist')} .tc-close{opacity:1;border:2px solid var(--tc-ink);border-radius:0;margin:-4px -6px 0 0}
${T('brutalist')} .tc-progress{height:5px;border-top:2px solid var(--tc-ink)}`,

  material: `
${T('material')}{--tc-bg:#313033;--tc-fg:#f4eff4;--tc-muted:rgba(244,239,244,.72);border-radius:4px;align-items:center;padding:12px 14px 12px 16px;font-family:Roboto,"Segoe UI",system-ui,sans-serif;letter-spacing:.01em;box-shadow:0 3px 5px -1px rgba(0,0,0,.2),0 6px 10px rgba(0,0,0,.14),0 1px 18px rgba(0,0,0,.12)}
${D('material')}{--tc-bg:#e6e1e5;--tc-fg:#1c1b1f;--tc-muted:rgba(28,27,31,.7)}
${T('material')} .tc-title{font-weight:500}
${T('material')} .tc-icon{color:color-mix(in srgb,var(--tc-accent) 55%,#fff)}
${D('material')} .tc-icon{color:color-mix(in srgb,var(--tc-accent) 60%,#000)}
${T('material')} .tc-action{background:transparent;color:color-mix(in srgb,var(--tc-accent) 50%,#fff);padding:6px 8px;border-radius:4px;letter-spacing:.06em;font-weight:500}
${D('material')} .tc-action{color:color-mix(in srgb,var(--tc-accent) 55%,#000)}
${T('material')} .tc-action:hover{background:color-mix(in srgb,currentColor 10%,transparent);filter:none}
${T('material')} .tc-close{margin:0 -4px 0 0}`,

  island: `
${T('island')}{--tc-bg:#000;--tc-fg:#fff;--tc-muted:rgba(255,255,255,.62);border-radius:30px;align-items:center;padding:10px 14px 10px 10px;box-shadow:0 14px 34px -8px rgba(0,0,0,.45);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif}
${D('island')}{box-shadow:0 0 0 1px rgba(255,255,255,.1),0 14px 34px -8px rgba(0,0,0,.7)}
${T('island')} .tc-icon{width:36px;height:36px;padding:8px;box-sizing:border-box;margin:0;border-radius:50%;background:color-mix(in srgb,var(--tc-accent) 24%,transparent);color:color-mix(in srgb,var(--tc-accent) 70%,#fff)}
${T('island')} .tc-title{font-weight:600}
${T('island')} .tc-desc{margin-top:0;font-size:.93em}
${T('island')} .tc-action{border-radius:999px;background:#fff;color:#000}
${T('island')} .tc-action[data-variant="secondary"]{background:rgba(255,255,255,.14);color:#fff;border-color:transparent}
${T('island')} .tc-close{margin:0;border-radius:50%;background:rgba(255,255,255,.12)}
${T('island')} .tc-progress{left:28px;right:28px;bottom:3px;height:2px;border-radius:2px;overflow:hidden}`,

  terminal: `
${T('terminal')}{--tc-bg:#0d0d0d;--tc-fg:#d6d6d6;--tc-muted:#8b8b8b;font-family:ui-monospace,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;font-size:12.5px;line-height:1.55;border:1px solid #2b2b2b;border-radius:7px;padding:34px 14px 14px;box-shadow:0 16px 36px -10px rgba(0,0,0,.6)}
${T('terminal')}::before{content:"";position:absolute;inset:0 0 auto 0;height:24px;background:#1d1d1d;border-bottom:1px solid #2b2b2b}
${T('terminal')}::after{content:"";position:absolute;top:8px;left:11px;width:9px;height:9px;border-radius:50%;background:#ff5f57;box-shadow:14px 0 #febc2e,28px 0 #28c840}
${T('terminal')} .tc-icon{display:none}
${T('terminal')} .tc-title::before{content:"[" var(--tc-label,"log") "] ";color:var(--tc-accent)}
${T('terminal')} .tc-title{font-weight:600;color:#f0f0f0}
${T('terminal')} .tc-desc{color:var(--tc-muted)}
${T('terminal')} .tc-desc::before{content:"> ";color:var(--tc-accent)}
${T('terminal')} .tc-title::after{content:"\\2588";margin-left:4px;font-size:.85em;color:var(--tc-accent);animation:tc-blink 1.1s steps(1) infinite}
${T('terminal')} .tc-action{background:transparent;color:var(--tc-accent);border:1px dashed var(--tc-accent);border-radius:3px;font-weight:500}
${T('terminal')} .tc-action::before{content:"$ "}
${T('terminal')} .tc-close{position:absolute;top:1px;right:6px;margin:0;width:22px;height:22px}
${T('terminal')} .tc-progress{height:2px}
@media (prefers-reduced-motion:reduce){${T('terminal')} .tc-title::after{animation:none}}`,

  classic: `
${T('classic')}{--tc-bg:#c0c0c0;--tc-fg:#000;--tc-muted:#1a1a1a;--tc-bevel:inset -1px -1px #0a0a0a,inset 1px 1px #fff,inset -2px -2px #808080,inset 2px 2px #dfdfdf;font-family:"Microsoft Sans Serif","MS Sans Serif",Tahoma,Geneva,Verdana,sans-serif;font-size:12px;border-radius:0;padding:32px 12px 14px;box-shadow:var(--tc-bevel),4px 4px 0 rgba(0,0,0,.25)}
${T('classic')}::before{content:var(--tc-label,"Message");position:absolute;top:3px;left:3px;right:3px;height:20px;padding-left:6px;box-sizing:border-box;line-height:20px;font-weight:700;color:#fff;background:linear-gradient(90deg,#000080,#1084d0)}
${T('classic')} .tc-icon{width:28px;height:28px}
${T('classic')} .tc-title{font-weight:700}
${T('classic')} .tc-action{background:#c0c0c0;color:#000;border:0;border-radius:0;min-width:74px;padding:5px 10px;font-weight:400;box-shadow:var(--tc-bevel)}
${T('classic')} .tc-action:active{box-shadow:inset 1px 1px #0a0a0a,inset -1px -1px #fff,inset 2px 2px #808080}
${T('classic')} .tc-action:hover{filter:none}
${T('classic')} .tc-close{position:absolute;top:6px;right:6px;width:18px;height:15px;margin:0;border-radius:0;opacity:1;background:#c0c0c0;color:#000;box-shadow:var(--tc-bevel)}
${T('classic')} .tc-close svg{width:10px;height:10px;stroke-width:3.5}
${T('classic')} .tc-close:hover{background:#c0c0c0}
${T('classic')} .tc-progress{left:12px;right:12px;bottom:5px;height:7px;background:#fff;box-shadow:inset 1px 1px #808080,inset -1px -1px #dfdfdf;padding:1px}
${T('classic')} .tc-progress-bar{background:repeating-linear-gradient(90deg,#000080 0 7px,transparent 7px 9px)}`,

  gradient: `
${T('gradient')}{--tc-fg:#fff;--tc-muted:rgba(255,255,255,.86);--tc-bg:linear-gradient(135deg,var(--tc-accent) 0%,color-mix(in oklch,var(--tc-accent) 55%,#a21caf) 100%);border-radius:16px;box-shadow:0 14px 30px -10px color-mix(in srgb,var(--tc-accent) 70%,transparent)}
${T('gradient')} .tc-icon{color:#fff}
${T('gradient')} .tc-action{background:#fff;color:color-mix(in srgb,var(--tc-accent) 80%,#000)}
${T('gradient')} .tc-action[data-variant="secondary"]{background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.35)}
${T('gradient')} .tc-progress-bar{background:rgba(255,255,255,.75)}`,

  outline: `
${T('outline')}{--tc-bg:#fff;--tc-fg:color-mix(in srgb,var(--tc-accent) 72%,#000);--tc-muted:color-mix(in srgb,var(--tc-accent) 45%,#444);border:1.5px solid var(--tc-accent);border-radius:10px}
${D('outline')}{--tc-bg:#0f0f12;--tc-fg:color-mix(in srgb,var(--tc-accent) 55%,#fff);--tc-muted:color-mix(in srgb,var(--tc-accent) 30%,#bbb)}
${T('outline')} .tc-action{background:transparent;color:var(--tc-fg);border-color:var(--tc-accent)}
${T('outline')} .tc-action[data-variant="primary"]{background:var(--tc-accent);color:var(--tc-bg)}`,

  paper: `
${T('paper')}{--tc-bg:#fff59d;--tc-fg:#3b3100;--tc-muted:#5a4c08;font-family:"Segoe Print","Bradley Hand","Chalkboard SE","Comic Sans MS","Marker Felt",cursive;font-size:14.5px;border-radius:2px 2px 2px 22px / 2px 2px 2px 14px;overflow:visible;rotate:-1.2deg;box-shadow:0 1px 1px rgba(0,0,0,.08),0 12px 18px -8px rgba(60,45,0,.35)}
.tc-item:nth-child(even) ${T('paper')}{rotate:1deg}
${T('paper')}[data-type="success"]{--tc-bg:#c9f2c7;--tc-fg:#0f3d12;--tc-muted:#24532a}
${T('paper')}[data-type="error"]{--tc-bg:#ffcfd2;--tc-fg:#4d0a10;--tc-muted:#6b1f26}
${T('paper')}[data-type="info"]{--tc-bg:#c4e1ff;--tc-fg:#0b2f57;--tc-muted:#24476e}
${T('paper')}[data-type="loading"],${T('paper')}[data-type="default"]{--tc-bg:#f5f0e6;--tc-fg:#2f2a20;--tc-muted:#55503f}
${T('paper')}::before{content:"";position:absolute;top:-9px;left:50%;width:76px;height:20px;translate:-50% 0;rotate:-3deg;background:rgba(255,255,255,.5);box-shadow:0 1px 2px rgba(0,0,0,.08)}
${T('paper')} .tc-icon{color:var(--tc-fg)}
${T('paper')} .tc-action{background:var(--tc-fg);color:var(--tc-bg);border-radius:3px 9px 4px 10px}
${T('paper')} .tc-action[data-variant="secondary"]{background:transparent;color:var(--tc-fg);border:1.5px dashed var(--tc-fg)}
${T('paper')} .tc-progress{left:14px;right:14px;bottom:5px;height:2px}
${T('paper')} .tc-progress-bar{background:var(--tc-fg);opacity:.35}`,

  neumorphic: `
${T('neumorphic')}{--tc-bg:#e6e9ef;--tc-fg:#2d3748;--tc-muted:#5a6578;--tc-sd:#c3c7cf;--tc-sl:#fff;border-radius:20px;padding:16px 18px;box-shadow:9px 9px 18px var(--tc-sd),-9px -9px 18px var(--tc-sl);margin:4px 10px 10px}
${D('neumorphic')}{--tc-bg:#2a2d33;--tc-fg:#e2e8f0;--tc-muted:#a0aec0;--tc-sd:#1c1e22;--tc-sl:#383c44}
${T('neumorphic')} .tc-icon{width:36px;height:36px;padding:9px;box-sizing:border-box;margin:-4px 0;border-radius:50%;box-shadow:inset 3px 3px 6px var(--tc-sd),inset -3px -3px 6px var(--tc-sl)}
${T('neumorphic')} .tc-action{background:var(--tc-bg);color:var(--tc-accent);border-radius:12px;box-shadow:4px 4px 8px var(--tc-sd),-4px -4px 8px var(--tc-sl)}
${T('neumorphic')} .tc-action:active{box-shadow:inset 3px 3px 6px var(--tc-sd),inset -3px -3px 6px var(--tc-sl)}
${T('neumorphic')} .tc-action[data-variant="secondary"]{color:var(--tc-muted);border-color:transparent}
${T('neumorphic')} .tc-close{border-radius:50%}
${T('neumorphic')} .tc-progress{left:20px;right:20px;bottom:6px;height:4px;border-radius:4px;overflow:hidden;box-shadow:inset 1px 1px 2px var(--tc-sd),inset -1px -1px 2px var(--tc-sl)}`,

  stripe: `
${T('stripe')}{--tc-bg:#fff;--tc-fg:#1f2937;--tc-muted:#6b7280;border-radius:8px;border-inline-start:5px solid var(--tc-accent);box-shadow:0 1px 3px rgba(0,0,0,.08),0 10px 26px -8px rgba(0,0,0,.16)}
${D('stripe')}{--tc-bg:#1d1e22;--tc-fg:#f3f4f6;--tc-muted:#9ca3af;box-shadow:0 10px 26px -8px rgba(0,0,0,.6)}
${T('stripe')} .tc-progress-bar{opacity:.45}`,

  editorial: `
${T('editorial')}{--tc-bg:#fbfaf6;--tc-fg:#1b1a17;--tc-muted:#57544c;font-family:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif;font-size:15px;line-height:1.55;border-radius:0;border:1px solid #1b1a17;padding:16px 18px 18px;box-shadow:0 18px 36px -18px rgba(27,26,23,.4)}
${D('editorial')}{--tc-bg:#191814;--tc-fg:#efebe1;--tc-muted:#b3ad9f;border-color:#efebe1}
${T('editorial')} .tc-icon{display:none}
${T('editorial')} .tc-body::before{content:var(--tc-label,"Notice");display:block;margin-bottom:3px;font-variant:small-caps;letter-spacing:.06em;font-size:.86em;color:var(--tc-accent)}
${T('editorial')} .tc-title{font-weight:600;font-size:1.08em;line-height:1.3}
${T('editorial')} .tc-desc{font-style:italic;margin-top:4px}
${T('editorial')} .tc-action{border-radius:0;background:var(--tc-fg);color:var(--tc-bg);font-weight:500;font-size:.85em}
${T('editorial')} .tc-action[data-variant="secondary"]{background:transparent;color:var(--tc-fg);border-color:var(--tc-fg)}
${T('editorial')} .tc-progress{height:2px}`,

  none: ``,
};

export const builtInDesigns = Object.keys(DESIGNS).filter((d) => d !== 'none');

const STYLE_ID = 'toastcraft-styles';
const customDesigns = new Map<string, string>();

export function getCss(): string {
  return BASE + Object.values(DESIGNS).join('\n') + [...customDesigns.values()].join('\n');
}

export function injectStyles(nonce?: string): void {
  if (typeof document === 'undefined') return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    if (nonce) el.nonce = nonce;
    // Prepend so user stylesheets win on equal specificity.
    document.head.prepend(el);
  }
  el.textContent = getCss();
}

/**
 * Register your own design. Use `&` for the toast root, and `.tc-dark &` for dark-theme overrides.
 *
 * registerDesign('sunset', `
 *   & { --tc-bg: #ffedd5; --tc-fg: #7c2d12; border-radius: 20px; }
 *   & .tc-title { font-weight: 800; }
 *   .tc-dark & { --tc-bg: #431407; --tc-fg: #fed7aa; }
 * `)
 */
export function registerDesign(name: string, css: string): void {
  const sel = T(name);
  const dark = D(name);
  const scoped = css.replace(/\.tc-dark\s*&/g, dark).replace(/&/g, sel);
  customDesigns.set(name, scoped);
  if (typeof document !== 'undefined' && document.getElementById(STYLE_ID)) injectStyles();
}

export function listDesigns(): string[] {
  return [...builtInDesigns, ...customDesigns.keys()];
}
