import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-speciality',
  standalone: false,
  templateUrl: './speciality.component.html',
  styleUrl: './speciality.component.scss'
})
export class SpecialityComponent {
  especialidades?: any;
  id: string = ''
  especialistaId: string | null = '';

  constructor(private router: Router, private appointmentService: AppointmentService, private supabaseService: SupabaseService) {

  }

  async ngOnInit() {
    this.especialistaId = localStorage.getItem('especialistaId');

    if (this.especialistaId != null) {
      const res = await this.appointmentService.getSpecialityWithSpecialist(this.especialistaId);
      if (res && res.data) {
        this.especialidades = res.data.map((e: any) => ({
          nombre: e.speciality,
          imagen: e.img_url
        }));
      }
    }

  }

  async seleccionarEspecialidad(nombre: string) {

    // 1️⃣ Traer usuario autenticado
    const { data: authData, error: authError } = await this.supabaseService.getCurrentUser();

    if (authError) {
      console.error('Error obteniendo usuario:', authError.message);
      return;
    }
    if (!authData.user) {
      console.warn('No hay usuario logueado');
      return;
    }

    this.id = authData.user.id;
    localStorage.setItem('especialidad', nombre);
    localStorage.setItem('usuarioId', this.id);
    this.router.navigate(['appointment/request-appointment-day']);
  }

  volver() {
    this.router.navigate(['appointment/request-appointment-specialist']);
  }
}
