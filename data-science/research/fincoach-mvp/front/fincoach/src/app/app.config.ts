import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  ArcElement,
  DoughnutController,
} from 'chart.js';
import { provideCharts } from 'ng2-charts';

import { apiInterceptor } from './core/interceptors/api-interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideCharts({ registerables: [DoughnutController, ArcElement] }),
  ],
};
