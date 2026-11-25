import {
  ApplicationRef,
  DestroyRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  NgZone,
  TemplateRef,
  Type,
  createComponent,
  inject,
} from '@angular/core';
import { Observable, type MonoTypeOperatorFunction } from 'rxjs';
import {
  createToaster,
  type Content,
  type PromiseMessages,
  type ToastApi,
  type ToasterConfig,
  type ToastEvent,
  type ToastId,
  type ToastOptions,
} from 'toastcraft';
import { TOASTCRAFT_CONFIG } from './config';
import { ToastRef } from './toast-ref';

type Message = Content | ToastOptions;

/** Options for `ToastService.component()`. */
export interface ComponentToastOptions extends ToastOptions {
  /** Values for the component's inputs, set with `ComponentRef.setInput()`. */
  inputs?: Record<string, unknown>;
  /** Parent injector for the component. Defaults to the application's root injector. */
  injector?: Injector;
}

/** Options for `ToastService.template()`. */
export interface TemplateToastOptions<C extends object = object> extends ToastOptions {
  /** Extra template context. `$implicit` is always the `ToastRef`. */
  context?: C;
  injector?: Injector;
}

/** Context available inside a template toast: `<ng-template #tpl let-toast>`. */
export type ToastTemplateContext<C extends object = object> = C & { $implicit: ToastRef };

