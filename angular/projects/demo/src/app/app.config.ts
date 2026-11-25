import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastcraft, toastcraftHttpErrors } from 'ngx-toastcraft';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([toastcraftHttpErrors()])),
    provideToastcraft({ design: 'glass', position: 'bottom-right', progress: true }),
  ],
};
