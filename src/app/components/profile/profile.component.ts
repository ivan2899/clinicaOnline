import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { SpinnerService } from '../../services/spinner.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppointmentModule } from '../../modules/appointment/appointment.module';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  mostrarModal = false;
  usuario: any = {};
  id: string = '';
  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  diasSeleccionados: string[] = [];
  seccionActiva: 'info' | 'horarios' = 'info';
  cantidadTurnos: number = 0;
  horasDisponibles: string[] = [];
  horaSeleccionada: string = '';

  constructor(private supabaseService: SupabaseService, private spinnerService: SpinnerService) {
  }

  async ngOnInit() {

    // Generar horarios de 8:00 a 12:00 en intervalos de 30m
    const horas: string[] = [];
    for (let h = 8; h < 12; h++) {
      horas.push(`${h}:00`);
      horas.push(`${h}:30`);
    }
    this.horasDisponibles = horas;

    this.spinnerService.show(); // ⬅️ Mostrar spinner al iniciar
    try {
      // 1️⃣ Traer usuario autenticado
      const { data: authData, error: authError } = await this.supabaseService.waitWithTimeout(this.supabaseService.getCurrentUser(), 4000);

      if (authError) {
        console.error('Error obteniendo usuario:', authError.message);
        return;
      }
      if (!authData.user) {
        console.warn('No hay usuario logueado');
        return;
      }

      this.id = authData.user.id;

      // 2️⃣ Traer datos del perfil desde la tabla 'profiles'
      const { data: profileData, error: profileError } = await this.supabaseService.getClientData(this.id);

      if (profileError) {
        console.error('Error obteniendo perfil del usuario:', profileError.message);
        return;
      }

      this.usuario = profileData;
      console.log('Usuario actual:', this.usuario);

    } catch (err) {
      console.error('Error inesperado:', err);

    } finally {
      this.spinnerService.hide(); // ⬅️ Ocultar spinner cuando termina, con éxito o error
    }
  }

  seleccionarDia(dia: string) {
    const index = this.diasSeleccionados.indexOf(dia);

    if (index === -1) {
      // Si no está seleccionado, lo agrego
      this.diasSeleccionados.push(dia);
    } else {
      // Si ya estaba seleccionado, lo saco
      this.diasSeleccionados.splice(index, 1);
    }

    console.log('Días seleccionados:', this.diasSeleccionados);
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
  }

  async guardarHorarios() {
    const res = await this.supabaseService.dayLog(this.diasSeleccionados, this.cantidadTurnos, this.horaSeleccionada)
    this.cerrarModal();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.seccionActiva = 'info';
  }

  cambiarSeccion(seccion: 'info' | 'horarios') {
    this.seccionActiva = seccion;

    if (this.seccionActiva === 'horarios') this.mostrarModal = true;
  }

  soloNumeros(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }
}
