# toastcraft

### Toast notifications without locking you into one visual style.

**15 built-in designs. Zero runtime dependencies. Framework-agnostic. Fully typed.**

[![npm version](https://img.shields.io/npm/v/toastcraft?style=flat-square)](https://www.npmjs.com/package/toastcraft)
[![npm downloads](https://img.shields.io/npm/dm/toastcraft?style=flat-square)](https://www.npmjs.com/package/toastcraft)
[![bundle size](https://img.shields.io/bundlephobia/minzip/toastcraft?style=flat-square)](https://bundlephobia.com/package/toastcraft)
[![license](https://img.shields.io/npm/l/toastcraft?style=flat-square)](https://github.com/AnantDuhan/toastcraft/blob/main/LICENSE)

**[Live Playground →](https://toastcraft.netlify.app/)** · **[npm](https://www.npmjs.com/package/toastcraft)** · **[GitHub](https://github.com/AnantDuhan/toastcraft)**

![toastcraft designs](https://raw.githubusercontent.com/AnantDuhan/toastcraft/main/docs/showcase.svg)

## Install

```bash
npm i toastcraft
```

## Quick start

```ts
import { toast } from 'toastcraft';

toast.success('Changes saved');

toast.error('Upload failed', {
  description: 'The file is larger than 10 MB.',
  design: 'brutalist',
});
```

No CSS import is required. Styles are injected on first use.

## 15 built-in designs

`minimal` · `pastel` · `glass` · `neon` · `brutalist` · `material` · `island` · `terminal` · `classic` · `gradient` · `outline` · `paper` · `neumorphic` · `stripe` · `editorial`

**One API. Completely different visual systems.**

## Why toastcraft?

- **15 built-in designs** instead of one fixed look
- **Framework agnostic** — Angular, React, Vue, vanilla JS and SSR
- **Zero runtime dependencies**
- **Deep configuration** — position, animation, duration, themes, queueing, stacking, actions and progress
- **Promise support** for loading → success/error flows
- **Accessible** — ARIA roles, keyboard dismissal and reduced-motion support
- **Custom designs** through `registerDesign()`
- **Fully typed** with TypeScript

## Common patterns

### Loading and promises

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

### Stacked mode

```ts
toast.configure({
  design: 'glass',
  stacked: true,
  maxVisible: 4,
});
```

Toasts overlap into a compact stack and expand when the region is hovered or focused.

### Deduplication

```ts
toast.warning('You are offline', {
  id: 'network',
  duration: Infinity,
});
```

Calling the same `id` again updates the existing toast instead of creating another one.

## Configuration

```ts
toast.configure({
  position: 'bottom-center',
  design: 'island',
  theme: 'auto',
  animation: 'bounce',
  duration: 5000,
  progress: true,
  stacked: true,
  maxVisible: 3,
  overflow: 'queue',
});
```

Per-toast options can override the global configuration.

## Framework usage

toastcraft uses the DOM directly, so the same API works from Angular, React, Vue, vanilla JavaScript and other browser-based environments.

### Angular

```ts
import { Injectable } from '@angular/core';
import { toast, type ToastOptions } from 'toastcraft';

@Injectable({ providedIn: 'root' })
export class ToastService {
  success(message: string, options?: ToastOptions) {
    return toast.success(message, options);
  }

  error(message: string, options?: ToastOptions) {
    return toast.error(message, options);
  }
}
```

### React

```tsx
import { toast } from 'toastcraft';

toast.success('Saved');
```

For framework components inside a toast, use `toast.custom()` and return a cleanup function.

### Script tag

```html
<script src="https://unpkg.com/toastcraft"></script>
<script>
  Toastcraft.toast.success('Hello');
</script>
```

## Custom designs

Register a design without changing the library:

```ts
import { registerDesign } from 'toastcraft';

registerDesign('sunset', `
  & {
    --tc-bg: #ffedd5;
    --tc-fg: #7c2d12;
    border-radius: 20px;
  }

  & .tc-title {
    font-weight: 800;
  }
`);

toast.success('Looks warm', { design: 'sunset' });
```

## Theming

Every design uses CSS custom properties, so you can customize colors, typography and layout without creating a new design.

Available controls include:

- light / dark / system theme
- six positions
- six animations
- custom colors
- RTL
- custom width, gap and offsets
- custom classes and inline styles

## Accessibility

- `role="status"` for normal notifications and `role="alert"` for errors
- keyboard focus pauses timers
- `Escape` dismisses the focused toast
- `prefers-reduced-motion` is respected
- content is escaped by default
- timers pause when the tab/window loses focus

## SSR

Importing toastcraft is safe on the server. Calls made during SSR are no-ops until the browser is available.

## Browser support

Current Chrome, Edge, Firefox and Safari. toastcraft uses modern CSS features including `color-mix()`, `:has()` and grid transitions.

## Roadmap

- [x] 15 built-in designs
- [x] Framework-agnostic core
- [x] Promise API
- [x] Actions
- [x] Queue / overflow control
- [x] Stacked mode
- [x] Custom design registration
- [ ] Official framework adapters
- [ ] More examples and integrations

## License

MIT
