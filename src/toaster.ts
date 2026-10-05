import { closeIcon, icons } from './icons';
import { injectStyles } from './styles';
import type {
  Content,
  DismissReason,
  Position,
  PromiseMessages,
  ToastContext,
  ToasterConfig,
  ToastEvent,
  ToastId,
  ToastOptions,
  ToastType,
} from './types';

type State = 'queued' | 'enter' | 'visible' | 'leave';

interface ToastRecord {
  id: ToastId;
  raw: ToastOptions;
  opts: ToastOptions & { type: ToastType; position: Position };
  item: HTMLDivElement;
  toast: HTMLDivElement;
  state: State;
  remaining: number;
  startedAt: number;
  timer?: ReturnType<typeof setTimeout>;
  pauses: Set<string>;
  cleanup?: () => void;
  ctx: ToastContext;
  suppressClick?: boolean;
}

type ResolvedConfig = ToasterConfig &
  Required<Pick<ToasterConfig,
    | 'position' | 'design' | 'theme' | 'animation' | 'duration' | 'dismissible' | 'closeOnClick' | 'pauseOnHover'
    | 'pauseOnFocusLoss' | 'progress' | 'swipeToDismiss' | 'swipeThreshold' | 'maxVisible' | 'overflow'
    | 'newestOnTop' | 'offset' | 'gap' | 'width' | 'zIndex' | 'injectStyles' | 'ariaLabel' | 'closeOnEscape'>> & {
    labels: Record<ToastType, string>;
    typeDefaults: NonNullable<ToasterConfig['typeDefaults']>;
  };

const DEFAULTS: ResolvedConfig = {
  position: 'top-right',
  design: 'minimal',
  theme: 'auto',
  animation: 'slide',
  duration: 4000,
  dismissible: true,
  closeOnClick: false,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  progress: false,
  swipeToDismiss: true,
  swipeThreshold: 80,
  maxVisible: 5,
  overflow: 'dismiss-oldest',
  newestOnTop: true,
  offset: 16,
  gap: 10,
  width: 360,
  zIndex: 9999,
  injectStyles: true,
  ariaLabel: 'Notifications',
  closeOnEscape: true,
  labels: { default: 'Notice', success: 'Success', error: 'Error', warning: 'Warning', info: 'Info', loading: 'Loading' },
  typeDefaults: { error: { duration: 6000 }, loading: { duration: Infinity } },
};

