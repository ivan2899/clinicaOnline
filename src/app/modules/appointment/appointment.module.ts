import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultImagePipe } from '../../pipes/default-image.pipe';

import { AppointmentRoutingModule } from './appointment-routing.module';
import { SpecialistComponent } from '../../components/appointment/specialist/specialist.component';
import { SpecialityComponent } from '../../components/appointment/speciality/speciality.component';
import { DayComponent } from '../../components/appointment/day/day.component';
import { ConfirmComponent } from '../../components/appointment/confirm/confirm.component';


@NgModule({
  declarations: [SpecialistComponent, SpecialityComponent, DayComponent, ConfirmComponent, DefaultImagePipe],
  imports: [
    CommonModule,
    AppointmentRoutingModule
  ]
})
export class AppointmentModule { }
