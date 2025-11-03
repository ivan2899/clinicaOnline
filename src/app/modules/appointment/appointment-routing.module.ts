import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpecialityComponent } from '../../components/appointment/speciality/speciality.component';
import { SpecialistComponent } from '../../components/appointment/specialist/specialist.component';
import { DayComponent } from '../../components/appointment/day/day.component';
import { ConfirmComponent } from '../../components/appointment/confirm/confirm.component';

const routes: Routes = [
  {
    path: 'request-appointment-speciality', component: SpecialityComponent
  },
  {
    path: 'request-appointment-specialist', component: SpecialistComponent
  },
  {
    path: 'request-appointment-day', component: DayComponent
  },
  {
    path: 'request-appointment-confirm', component: ConfirmComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }
