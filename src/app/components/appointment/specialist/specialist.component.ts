import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-specialist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './specialist.component.html',
  styleUrl: './specialist.component.scss'
})
export class SpecialistComponent {
  especialistas: any[] = [];
  id : number = 0;

  constructor(private router: Router, private appointmentService: AppointmentService) { }

  async ngOnInit() {
    const res = await this.appointmentService.getSpecialistWithSpeciality('Dentista');

    if (res && res.data) {
      this.especialistas = res.data.map((e: any) => ({
        id: e.auth_id,
        nombreCompleto: `${e.first_name} ${e.last_name}`,
        foto: e.first_photo_url
      }));
    }

    console.log(this.especialistas);
  }

  seleccionarEspecialista(esp: any) {
    localStorage.setItem('especialista', esp.nombreCompleto);
    localStorage.setItem('especialistaId', esp.id);
    this.router.navigate(['request-appointment-day']);
  }

  volver() {
    this.router.navigate(['/request-appointment-speciality']);
  }
}
