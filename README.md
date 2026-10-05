# toastcraft

Toast notifications for any framework (or none), with **15 built-in designs** and almost every behavior configurable. Zero dependencies, ~10 KB gzipped including all CSS, fully typed.

```bash
npm i toastcraft
```

```ts
import { toast } from 'toastcraft';

toast.success('Changes saved');
toast.error('Upload failed', { description: 'The file is larger than 10 MB.', design: 'brutalist' });
```

No CSS import needed: styles are injected once, on the first toast.

## Designs

| Design | Look |
| --- | --- |
| `minimal` | Clean card, hairline border, soft shadow (default) |
| `pastel` | Background tinted with the type color |
| `glass` | Frosted, translucent, blurred backdrop |
| `neon` | Dark card with glowing type-colored border and title |
| `brutalist` | Thick black border, hard offset shadow, monospace |
| `material` | Material Design snackbar |
| `island` | Black capsule, iOS Dynamic Island style |
| `terminal` | Terminal window with traffic lights and blinking cursor |
| `classic` | Windows 95 dialog with bevels and title bar |
| `gradient` | Vivid gradient derived from the type color |
| `outline` | Transparent card with a colored outline |
| `paper` | Sticky note with tape, slightly rotated |
| `neumorphic` | Soft extruded surface (best on a matching background) |
| `stripe` | Card with a thick colored edge |
| `editorial` | Serif type, small-caps label, print feel |
| `none` | Layout only. Style it yourself with `classNames` |

Every design supports light and dark themes, all six types, actions, progress bars and RTL.

## Showing toasts

```ts
toast('Message sent');                       // default type
toast.success('Saved');
toast.error('Failed');
toast.warning('Storage almost full');
toast.info('New version available');
const id = toast.loading('Uploading…');       // stays until updated or dismissed

toast.update(id, { type: 'success', title: 'Uploaded', duration: 3000 });
toast.dismiss(id);
toast.dismiss();                              // dismiss everything

// Pass an object instead of a string
toast({ type: 'info', title: 'Heads up', description: 'Maintenance at 22:00 IST' });
```

### Promises

```ts
await toast.promise(saveReport(), {
  loading: 'Saving report…',
  success: (report) => `Saved ${report.name}`,
  error: (err) => ({ title: 'Save failed', description: String(err) }),
});
```

### Actions

```ts
toast('Message deleted', {
  actions: [
    { label: 'Undo', onClick: () => restore() },
    { label: 'Dismiss', variant: 'secondary' },
  ],
});
```

### Deduplication

Reusing an `id` updates the existing toast instead of stacking a new one:

```ts
toast.warning('You are offline', { id: 'network', duration: Infinity });
```

### Custom content

`render` receives the body element. Return a cleanup function to unmount framework components.

```ts
toast.custom((el, ctx) => {
  el.innerHTML = `<strong>3 new comments</strong>`;
  el.onclick = () => ctx.dismiss();
});
```

## Per-toast options

| Option | Type | Default | |
| --- | --- | --- | --- |
| `id` | `string` | auto | Reuse to update instead of duplicating |
| `type` | `'default' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'loading'` | `'default'` | |
| `title`, `description` | `string \| Node` | | Strings are escaped unless `html: true` |
| `design` | design name | `'minimal'` | |
| `position` | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'top-right'` | |
| `duration` | `number` (ms) | `4000` (errors `6000`, loading `Infinity`) | `0` or `Infinity` = until dismissed |
| `animation` | `'slide' \| 'fade' \| 'pop' \| 'bounce' \| 'flip' \| 'none'` | `'slide'` | |
| `dismissible` | `boolean` | `true` | Show the close button |
| `closeOnClick` | `boolean` | `false` | |
| `pauseOnHover` | `boolean` | `true` | |
| `pauseOnFocusLoss` | `boolean` | `true` | Pause while the tab is hidden or the window is blurred |
| `progress` | `boolean` | `false` | Countdown bar |
| `swipeToDismiss` | `boolean` | `true` | Drag horizontally (mouse or touch) |
| `swipeThreshold` | `number` | `80` | px |
| `icon` | `string \| Node \| false` | type icon | SVG string, emoji, element, or `false` |
| `accent` | CSS color | type color | Override the accent for one toast |
| `actions` | `ToastAction[]` | | `{ label, onClick, variant, dismiss }` |
| `html` | `boolean` | `false` | Only for trusted content |
| `render` | `(el, ctx) => void \| cleanup` | | Full control of the body |
| `className`, `classNames` | `string`, `{ toast, icon, body, title, description, actions, action, close, progress }` | | Great with Tailwind |
| `style` | `Record<string, string>` | | Inline styles and CSS variables |
| `ariaLive` | `'polite' \| 'assertive' \| 'off'` | errors assertive, others polite | |
| `onShow`, `onDismiss`, `onClick` | callbacks | | `onDismiss` receives the reason |
| `data` | `unknown` | | Your own payload |

## Global configuration

```ts
toast.configure({
  position: 'bottom-center',
  design: 'island',
  theme: 'auto',              // 'light' | 'dark' | 'auto' (follows the OS)
  animation: 'bounce',
  duration: 5000,
  progress: true,
  maxVisible: 3,
  overflow: 'queue',          // or 'dismiss-oldest'
  newestOnTop: true,          // newest toast closest to the screen edge
  offset: { x: 24, y: 24 },
  gap: 12,
  width: 380,
  zIndex: 10000,
  colors: { success: '#0f9d58', error: '#d93025' },
  labels: { error: 'त्रुटि', success: 'सफल' }, // shown by terminal / classic / editorial
  font: '"Inter", sans-serif',
  dir: 'rtl',
  container: '#app',
  nonce: cspNonce,
  typeDefaults: {
    error: { design: 'brutalist', duration: 10000 },
    loading: { dismissible: false },
  },
  toastDefaults: { closeOnClick: true },
});
```

Precedence, lowest to highest: built-in defaults → `configure()` → `toastDefaults` → `typeDefaults[type]` → options passed to the call.

### Multiple independent toasters

```ts
import { createToaster } from 'toastcraft';

