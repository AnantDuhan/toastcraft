# ngx-toastcraft

Angular toast notifications with **15 built-in designs**: glass, neon, brutalist, Material, terminal, Windows 95 and more. A standalone provider, an injectable service, component and template toasts, an RxJS operator, and an HTTP error interceptor.

Works with **Angular 18 to 22**, with or without zone.js. No CSS import and no `@angular/animations` needed.

**[Try every design in the playground](https://toastcraft.netlify.app/)**

```bash
npm i ngx-toastcraft
```

## Setup

```ts
// app.config.ts
import { provideToastcraft } from 'ngx-toastcraft';

export const appConfig: ApplicationConfig = {
  providers: [provideToastcraft({ design: 'glass', position: 'bottom-right' })],
};
```

`provideToastcraft()` is optional. Without it, toasts use the defaults (`minimal`, top right).

## Showing toasts

```ts
import { ToastService } from 'ngx-toastcraft';

export class ProfileComponent {
  private toast = inject(ToastService);

  save() {
    this.toast.success('Changes saved', { description: 'Your profile is up to date.' });
  }
}
```

| Method | |
| --- | --- |
| `show`, `success`, `error`, `warning`, `info` | Show a toast. Returns its id. |
| `loading` | Spinner toast that stays until you update or dismiss it |
| `update(id, options)` | Merge new options into a toast |
| `replace(id, options)` | Replace a toast's options entirely |
| `dismiss(id?)` | Dismiss one toast, or all of them |
| `promise(promise, messages)` | Loading, then success or error |
| `track(messages)` | The same, as an RxJS operator |
| `component(Type, options)` | Render a component inside a toast |
| `template(templateRef, options)` | Render an `<ng-template>` inside a toast |
| `configure(config)` | Change settings at runtime |
| `events` | Observable of show, update and dismiss events |

Every option from [toastcraft](https://www.npmjs.com/package/toastcraft) works here: `design`, `position`, `duration`, `actions`, `progress`, `icon`, `accent`, `closeOnClick`, `onDismiss` and more.

### Actions

```ts
this.toast.show('Message deleted', {
  actions: [
    { label: 'Undo', onClick: () => this.restore() },
    { label: 'Dismiss', variant: 'secondary' },
  ],
});
```

## Track an Observable

`track()` shows a loading toast on subscribe, a success toast when the Observable completes, and an error toast if it fails. Unsubscribing early dismisses the loading toast. Values and errors pass through unchanged.

```ts
this.http.post('/api/reports', report).pipe(
  this.toast.track({
    loading: 'Saving report…',
    success: (saved) => `Saved ${saved.name}`,
    error: 'Could not save the report',
  }),
).subscribe();
```

## Component toasts

Inject `ToastRef` to dismiss the toast, update it, or replace it with a plain toast.

```ts
@Component({
  selector: 'app-invite-toast',
  template: `
    <strong>{{ name() }} invited you</strong>
    <button (click)="accept()">Accept</button>
  `,
})
export class InviteToast {
  name = input.required<string>();
  private toastRef = inject(ToastRef);

  accept() {
    this.toastRef.replace({ type: 'success', title: 'Joined the board' });
  }
}

this.toast.component(InviteToast, { inputs: { name: 'Priya' }, duration: 0 });
```

The component is destroyed when the toast is dismissed, so `ngOnDestroy` and `DestroyRef` work as usual.

## Template toasts

`let-toast` gives you the `ToastRef`. Pass anything else through `context`.

```html
<ng-template #uploaded let-toast let-file="file">
  <strong>{{ file }} uploaded</strong>
  <button (click)="toast.dismiss()">Got it</button>
</ng-template>

<button (click)="toast.template(uploaded, { context: { file: 'report.pdf' } })">Upload</button>
```

## Toast on every failed HTTP request

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { toastcraftHttpErrors } from 'ngx-toastcraft';

provideHttpClient(withInterceptors([toastcraftHttpErrors()]));
```

- Shows a readable message per status: offline, 401, 403, 404, 429, timeouts and 5xx. It uses the server's `message` when one is sent.
- Shows one toast per status code at a time, so ten requests failing while offline produce one toast, not ten.
- Re-throws the error, so your own `catchError` and error handling keep working.

```ts
import { defaultHttpErrorMessage, toastcraftHttpErrors } from 'ngx-toastcraft';

toastcraftHttpErrors({
  // No toast for 404s from search; the page shows "no results" instead
  skip: (error, req) => error.status === 404 && req.url.includes('/search'),
  // Your auth flow handles 401s, so return null to show nothing for them
  message: (error) => (error.status === 401 ? null : defaultHttpErrorMessage(error)),
  options: { design: 'brutalist', duration: 8000 },
});
```

To skip a single request:

```ts
this.http.get(url, { context: new HttpContext().set(SKIP_ERROR_TOAST, true) });
```

## Change detection

Toast timers and animations run outside Angular's zone, so they never trigger change detection on their own. Your callbacks (`onClick`, `onDismiss`, action handlers) run inside the zone, so updating component state from them works as normal. In zoneless apps, signals update the view as usual.

## SSR

Safe to use with server-side rendering. Toasts are only created in the browser.

## Migrating from ngx-toastr

Most apps switch in a few minutes.

**1. Swap the packages.**

```bash
npm uninstall ngx-toastr
npm i ngx-toastcraft
```

Remove `node_modules/ngx-toastr/toastr.css` from the `styles` in `angular.json`. ngx-toastcraft ships its own styles.

**2. Swap the provider.**

```ts
// Before
provideToastr({ timeOut: 5000, positionClass: 'toast-bottom-right', progressBar: true, preventDuplicates: true });

// After
provideToastcraft({ duration: 5000, position: 'bottom-right', progress: true });
```

With `NgModule`s, put `provideToastcraft()` in the module's `providers` in place of `ToastrModule.forRoot()`.

**3. Swap the service, and flip the arguments.** ngx-toastr takes `(message, title)`. ngx-toastcraft takes the title first, with the message as `description`:

```ts
// Before
this.toastr.success('Your profile is up to date.', 'Saved');

// After
this.toast.success('Saved', { description: 'Your profile is up to date.' });
```

If you only ever pass one argument, the call stays the same: `this.toastr.error('Failed')` becomes `this.toast.error('Failed')`.

### Option mapping

Global options go in `provideToastcraft()`. Per-toast options can also be set for every toast with `toastDefaults`, or per type with `typeDefaults`.

| ngx-toastr | ngx-toastcraft |
| --- | --- |
| `timeOut` | `duration` |
| `disableTimeOut: true` | `duration: 0` |
| `extendedTimeOut` | Not needed: toasts pause on hover and resume with the time left |
| `closeButton` | `dismissible` (on by default) |
| `tapToDismiss` (on by default) | `closeOnClick` (off by default) |
| `progressBar` | `progress` |
| `enableHtml` | `html` per toast, or `toastDefaults: { html: true }` for all toasts (trusted content only) |
| `positionClass: 'toast-top-right'` | `position: 'top-right'` (also `top-left`, `top-center`, `bottom-*`) |
| `newestOnTop` | `newestOnTop` |
| `maxOpened` | `maxVisible` |
| `autoDismiss: true` | `overflow: 'dismiss-oldest'` |
| `autoDismiss: false` | `overflow: 'queue'` |
| `preventDuplicates` | Pass the same `id`: a second toast with that id updates the first |
| `toastClass`, `titleClass`, `messageClass` | `className`, `classNames.title`, `classNames.description`, per toast or in `toastDefaults` |
| `iconClasses` | `icon` per toast, or per type with `typeDefaults: { error: { icon: '…' } }` |

### Methods and events

| ngx-toastr | ngx-toastcraft |
| --- | --- |
| `toastr.clear()` / `toastr.clear(id)` | `toast.dismiss()` / `toast.dismiss(id)` |
| `toastr.remove(id)` | `toast.dismiss(id)` |
| `activeToast.toastId` (number) | The returned id (string) |
| `activeToast.onTap` | `onClick` option |
| `activeToast.onShown` / `onHidden` | `onShow` / `onDismiss` options |
| `activeToast.onAction` | `actions` option |
| Custom toast component | `toast.component(YourComponent)` with `inject(ToastRef)` |

**Two behavior changes to check after migrating:**

1. Clicking a toast no longer closes it. Set `closeOnClick: true` in `provideToastcraft()` to keep the old behavior.
2. Toasts have a close button by default. Set `dismissible: false` to hide it.

## License

MIT
