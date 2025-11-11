import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultImagePipe } from '../../pipes/default-image.pipe';
import { DefaultSpecialistPipe } from '../../pipes/default-specialist.pipe';
import { DefaultAdminPipe } from '../../pipes/default-admin.pipe';

import { AppointmentRoutingModule } from './appointment-routing.module';
import { SpecialistComponent } from '../../components/appointment/specialist/specialist.component';
import { SpecialityComponent } from '../../components/appointment/speciality/speciality.component';
import { DayComponent } from '../../components/appointment/day/day.component';
import { ConfirmComponent } from '../../components/appointment/confirm/confirm.component';
import { PatientComponent } from '../../components/appointment/patient/patient.component';


@NgModule({
  declarations: [SpecialistComponent, SpecialityComponent, DayComponent, ConfirmComponent, PatientComponent, DefaultImagePipe, DefaultSpecialistPipe, DefaultAdminPipe],
  imports: [
    CommonModule,
    AppointmentRoutingModule
  ],
  exports:[
    DefaultImagePipe, 
    DefaultSpecialistPipe,
    DefaultAdminPipe
  ]
})
export class AppointmentModule { }