const adminToast = createToaster({ position: 'bottom-left', design: 'terminal' });
adminToast.info('Cache cleared');
```

### Events

```ts
const unsubscribe = toast.subscribe((e) => analytics.track(`toast_${e.type}`, e));
```

## Theming

Every design reads CSS custom properties, so you can adjust any of them without writing a new design:

| Variable | Purpose |
| --- | --- |
| `--tc-bg`, `--tc-fg`, `--tc-muted` | Background, text, description text |
| `--tc-accent` | Type color used by icons, buttons, progress |
| `--tc-c-success` … `--tc-c-loading` | Palette (set on the region via `colors`) |
| `--tc-font`, `--tc-font-size` | Typography |
| `--tc-width`, `--tc-gap`, `--tc-offset-x`, `--tc-offset-y`, `--tc-z` | Layout |

```ts
toast('Custom colors', { style: { '--tc-bg': '#1e1b4b', '--tc-fg': '#e0e7ff' } });
```

Or target the markup directly: `.tc-toast[data-design="glass"][data-type="error"] { … }`.

### Register your own design

Use `&` for the toast root and `.tc-dark &` for dark-theme overrides:

```ts
import { registerDesign } from 'toastcraft';

registerDesign('sunset', `
  & { --tc-bg: #ffedd5; --tc-fg: #7c2d12; border-radius: 20px; box-shadow: 0 10px 30px -10px #ea580c; }
  & .tc-title { font-weight: 800; }
  .tc-dark & { --tc-bg: #431407; --tc-fg: #fed7aa; }
`);

toast.success('Looks warm', { design: 'sunset' });
```

## Framework usage

The package is plain DOM, so it works the same everywhere.

**Angular**

```ts
import { Injectable } from '@angular/core';
import { toast, type ToastOptions } from 'toastcraft';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor() { toast.configure({ design: 'minimal', position: 'top-right' }); }
  success(msg: string, opts?: ToastOptions) { return toast.success(msg, opts); }
  error(msg: string, opts?: ToastOptions) { return toast.error(msg, opts); }
  promise = toast.promise;
  dismiss = toast.dismiss;
}
```

Inject it into components, services or an `HttpInterceptor` to surface API errors globally.

**React** — call `toast()` from any handler. To render a component inside a toast:

```tsx
toast.custom((el) => {
  const root = createRoot(el);
  root.render(<InviteCard />);
  return () => root.unmount();
});
```

**Script tag**

```html
<script src="https://unpkg.com/toastcraft"></script>
<script>Toastcraft.toast.success('Hello');</script>
```

## Accessibility

- Each position is a labelled region; toasts use `role="status"` (polite) or `role="alert"` for errors.
- Timers pause while a toast has keyboard focus, on hover, and while the tab is hidden.
- `Escape` dismisses the focused toast.
- `prefers-reduced-motion` disables movement and spinners.
- Text is escaped by default.

## SSR

Importing is safe on the server. Calls during SSR are no-ops; the DOM is only touched in the browser.

## Browser support

Current Chrome, Edge, Firefox and Safari (uses `color-mix()`, `:has()` and grid row transitions; 2023+ browsers).

## License

MIT
