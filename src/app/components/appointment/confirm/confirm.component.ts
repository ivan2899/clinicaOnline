import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-confirm',
  standalone: false,
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {
  turno: any = {};
  hora: string = '';
  rol: string | null = '';

  constructor(private router: Router, private appointmentService: AppointmentService, private toastService: ToastService) { }

  ngOnInit() {
    const especialidad = localStorage.getItem('especialidad');
    const especialista = localStorage.getItem('especialista');
    const dia = localStorage.getItem('dia');
    const especialistaId = localStorage.getItem('especialistaId');
    const usuarioId = localStorage.getItem('usuarioId');
    const nombreDeUsuario = localStorage.getItem('usuarioCompleto');
    this.rol = localStorage.getItem('rol');
    if (this.rol == 'Admin') {
      this.turno = {
        especialidad,
        especialista,
        dia: dia ? JSON.parse(dia) : null,
        especialistaId,
        usuarioId,
        nombreDeUsuario,
      };
    } else {
      this.turno = {
        especialidad,
        especialista,
        dia: dia ? JSON.parse(dia) : null,
        especialistaId,
        usuarioId
      };
    }
  }

  confirmarTurno() {

    const dia = this.turno.dia.split(' ')[0];
    const hora = this.turno.dia.split(' ')[1];

    this.appointmentService.pushAppointment(this.turno.especialistaId, this.turno.usuarioId, this.turno.especialidad, dia, hora);
    this.toastService.toast(`✅ Turno confirmado con ${this.turno.especialista} el ${this.turno.dia}`)

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