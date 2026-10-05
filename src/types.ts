export type ToastId = string;

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';

export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type BuiltInDesign =
  | 'minimal'
  | 'pastel'
  | 'glass'
  | 'neon'
  | 'brutalist'
  | 'material'
  | 'island'
  | 'terminal'
  | 'classic'
  | 'gradient'
  | 'outline'
  | 'paper'
  | 'neumorphic'
  | 'stripe'
  | 'editorial'
  /** Layout only, no visual styling. Bring your own CSS / Tailwind via `classNames`. */
  | 'none';

/** Any built-in design, or the name of one you registered with `registerDesign`. */
export type DesignName = BuiltInDesign | (string & {});

export type Animation = 'slide' | 'fade' | 'pop' | 'bounce' | 'flip' | 'none';

export type Theme = 'light' | 'dark' | 'auto';

export type DismissReason = 'timeout' | 'close-button' | 'click' | 'swipe' | 'action' | 'programmatic' | 'overflow' | 'escape';

/** Text (escaped by default), a DOM node, or HTML when `html: true`. */
export type Content = string | Node;

export interface ToastAction {
  label: string;
  onClick?: (ctx: ToastContext, event: MouseEvent) => void;
  /** 'primary' is filled with the accent color, 'secondary' is subdued. Default: 'primary'. */
  variant?: 'primary' | 'secondary';
  /** Dismiss the toast after the action runs. Default: true. */
  dismiss?: boolean;
}

export interface ToastClassNames {
  toast: string;
  icon: string;
  body: string;
  title: string;
  description: string;
  actions: string;
  action: string;
  close: string;
  progress: string;
}

export interface ToastContext {
  id: ToastId;
  dismiss: () => void;
  update: (options: ToastOptions) => void;
  element: HTMLElement;
}

export interface ToastOptions {
  /** Stable id. Calling toast() again with the same id updates the existing toast instead of stacking a duplicate. */
  id?: ToastId;
  type?: ToastType;
  title?: Content;
  description?: Content;
  design?: DesignName;
  position?: Position;
  /** Milliseconds before auto-dismiss. `0` or `Infinity` keeps it open until dismissed. */
  duration?: number;
  /** Show the close (×) button. */
  dismissible?: boolean;
  /** Dismiss when the toast body is clicked. */
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  /** Pause timers while the browser tab is hidden or the window loses focus. */
  pauseOnFocusLoss?: boolean;
  /** Show the countdown bar. */
  progress?: boolean;
  swipeToDismiss?: boolean;
  /** Pixels a toast must be dragged before it dismisses. */
  swipeThreshold?: number;
  animation?: Animation;
  /** Custom icon: SVG/emoji string, a DOM node, or `false` to hide it. */
  icon?: string | Node | false | null;
  /** Override the accent color for this toast only (any CSS color). */
  accent?: string;
  actions?: ToastAction[];
  /** Treat string `title` / `description` as HTML. Only enable for trusted content. */
  html?: boolean;
  /**
   * Full control over the toast body. Receives an empty container (the body element).
   * Return a cleanup function to run on dismiss (useful for unmounting React/Vue/Angular components).
   */
  render?: (container: HTMLElement, ctx: ToastContext) => void | (() => void);
  className?: string;
  classNames?: Partial<ToastClassNames>;
  /** Inline styles / CSS custom properties applied to the toast element, e.g. `{ '--tc-bg': '#000' }`. */
  style?: Record<string, string>;
  /** Override screen-reader politeness. Errors default to 'assertive', everything else to 'polite'. */
  ariaLive?: 'polite' | 'assertive' | 'off';
  onShow?: (ctx: ToastContext) => void;
  onDismiss?: (ctx: ToastContext, reason: DismissReason) => void;
  onClick?: (ctx: ToastContext, event: MouseEvent) => void;
  /** Arbitrary user data, handed back in events. */
  data?: unknown;
}

export interface ToasterConfig {
  position?: Position;
  design?: DesignName;
  theme?: Theme;
  animation?: Animation;
  /** Default duration in ms for every type (per-type values in `typeDefaults` win). */
  duration?: number;
  dismissible?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  pauseOnFocusLoss?: boolean;
  progress?: boolean;
  swipeToDismiss?: boolean;
  swipeThreshold?: number;
  /** Max toasts on screen per position. */
  maxVisible?: number;
  /** What happens when `maxVisible` is exceeded. */
  overflow?: 'dismiss-oldest' | 'queue';
  /** Place the newest toast closest to the screen edge. */
  newestOnTop?: boolean;
  /** Distance from the viewport edges. Number = px, or any CSS length. */
  offset?: number | string | { x?: number | string; y?: number | string };
  /** Space between toasts. */
  gap?: number | string;
  /** Toast width. */
  width?: number | string;
  zIndex?: number;
  /** Override the per-type accent colors. */
  colors?: Partial<Record<ToastType, string>>;
  /** Visible type labels used by some designs (terminal, classic, editorial). Translate them here. */
  labels?: Partial<Record<ToastType, string>>;
  /** Font stack applied to designs that don't define their own. */
  font?: string;
  /** Text direction of the toasts. */
  dir?: 'ltr' | 'rtl' | 'auto';
  /** Element (or selector) the toast regions mount into. Default: document.body. */
  container?: HTMLElement | string;
  /** Inject the built-in stylesheet. Turn off if you ship the CSS yourself. */
  injectStyles?: boolean;
  /** CSP nonce for the injected <style> tag. */
  nonce?: string;
  /** Accessible name of each toast region. */
  ariaLabel?: string;
  /** Dismiss the most recent toast with Escape when focus is inside a toast. */
  closeOnEscape?: boolean;
  /** Per-type default options, e.g. `{ error: { duration: 8000, design: 'brutalist' } }`. */
  typeDefaults?: Partial<Record<ToastType, ToastOptions>>;
  /** Defaults merged into every toast. */
  toastDefaults?: ToastOptions;
}

export type ToastEvent =
  | { type: 'show'; id: ToastId; options: ToastOptions }
  | { type: 'update'; id: ToastId; options: ToastOptions }
  | { type: 'dismiss'; id: ToastId; reason: DismissReason };

export interface PromiseMessages<T> {
  loading: Content | ToastOptions;
  success: Content | ToastOptions | ((data: T) => Content | ToastOptions);
  error: Content | ToastOptions | ((error: unknown) => Content | ToastOptions);
}
