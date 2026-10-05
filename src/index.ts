import { Toaster } from './toaster';
import type { Content, PromiseMessages, ToasterConfig, ToastEvent, ToastId, ToastOptions, ToastType } from './types';

export { Toaster } from './toaster';
export { registerDesign, listDesigns, getCss, injectStyles, builtInDesigns } from './styles';
export { icons } from './icons';
export type * from './types';

type Shortcut = (message: Content | ToastOptions, options?: ToastOptions) => ToastId;

export interface ToastApi {
  (message: Content | ToastOptions, options?: ToastOptions): ToastId;
  success: Shortcut;
  error: Shortcut;
  warning: Shortcut;
  info: Shortcut;
  loading: Shortcut;
  /** Render anything into the toast body. Return a cleanup function to unmount framework components. */
  custom: (render: NonNullable<ToastOptions['render']>, options?: ToastOptions) => ToastId;
  promise: <T>(promise: Promise<T> | (() => Promise<T>), messages: PromiseMessages<T>, options?: ToastOptions) => Promise<T>;
  update: (id: ToastId, options: ToastOptions) => void;
  dismiss: (id?: ToastId) => void;
  isActive: (id: ToastId) => boolean;
  configure: (config: ToasterConfig) => void;
  subscribe: (listener: (e: ToastEvent) => void) => () => void;
  toaster: Toaster;
}

/** Build a standalone `toast()` function bound to its own Toaster (separate config & regions). */
export function createToaster(config?: ToasterConfig): ToastApi {
  const t = new Toaster(config);
  const typed = (type: ToastType): Shortcut => (message, options) =>
    t.show(message, { ...options, type });

  const api = ((message: Content | ToastOptions, options?: ToastOptions) => t.show(message, options)) as ToastApi;
  api.success = typed('success');
  api.error = typed('error');
  api.warning = typed('warning');
  api.info = typed('info');
  api.loading = typed('loading');
  api.custom = (render, options) => t.show({ ...options, render });
  api.promise = (p, messages, options) => t.promise(p, messages, options);
  api.update = (id, options) => t.update(id, options);
  api.dismiss = (id) => t.dismiss(id);
  api.isActive = (id) => t.isActive(id);
  api.configure = (c) => t.configure(c);
  api.subscribe = (l) => t.subscribe(l);
  api.toaster = t;
  return api;
}

/** The default, app-wide toast function. */
export const toast: ToastApi = createToaster();
export default toast;
