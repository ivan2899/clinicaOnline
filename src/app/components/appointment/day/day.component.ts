import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-day',
  standalone: false,
  templateUrl: './day.component.html',
  styleUrl: './day.component.scss'
})
export class DayComponent {
  specialistId: string = '';
  dias: string[] = [];
  dia: string = ''
  hora: any;
  turnosGenerados: string[] = [];
  turnos: string[] = [];

  constructor(private router: Router, private supabaseService: SupabaseService) {
    const id = localStorage.getItem('especialistaId');
    if (id) this.specialistId = id;
  }

  async ngOnInit() {
    this.dias = await this.supabaseService.getDiasSeleccionados(this.specialistId);
    this.hora = await this.supabaseService.getQuantitySeleccionados(this.specialistId);
    this.turnos = await this.supabaseService.getAppointments();

    console.log(this.turnos);
    this.turnosGenerados = this.generarTurnos(this.dias, this.hora);
  }

  generarTurnos(
    dias: string[],
    hora: { quantity: number; time_start: string },
  ): string[] {

    const turnos: string[] = [];
    const cantidadMax = 10;
    const minutosPorTurno = 30;

    const diasMap: any = {
      Domingo: 0,
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
    };

    let fecha = new Date();

    while (turnos.length < cantidadMax) {

      const diaSemana = fecha.getDay();
      const nombreDia = Object.keys(diasMap).find(key => diasMap[key] === diaSemana);

      if (nombreDia && dias.includes(nombreDia)) {

        const [horaInicio, minutosInicio] = hora.time_start.split(':').map(Number);

        for (let i = 0; i < hora.quantity; i++) {

          const fechaTurno = new Date(fecha);
          fechaTurno.setHours(horaInicio);
          fechaTurno.setMinutes(minutosInicio + i * minutosPorTurno);

          // Formato para mostrar: dd/mm
          const dia = fechaTurno.getDate().toString().padStart(2, '0');
          const mes = (fechaTurno.getMonth() + 1).toString().padStart(2, '0');
          const diaFormato = `${dia}/${mes}`;

          // Formato de hora: "HH:mm"
          const horaStr = fechaTurno.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });

          // 🔎 Verificar si ese turno ya existe y está activo
          const ocupado = this.turnos.some((t: any) =>
            t.is_active === true &&
            t.day === diaFormato &&
            t.time === horaStr
          );

          if (!ocupado) {
            // Si NO está ocupado, lo agregamos
            turnos.push(`${diaFormato} ${horaStr}`);
          }

          if (turnos.length >= cantidadMax) break;
        }
      }

      fecha.setDate(fecha.getDate() + 1);
    }

    return turnos;
  }


  seleccionarDia(dia: any) {
    localStorage.setItem('dia', JSON.stringify(dia));

    const rol = localStorage.getItem('rol');
    if (rol === 'Admin') {
      this.router.navigate(['appointment/request-appointment-patient']);
    } else {
      this.router.navigate(['appointment/request-appointment-confirm']);
    }
  }

  volver() {
    this.router.navigate(['appointment/request-appointment-speciality']);
  }
}
