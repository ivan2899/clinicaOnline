import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { RegisterComponent } from './components/register/register.component';
import { AboutMeComponent } from './components/about-me/about-me.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MyAppointmentsComponent } from './components/results/my-appointments/my-appointments.component';
import { SpecialityComponent } from './components/appointment/speciality/speciality.component';
import { SpecialistComponent } from './components/appointment/specialist/specialist.component';
import { DayComponent } from './components/appointment/day/day.component';
import { TimeComponent } from './components/appointment/time/time.component';
import { ConfirmComponent } from './components/appointment/confirm/confirm.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(c => LoginComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./components/home/home.component').then(c => HomeComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./components/register/register.component').then(c => RegisterComponent)
    },
    {
        path: 'about-me',
        loadComponent: () => import('./components/about-me/about-me.component').then(c => AboutMeComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(c => ProfileComponent)
    },
    {
        path: 'my-appointment',
        loadComponent: () => import('./components/results/my-appointments/my-appointments.component').then(c => MyAppointmentsComponent)
    },
    {
        path: 'request-appointment-speciality',
        loadComponent: () => import('./components/appointment/speciality/speciality.component').then(c => SpecialityComponent)
    },
    {
        path: 'request-appointment-specialist',
        loadComponent: () => import('./components/appointment/specialist/specialist.component').then(c => SpecialistComponent)
    },
    {
        path: 'request-appointment-day',
        loadComponent: () => import('./components/appointment/day/day.component').then(c => DayComponent)
    },
    {
        path: 'request-appointment-time',
        loadComponent: () => import('./components/appointment/time/time.component').then(c => TimeComponent)
    },
    {
        path: 'request-appointment-confirm',
        loadComponent: () => import('./components/appointment/confirm/confirm.component').then(c => ConfirmComponent)
    },
    { path: '**', component: PageNotFoundComponent }

];
