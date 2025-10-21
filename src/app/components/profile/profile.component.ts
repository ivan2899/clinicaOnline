import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { SpinnerService } from '../../services/spinner.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  usuario: any = {};
  id: string = '';
  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  diasSeleccionados: string[] = [];
  seccionActiva: 'info' | 'horarios' = 'info';
  cantidadTurnos: number = 0;

  constructor(private supabaseService: SupabaseService, private spinnerService: SpinnerService) {
  }

  async ngOnInit() {
    this.spinnerService.show(); // ⬅️ Mostrar spinner al iniciar
    try {
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

  async guardarHorarios() {
    const res = await this.supabaseService.dayLog(this.diasSeleccionados, this.cantidadTurnos)
  }

  cambiarSeccion(seccion: 'info' | 'horarios') {
    this.seccionActiva = seccion;
  }
}
