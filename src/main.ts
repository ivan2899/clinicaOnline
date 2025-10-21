import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { NgxCaptchaModule } from 'ngx-captcha';

bootstrapApplication(AppComponent, appConfig,)
  .catch((err) => console.error(err));
