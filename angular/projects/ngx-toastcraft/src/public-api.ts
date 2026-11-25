/*
 * Public API Surface of ngx-toastcraft
 */
export { provideToastcraft, TOASTCRAFT_CONFIG } from './lib/config';
export { ToastService } from './lib/toast.service';
export type { ComponentToastOptions, TemplateToastOptions, ToastTemplateContext } from './lib/toast.service';
export { ToastRef } from './lib/toast-ref';
export { toastcraftHttpErrors, SKIP_ERROR_TOAST, defaultHttpErrorMessage } from './lib/http';
export type { HttpErrorToastConfig } from './lib/http';

// Re-export toastcraft so apps only need one import path.
export { registerDesign, listDesigns, builtInDesigns } from 'toastcraft';
export type * from 'toastcraft';
