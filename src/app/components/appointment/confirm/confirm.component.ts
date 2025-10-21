import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {
  turno: any = {};

  constructor(private router: Router, private appointmentService: AppointmentService) { }

  ngOnInit() {
    const especialidad = localStorage.getItem('especialidad');
    const especialista = localStorage.getItem('especialista');
    const dia = localStorage.getItem('dia');
    const hora = localStorage.getItem('hora');
    const especialistaId = localStorage.getItem('especialistaId');
    const usuarioId = localStorage.getItem('usuarioId');

    this.turno = {
      especialidad,
      especialista,
      dia: dia ? JSON.parse(dia) : null,
      hora,
      especialistaId,
      usuarioId
    };
  }

  confirmarTurno() {
    this.appointmentService.pushAppointment(this.turno.especialistaId, this.turno.usuarioId, this.turno.especialidad, this.turno.dia, this.turno.hora);
    alert(`✅ Turno confirmado con ${this.turno.especialista} el ${this.turno.dia} a las ${this.turno.hora}`);
    localStorage.clear();
    this.router.navigate(['/home']);
  }

  volver() {
    this.router.navigate(['/request-appointment-day']);
  }

  cancelar() {
    localStorage.clear();
    this.router.navigate(['/home']);
  }
}