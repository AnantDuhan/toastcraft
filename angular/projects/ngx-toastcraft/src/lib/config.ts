import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import type { ToasterConfig } from 'toastcraft';

/** Configuration passed to `provideToastcraft()`. Same options as toastcraft's `configure()`. */
export const TOASTCRAFT_CONFIG = new InjectionToken<ToasterConfig>('TOASTCRAFT_CONFIG');

/**
 * Configure toastcraft for the application.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideToastcraft({ design: 'glass', position: 'bottom-right' })],
 * });
 * ```
 *
 * Optional: `ToastService` works without it, using toastcraft's defaults.
 */
export function provideToastcraft(config: ToasterConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: TOASTCRAFT_CONFIG, useValue: config }]);
}