const TOAST_KEYS_FROM_CONFIG = [
  'position', 'design', 'animation', 'duration', 'dismissible', 'closeOnClick', 'pauseOnHover',
  'pauseOnFocusLoss', 'progress', 'swipeToDismiss', 'swipeThreshold',
] as const;

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';
const px = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v);
let counter = 0;
const genId = () => `tc-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Shallow merge that ignores `undefined`, so `{ duration: undefined }` never wipes a default. */
function merge<T extends object>(...parts: (Partial<T> | undefined)[]): T {
  const out: Record<string, unknown> = {};
  for (const p of parts) {
    if (!p) continue;
    for (const [k, v] of Object.entries(p)) if (v !== undefined) out[k] = v;
  }
  return out as T;
}

function toOptions(input: Content | ToastOptions | undefined): ToastOptions {
  if (input == null) return {};
  if (typeof input === 'string' || (typeof Node !== 'undefined' && input instanceof Node)) return { title: input as Content };
  return input as ToastOptions;
}

export class Toaster {
  private config: ResolvedConfig;
  private regions = new Map<Position, HTMLElement>();
  private records = new Map<ToastId, ToastRecord>();
  private queue: ToastRecord[] = [];
  private listeners = new Set<(e: ToastEvent) => void>();
  private globalBound = false;
  private darkQuery?: MediaQueryList;
  private motionQuery?: MediaQueryList;
  private focusLost = false;

  constructor(config: ToasterConfig = {}) {
    this.config = merge<ResolvedConfig>(DEFAULTS, config as Partial<ResolvedConfig>);
    this.config.labels = { ...DEFAULTS.labels, ...config.labels };
    this.config.typeDefaults = { ...DEFAULTS.typeDefaults, ...config.typeDefaults };
  }

  /* ───────────────────────── public API ───────────────────────── */

  configure(config: ToasterConfig): void {
    const labels = { ...this.config.labels, ...config.labels };
    const typeDefaults = { ...this.config.typeDefaults, ...config.typeDefaults };
    this.config = merge<ResolvedConfig>(this.config, config as Partial<ResolvedConfig>);
    this.config.labels = labels;
    this.config.typeDefaults = typeDefaults;
    this.regions.forEach((r) => this.styleRegion(r));
    this.records.forEach((r) => this.render(r));
  }

  getConfig(): Readonly<ToasterConfig> {
    return { ...this.config };
  }

  show(message: Content | ToastOptions, options?: ToastOptions): ToastId {
    const raw = merge<ToastOptions>(toOptions(message), options);
    if (!isBrowser()) return raw.id ?? genId();

    if (raw.id && this.records.has(raw.id)) {
      const existing = this.records.get(raw.id)!;
      if (existing.state !== 'leave') {
        this.update(raw.id, raw);
        return raw.id;
      }
    }

    this.ensureGlobal();
    const id = raw.id ?? genId();
    const rec = this.createRecord(id, raw);
    this.records.set(id, rec);

    const active = this.activeIn(rec.opts.position);
    const max = this.config.maxVisible;
    if (max > 0 && active.length >= max) {
      if (this.config.overflow === 'queue') {
        this.queue.push(rec);
        return id;
      }
      // Drop the oldest ones so the new toast fits.
      active.slice(0, active.length - max + 1).forEach((r) => this.dismissRecord(r, 'overflow'));
    }
    this.mount(rec);
    return id;
  }

  update(id: ToastId, options: ToastOptions, replace = false): void {
    const rec = this.records.get(id);
    if (!rec || rec.state === 'leave') return;
    const typeChanged = options.type !== undefined && options.type !== rec.opts.type;
    rec.raw = replace ? { ...options, id } : merge(rec.raw, options);
    const position = rec.opts.position; // toasts never jump between regions
    rec.opts = { ...this.resolve(rec.raw), position };
    if (rec.state === 'queued') return;
    this.render(rec);
    if (typeChanged || options.duration !== undefined || replace) this.startTimer(rec);
    this.emit({ type: 'update', id, options: rec.opts });
  }

  dismiss(id?: ToastId): void {
    if (id === undefined) {
      this.queue.forEach((r) => this.records.delete(r.id));
      this.queue = [];
      this.records.forEach((r) => this.dismissRecord(r, 'programmatic'));
      return;
    }
    const rec = this.records.get(id);
    if (rec) this.dismissRecord(rec, 'programmatic');
  }

  isActive(id: ToastId): boolean {
    const r = this.records.get(id);
    return !!r && r.state !== 'leave';
  }

  promise<T>(promise: Promise<T> | (() => Promise<T>), messages: PromiseMessages<T>, options: ToastOptions = {}): Promise<T> {
    const p = typeof promise === 'function' ? promise() : promise;
    const id = this.show(merge<ToastOptions>(options, toOptions(messages.loading as Content | ToastOptions), { type: 'loading' }));
    const finish = (type: ToastType, msg: unknown) =>
      this.update(id, merge<ToastOptions>(options, toOptions(msg as Content | ToastOptions), { type }), true);
    p.then(
      (data) => finish('success', typeof messages.success === 'function' ? messages.success(data) : messages.success),
      (err) => finish('error', typeof messages.error === 'function' ? messages.error(err) : messages.error),
    );
    return p;
  }

  /** Listen to show / update / dismiss events (handy for framework adapters and analytics). */
  subscribe(listener: (e: ToastEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Remove every toast and DOM node created by this toaster. */
  destroy(): void {
    this.records.forEach((r) => {
      clearTimeout(r.timer);
      r.cleanup?.();
    });
    this.records.clear();
    this.queue = [];
    this.regions.forEach((r) => r.remove());
    this.regions.clear();
    if (this.globalBound) {
      document.removeEventListener('visibilitychange', this.onVisibility);
      window.removeEventListener('blur', this.onBlur);
      window.removeEventListener('focus', this.onFocus);
      this.darkQuery?.removeEventListener?.('change', this.onScheme);
      this.globalBound = false;
    }
  }

  /* ───────────────────────── internals ───────────────────────── */

  private resolve(raw: ToastOptions): ToastRecord['opts'] {
    const c = this.config;
    const fromConfig: ToastOptions = {};
    for (const k of TOAST_KEYS_FROM_CONFIG) (fromConfig as Record<string, unknown>)[k] = c[k];
    const type = raw.type ?? c.toastDefaults?.type ?? 'default';
    return merge(fromConfig, c.toastDefaults, c.typeDefaults?.[type], raw, { type }) as ToastRecord['opts'];
  }

  private createRecord(id: ToastId, raw: ToastOptions): ToastRecord {
    const item = document.createElement('div');
    item.className = 'tc-item';
    item.innerHTML = '<div class="tc-clip"><div class="tc-spacer"></div></div>';
    const toast = document.createElement('div');
    item.firstElementChild!.firstElementChild!.appendChild(toast);

    const rec = { id, raw, item, toast, state: 'queued', remaining: 0, startedAt: 0, pauses: new Set() } as unknown as ToastRecord;
    rec.opts = this.resolve(raw);
    rec.ctx = {
      id,
      element: toast,
      dismiss: () => this.dismissRecord(rec, 'programmatic'),
      update: (o) => this.update(id, o),
    };
    this.bindToast(rec);
    return rec;
  }

  private mount(rec: ToastRecord): void {
    if (this.config.injectStyles) injectStyles(this.config.nonce);
    const region = this.region(rec.opts.position);
    this.render(rec);
    rec.item.dataset.state = 'enter';
    if (this.config.newestOnTop) region.prepend(rec.item);
    else region.append(rec.item);
    rec.state = 'enter';
    void rec.item.offsetHeight; // commit the hidden pose so the transition runs
    rec.state = 'visible';
    rec.item.dataset.state = 'visible';
    if (this.focusLost && rec.opts.pauseOnFocusLoss) this.pause(rec, 'focus-loss');
    this.startTimer(rec);
    rec.opts.onShow?.(rec.ctx);
    this.emit({ type: 'show', id: rec.id, options: rec.opts });
  }

  private render(rec: ToastRecord): void {
    const o = rec.opts;
    const t = rec.toast;
    const cn = o.classNames ?? {};
    rec.cleanup?.();
    rec.cleanup = undefined;

    t.className = ['tc-toast', o.className, cn.toast].filter(Boolean).join(' ');
    t.removeAttribute('style');
    t.dataset.design = o.design!;
    t.dataset.type = o.type;
    t.dataset.anim = o.animation!;
    t.setAttribute('role', o.type === 'error' ? 'alert' : 'status');
    t.setAttribute('aria-live', o.ariaLive ?? (o.type === 'error' ? 'assertive' : 'polite'));
    t.setAttribute('aria-atomic', 'true');
    t.toggleAttribute('data-clickable', !!(o.closeOnClick || o.onClick));
    t.style.setProperty('--tc-label', JSON.stringify(this.config.labels[o.type] ?? o.type));
    if (o.accent) t.style.setProperty('--tc-accent', o.accent);
    for (const [k, v] of Object.entries(o.style ?? {})) {
      if (k.startsWith('--')) t.style.setProperty(k, v);
      else (t.style as unknown as Record<string, string>)[k] = v;
    }
    t.textContent = '';

    // Icon
    const iconSrc = o.icon === undefined ? icons[o.type] : o.icon;
    if (iconSrc !== false && iconSrc !== null && iconSrc !== '') {
      const icon = this.el('div', 'tc-icon', cn.icon);
      if (typeof iconSrc === 'string') {
        if (iconSrc.trim().startsWith('<')) icon.innerHTML = iconSrc;
        else icon.textContent = iconSrc; // emoji / text
      } else icon.appendChild(iconSrc);
      t.appendChild(icon);
    }

    // Body
    const body = this.el('div', 'tc-body', cn.body);
    t.appendChild(body);
    if (o.render) {
      const c = o.render(body, rec.ctx);
      if (typeof c === 'function') rec.cleanup = c;
    } else {
      const title = this.el('div', 'tc-title', cn.title);
      const desc = this.el('div', 'tc-desc', cn.description);
      this.setContent(title, o.title, o.html);
      this.setContent(desc, o.description, o.html);
      body.append(title, desc);
    }

    // Actions
    if (o.actions?.length) {
      const wrap = this.el('div', 'tc-actions', cn.actions);
      for (const a of o.actions) {
        const btn = this.el('button', 'tc-action', cn.action) as HTMLButtonElement;
        btn.type = 'button';
        btn.textContent = a.label;
        btn.dataset.variant = a.variant ?? 'primary';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          a.onClick?.(rec.ctx, e);
          if (a.dismiss !== false) this.dismissRecord(rec, 'action');
        });
        wrap.appendChild(btn);
      }
      body.appendChild(wrap);
    }

    // Close button
    if (o.dismissible) {
      const close = this.el('button', 'tc-close', cn.close) as HTMLButtonElement;
      close.type = 'button';
      close.setAttribute('aria-label', 'Dismiss notification');
      close.innerHTML = closeIcon;
      close.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dismissRecord(rec, 'close-button');
      });
      t.appendChild(close);
    }

    // Progress bar (only when there is a countdown)
    if (o.progress && this.isTimed(o)) {
      const prog = this.el('div', 'tc-progress', cn.progress);
      prog.innerHTML = '<div class="tc-progress-bar"></div>';
      t.style.setProperty('--tc-duration', `${o.duration}ms`);
      t.appendChild(prog);
    }
    t.toggleAttribute('data-paused', rec.pauses.size > 0);
  }

  private setContent(el: HTMLElement, value: Content | undefined, html?: boolean) {
    if (value == null) return;
    if (typeof value === 'string') {
      if (html) el.innerHTML = value;
      else el.textContent = value;
    } else el.appendChild(value);
  }

  private el(tag: string, base: string, extra?: string): HTMLElement {
    const e = document.createElement(tag);
    e.className = extra ? `${base} ${extra}` : base;
    return e;
  }

  private isTimed(o: ToastOptions) {
    return typeof o.duration === 'number' && o.duration > 0 && Number.isFinite(o.duration);
  }

  /* ── timers ── */

  private startTimer(rec: ToastRecord) {
    clearTimeout(rec.timer);
    rec.timer = undefined;
    if (!this.isTimed(rec.opts)) return;
    rec.remaining = rec.opts.duration!;
    // Restart the progress animation.
    const bar = rec.toast.querySelector('.tc-progress-bar');
    if (bar) bar.replaceWith(bar.cloneNode());
    if (rec.pauses.size === 0) this.runTimer(rec);
  }

  private runTimer(rec: ToastRecord) {
    rec.startedAt = Date.now();
    rec.timer = setTimeout(() => this.dismissRecord(rec, 'timeout'), rec.remaining);
  }

  private pause(rec: ToastRecord, reason: string) {
    if (rec.pauses.size === 0 && rec.timer !== undefined) {
      clearTimeout(rec.timer);
      rec.timer = undefined;
      rec.remaining = Math.max(0, rec.remaining - (Date.now() - rec.startedAt));
    }
    rec.pauses.add(reason);
    rec.toast.toggleAttribute('data-paused', true);
  }

  private resume(rec: ToastRecord, reason: string) {
    if (!rec.pauses.delete(reason) || rec.pauses.size > 0) return;
    rec.toast.toggleAttribute('data-paused', false);
    if (rec.state === 'visible' && this.isTimed(rec.opts)) this.runTimer(rec);
  }

  /* ── dismissal ── */

  private dismissRecord(rec: ToastRecord, reason: DismissReason) {
    if (rec.state === 'leave') return;
    if (rec.state === 'queued') {
      this.queue = this.queue.filter((r) => r !== rec);
      this.records.delete(rec.id);
      return;
    }
    clearTimeout(rec.timer);
    rec.state = 'leave';
    rec.item.dataset.state = 'leave';
    if (reason !== 'swipe') {
      rec.toast.style.transform = '';
      rec.toast.style.opacity = '';
    }
    rec.cleanup?.();
    rec.cleanup = undefined;
    this.records.delete(rec.id);
    rec.opts.onDismiss?.(rec.ctx, reason);
    this.emit({ type: 'dismiss', id: rec.id, reason });

    const anim = rec.opts.animation;
    const reduced = this.motionQuery?.matches;
    const wait = anim === 'none' || reduced ? 0 : anim === 'bounce' ? 560 : 420;
    setTimeout(() => {
      rec.item.remove();
      this.pump(rec.opts.position);
    }, wait);
  }

  private pump(position: Position) {
    const max = this.config.maxVisible;
    while (this.queue.length) {
      const idx = this.queue.findIndex((r) => r.opts.position === position);
      if (idx < 0) return;
      if (max > 0 && this.activeIn(position).length >= max) return;
      const [next] = this.queue.splice(idx, 1);
      this.mount(next);
    }
  }

  private activeIn(position: Position): ToastRecord[] {
    // Oldest first
    return [...this.records.values()].filter(
      (r) => r.opts.position === position && (r.state === 'visible' || r.state === 'enter'),
    );
  }

  /* ── interaction ── */

  private bindToast(rec: ToastRecord) {
    const t = rec.toast;
    t.addEventListener('mouseenter', () => rec.opts.pauseOnHover && this.pause(rec, 'hover'));
    t.addEventListener('mouseleave', () => this.resume(rec, 'hover'));
    t.addEventListener('focusin', () => this.pause(rec, 'focus'));
    t.addEventListener('focusout', (e) => {
      if (!t.contains(e.relatedTarget as Node)) this.resume(rec, 'focus');
    });
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.config.closeOnEscape) {
        e.stopPropagation();
        this.dismissRecord(rec, 'escape');
      }
    });
    t.addEventListener('click', (e) => {
      if (rec.suppressClick) return void (rec.suppressClick = false);
      if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
      rec.opts.onClick?.(rec.ctx, e);
      if (rec.opts.closeOnClick) this.dismissRecord(rec, 'click');
    });

    // Swipe / drag to dismiss
    let startX = 0;
    let startT = 0;
    let dx = 0;
    let dragging = false;
    let pointerId = -1;
    t.addEventListener('pointerdown', (e) => {
      if (!rec.opts.swipeToDismiss || e.button !== 0) return;
      if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startT = Date.now();
      dx = 0;
      dragging = false;
    });
    t.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pointerId) return;
      dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) > 6) {
        dragging = true;
        t.setPointerCapture?.(e.pointerId);
        t.toggleAttribute('data-swiping', true);
        this.pause(rec, 'drag');
      }
      if (dragging) {
        t.style.transform = `translateX(${dx}px)`;
        t.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / (t.offsetWidth || 300)));
      }
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = -1;
      if (!dragging) return;
      dragging = false;
      rec.suppressClick = true;
      setTimeout(() => (rec.suppressClick = false), 0);
      t.toggleAttribute('data-swiping', false);
      const velocity = Math.abs(dx) / Math.max(1, Date.now() - startT);
      if (Math.abs(dx) >= (rec.opts.swipeThreshold ?? 80) || velocity > 0.6) {
        t.style.transform = `translateX(${dx > 0 ? 120 : -120}%)`;
        t.style.opacity = '0';
        this.dismissRecord(rec, 'swipe');
      } else {
        t.style.transform = '';
        t.style.opacity = '';
        this.resume(rec, 'drag');
      }
    };
    t.addEventListener('pointerup', end);
    t.addEventListener('pointercancel', end);
  }

  /* ── regions & global listeners ── */

  private region(position: Position): HTMLElement {
    let r = this.regions.get(position);
    if (r && r.isConnected) return r;
    r = document.createElement('section');
    r.className = 'tc-region';
    r.dataset.position = position;
    this.styleRegion(r);
    const c = this.config.container;
    const parent = (typeof c === 'string' ? document.querySelector(c) : c) ?? document.body;
    parent.appendChild(r);
    this.regions.set(position, r);
    return r;
  }

  private styleRegion(r: HTMLElement) {
    const c = this.config;
    r.setAttribute('aria-label', `${c.ariaLabel} (${r.dataset.position?.replace('-', ' ')})`);
    r.setAttribute('aria-live', 'polite');
    if (c.dir) r.setAttribute('dir', c.dir);
    else r.removeAttribute('dir');
    r.dataset.theme = this.resolvedTheme();
    const off = typeof c.offset === 'object' && c.offset !== null ? c.offset : { x: c.offset, y: c.offset };
    const vars: Record<string, string | undefined> = {
      '--tc-z': String(c.zIndex),
      '--tc-width': px(c.width),
      '--tc-gap': px(c.gap),
      '--tc-offset-x': px(off.x ?? 16),
      '--tc-offset-y': px(off.y ?? 16),
      '--tc-font': c.font,
    };
    for (const [type, color] of Object.entries(c.colors ?? {})) vars[`--tc-c-${type}`] = color;
    for (const [k, v] of Object.entries(vars)) {
      if (v) r.style.setProperty(k, v);
      else r.style.removeProperty(k);
    }
  }

  private resolvedTheme(): 'light' | 'dark' {
    const t = this.config.theme;
    if (t === 'auto') return this.darkQuery?.matches ? 'dark' : 'light';
    return t ?? 'light';
  }

  private onScheme = () => this.regions.forEach((r) => (r.dataset.theme = this.resolvedTheme()));
  private setFocusLost(lost: boolean) {
    this.focusLost = lost;
    this.records.forEach((r) => {
      if (!r.opts.pauseOnFocusLoss || r.state === 'queued') return;
      if (lost) this.pause(r, 'focus-loss');
      else this.resume(r, 'focus-loss');
    });
  }
  private onVisibility = () => this.setFocusLost(document.hidden);
  private onBlur = () => this.setFocusLost(true);
  private onFocus = () => this.setFocusLost(false);

  private ensureGlobal() {
    if (this.globalBound) return;
    this.globalBound = true;
    if (window.matchMedia) {
      this.darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.darkQuery.addEventListener?.('change', this.onScheme);
    }
    document.addEventListener('visibilitychange', this.onVisibility);
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('focus', this.onFocus);
  }

  private emit(e: ToastEvent) {
    this.listeners.forEach((l) => l(e));
  }
}
