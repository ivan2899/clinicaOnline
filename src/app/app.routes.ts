import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { RegisterComponent } from './components/register/register.component';
import { AboutMeComponent } from './components/about-me/about-me.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MyAppointmentsComponent } from './components/results/my-appointments/my-appointments.component';
import { UserListComponent } from './components/results/user-list/user-list.component';
import { UserSectionComponent } from './components/user-section/user-section.component';


import { approvedGuard } from './guards/approved.guard';
import { ListAppointmentComponent } from './components/results/list-appointment/list-appointment.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(c => LoginComponent), data: { animation: 'LoginPage' }
    },
    {
        path: 'home',
        loadComponent: () => import('./components/home/home.component').then(c => HomeComponent), data: { animation: 'HomePage' },
        canActivate: [approvedGuard]
    },
    {
        path: 'register',
        loadComponent: () => import('./components/register/register.component').then(c => RegisterComponent), data: { animation: 'RegisterPage' }
    },
    {
        path: 'about-me',
        loadComponent: () => import('./components/about-me/about-me.component').then(c => AboutMeComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(c => ProfileComponent), data: { animation: 'ProfilePage' },
        canActivate: [approvedGuard]
    },
    {
        path: 'my-appointment',
        loadComponent: () => import('./components/results/my-appointments/my-appointments.component').then(c => MyAppointmentsComponent)
    },
    {
        path: 'appointments-list',
        loadComponent: () => import('./components/results/list-appointment/list-appointment.component').then(c => ListAppointmentComponent)
    },
    {
        path: 'appointment',
        loadChildren: () => import('./modules/appointment/appointment.module').then(m => m.AppointmentModule)
    },
    {
        path: 'user-list',
        loadComponent: () => import('./components/results/user-list/user-list.component').then(m => m.UserListComponent)
    },
    {
        path: 'section',
        loadComponent: () => import('./components/user-section/user-section.component').then(m => m.UserSectionComponent)
    },
    {
        path: 'register-admin',
        loadComponent: () => import('./components/register-admin/register-admin.component').then(m => m.RegisterAdminComponent)
    },
    {
        path: 'specialist-list',
        loadComponent: () => import('./components/results/specialist/specialist.component').then(m => m.SpecialistComponent)
    },
    { path: '**', component: PageNotFoundComponent }

];
