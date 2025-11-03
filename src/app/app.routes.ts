import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { RegisterComponent } from './components/register/register.component';
import { AboutMeComponent } from './components/about-me/about-me.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MyAppointmentsComponent } from './components/results/my-appointments/my-appointments.component';
import { approvedGuard } from './guards/approved.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(c => LoginComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./components/home/home.component').then(c => HomeComponent),
        canActivate: [approvedGuard]
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
        loadComponent: () => import('./components/profile/profile.component').then(c => ProfileComponent),
        canActivate: [approvedGuard]
    },
    {
        path: 'my-appointment',
        loadComponent: () => import('./components/results/my-appointments/my-appointments.component').then(c => MyAppointmentsComponent)
    },
    {
        path: 'appointment',
        loadChildren: () => import('./modules/appointment/appointment.module').then(m => m.AppointmentModule)
    },
    { path: '**', component: PageNotFoundComponent }

];
