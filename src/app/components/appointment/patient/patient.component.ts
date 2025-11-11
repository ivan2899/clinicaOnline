import { Component } from '@angular/core';
import { AppointmentService } from '../../../services/appointment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient',
  standalone: false,
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.scss'
})
export class PatientComponent {
  pacientes: any[] = [];

  constructor(private appointmentService: AppointmentService, private router: Router) {

  }

  async ngOnInit() {
    const res = await this.appointmentService.getPatients();

    if (res && res.data) {
      this.pacientes = res.data.map((e: any) => ({
        id: e.auth_id,
        nombreCompleto: `${e.first_name} ${e.last_name}`,
        foto: e.first_photo_url
      }));
    }
  }

  seleccionarPaciente(pac: any) {
    localStorage.setItem('usuarioId', pac.id);
    localStorage.setItem('usuarioCompleto', pac.nombreCompleto);
    this.router.navigate(['appointment/request-appointment-confirm']);
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
