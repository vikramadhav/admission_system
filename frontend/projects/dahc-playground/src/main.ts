import { bootstrapApplication } from '@angular/platform-browser';
import { PlaygroundShellComponent } from 'dahc-playground-kit';

import { appConfig } from './app/app.config';

bootstrapApplication(PlaygroundShellComponent, appConfig).catch((error: unknown) => console.error(error));