/**
 * Show toasts from anywhere in an Angular app.
 *
 * ```ts
 * private toast = inject(ToastService);
 * save() { this.toast.success('Changes saved'); }
 * ```
 *
 * Timers run outside Angular's zone, so toasts never trigger change detection on their own.
 * Your callbacks (actions, onClick, onDismiss, …) run inside the zone as usual.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly zone = inject(NgZone);
  private readonly appRef = inject(ApplicationRef);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly api: ToastApi = createToaster(inject(TOASTCRAFT_CONFIG, { optional: true }) ?? {});

  /** Show, update and dismiss events. Emits inside Angular's zone. */
  readonly events: Observable<ToastEvent> = new Observable<ToastEvent>((subscriber) =>
    this.api.subscribe((event) => this.zone.run(() => subscriber.next(event))),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.api.toaster.destroy());
  }

  show(message: Message, options?: ToastOptions): ToastId {
    return this.outside(() => this.api(this.wrapMessage(message), this.wrap(options)));
  }

  success(message: Message, options?: ToastOptions): ToastId {
    return this.outside(() => this.api.success(this.wrapMessage(message), this.wrap(options)));
  }

  error(message: Message, options?: ToastOptions): ToastId {
    return this.outside(() => this.api.error(this.wrapMessage(message), this.wrap(options)));
  }

  warning(message: Message, options?: ToastOptions): ToastId {
    return this.outside(() => this.api.warning(this.wrapMessage(message), this.wrap(options)));
  }

  info(message: Message, options?: ToastOptions): ToastId {
    return this.outside(() => this.api.info(this.wrapMessage(message), this.wrap(options)));
  }

  /** A toast with a spinner that stays open until you update or dismiss it. */
  loading(message: Message, options?: ToastOptions): ToastId {
    return this.outside(() => this.api.loading(this.wrapMessage(message), this.wrap(options)));
  }

  update(id: ToastId, options: ToastOptions): void {
    this.outside(() => this.api.update(id, this.wrap(options)!));
  }

  /** Replace a toast's options entirely instead of merging. Drops any component or template it was rendering. */
  replace(id: ToastId, options: ToastOptions): void {
    this.outside(() => this.api.toaster.update(id, this.wrap(options)!, true));
  }

  /** Dismiss one toast, or every toast when called without an id. */
  dismiss(id?: ToastId): void {
    this.outside(() => this.api.dismiss(id));
  }

  isActive(id: ToastId): boolean {
    return this.api.isActive(id);
  }

  /** Change the configuration at runtime. Same options as `provideToastcraft()`. */
  configure(config: ToasterConfig): void {
    this.outside(() => this.api.configure(config));
  }

  /** Loading → success / error toast that follows a promise. Resolves with the promise's value. */
  promise<T>(promise: Promise<T> | (() => Promise<T>), messages: PromiseMessages<T>, options?: ToastOptions): Promise<T> {
    return this.outside(() => this.api.promise(promise, this.wrapMessages(messages), this.wrap(options)));
  }

  /**
   * RxJS operator: shows a loading toast on subscribe, then success when the observable completes
   * (with its last value) or error when it errors. Unsubscribing early dismisses the loading toast.
   *
   * ```ts
   * this.http.post('/api/report', body).pipe(
   *   this.toast.track({ loading: 'Saving…', success: 'Report saved', error: 'Save failed' }),
   * ).subscribe();
   * ```
   */
  track<T>(messages: PromiseMessages<T>, options?: ToastOptions): MonoTypeOperatorFunction<T> {
    const resolve = <A>(m: PromiseMessages<T>['success'] | PromiseMessages<T>['error'], arg: A): Message =>
      typeof m === 'function' ? (m as (a: A) => Message)(arg) : (m as Message);
    const asOptions = (m: Message): ToastOptions =>
      typeof m === 'object' && m !== null && !(m instanceof Node) ? m : { title: m };

    return (source) =>
      new Observable<T>((subscriber) => {
        const id = this.loading(messages.loading, options);
        let last: T | undefined;
        let settled = false;
        const finish = (type: 'success' | 'error', message: Message) => {
          settled = true;
          // Clear loading-only settings (like an infinite duration) so the result auto-dismisses.
          const { duration: _ignored, ...rest } = options ?? {};
          this.update(id, { ...rest, duration: undefined, ...asOptions(message), type });
        };
        const sub = source.subscribe({
          next: (value) => {
            last = value;
            subscriber.next(value);
          },
          error: (err) => {
            finish('error', resolve(messages.error, err));
            subscriber.error(err);
          },
          complete: () => {
            finish('success', resolve(messages.success, last as T));
            subscriber.complete();
          },
        });
        return () => {
          sub.unsubscribe();
          if (!settled) this.dismiss(id);
        };
      });
  }

  /**
   * Render an Angular component as the toast body. Inject `ToastRef` in it to dismiss or update the toast.
   *
   * ```ts
   * this.toast.component(InviteToast, { inputs: { name: 'Priya' }, duration: 8000 });
   * ```
   */
  component<C>(component: Type<C>, options: ComponentToastOptions = {}): ToastId {
    const { inputs, injector, ...toastOptions } = options;
    return this.show({
      ...toastOptions,
      render: (host, ctx) => {
        const elementInjector = Injector.create({
          providers: [{ provide: ToastRef, useValue: new ToastRef(ctx, (o) => this.replace(ctx.id, o)) }],
          parent: injector ?? this.envInjector,
        });
        const ref = createComponent(component, { environmentInjector: this.envInjector, elementInjector });
        for (const [name, value] of Object.entries(inputs ?? {})) ref.setInput(name, value);
        host.appendChild(ref.location.nativeElement);
        this.appRef.attachView(ref.hostView);
        ref.changeDetectorRef.detectChanges();
        return () => {
          this.appRef.detachView(ref.hostView);
          ref.destroy();
        };
      },
    });
  }

  /**
   * Render an `<ng-template>` as the toast body. `let-toast` gives you the `ToastRef`.
   *
   * ```html
   * <ng-template #saved let-toast>
   *   Saved. <button (click)="undo(); toast.dismiss()">Undo</button>
   * </ng-template>
   * ```
   */
  template<C extends object = object>(template: TemplateRef<ToastTemplateContext<C>>, options: TemplateToastOptions<C> = {}): ToastId {
    const { context, injector, ...toastOptions } = options;
    return this.show({
      ...toastOptions,
      render: (host, ctx) => {
        const view = template.createEmbeddedView({ ...(context as C), $implicit: new ToastRef(ctx, (o) => this.replace(ctx.id, o)) }, injector);
        this.appRef.attachView(view);
        view.detectChanges();
        for (const node of view.rootNodes) host.appendChild(node);
        return () => {
          this.appRef.detachView(view);
          view.destroy();
        };
      },
    });
  }

  /* ── zone handling ── */

  private outside<R>(fn: () => R): R {
    return this.zone.runOutsideAngular(fn);
  }

  private inZone<A extends unknown[], R>(fn: ((...args: A) => R) | undefined): ((...args: A) => R) | undefined {
    return fn && ((...args: A) => this.zone.run(() => fn(...args)));
  }

  private wrap(options: ToastOptions | undefined): ToastOptions | undefined {
    if (!options) return options;
    return {
      ...options,
      onShow: this.inZone(options.onShow),
      onDismiss: this.inZone(options.onDismiss),
      onClick: this.inZone(options.onClick),
      render: this.inZone(options.render),
      actions: options.actions?.map((a) => ({ ...a, onClick: this.inZone(a.onClick) })),
    };
  }

  private wrapMessage(message: Message): Message {
    return typeof message === 'object' && message !== null && !(message instanceof Node) ? this.wrap(message)! : message;
  }

  private wrapMessages<T>(m: PromiseMessages<T>): PromiseMessages<T> {
    const w = <F>(v: F): F =>
      (typeof v === 'function' ? (arg: unknown) => this.wrapMessage((v as (a: unknown) => Message)(arg)) : this.wrapMessage(v as Message)) as F;
    return { loading: w(m.loading), success: w(m.success), error: w(m.error) };
  }
}
