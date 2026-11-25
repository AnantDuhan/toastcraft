import type { ToastContext, ToastId, ToastOptions } from 'toastcraft';

/**
 * Handle to the toast that is rendering a component or template.
 * Inject it in a component shown with `ToastService.component()`:
 *
 * ```ts
 * export class UndoToast {
 *   private toastRef = inject(ToastRef);
 *   undo() { ...; this.toastRef.dismiss(); }
 * }
 * ```
 */
export class ToastRef {
  constructor(
    private readonly ctx: ToastContext,
    private readonly replaceFn: (options: ToastOptions) => void = (o) => ctx.update(o),
  ) {}

  get id(): ToastId {
    return this.ctx.id;
  }

  /** The toast's root element. */
  get element(): HTMLElement {
    return this.ctx.element;
  }

  dismiss(): void {
    this.ctx.dismiss();
  }

  /**
   * Merge new options into the toast. The component or template stays and is re-rendered
   * (which recreates it, so its local state resets).
   */
  update(options: ToastOptions): void {
    this.ctx.update(options);
  }

  /**
   * Replace the toast's options entirely, dropping the component or template.
   * Use it to turn an interactive toast into a plain one, e.g. after the user accepts:
   * `toastRef.replace({ type: 'success', title: 'Joined the board' })`.
   */
  replace(options: ToastOptions): void {
    this.replaceFn(options);
  }
}
