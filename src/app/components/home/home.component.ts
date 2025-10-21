import { Component, SimpleChanges } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { MessagesService } from '../../services/messages.service';
import Toastify from 'toastify-js'
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isLogged = false;
  role: string | null = '';

  constructor(private spinnerService: SpinnerService, private supabaseService: SupabaseService) {
  }

  async ngOnInit() {
    try {
      this.spinnerService.show();

      // 🔹 1. Obtener usuario actual
      const { data: authData, error: authError } = await this.supabaseService.getCurrentUser();

      if (authError || !authData?.user) {
        console.warn('No hay usuario logueado o error al obtenerlo:', authError?.message);
        this.isLogged = false;
        return;
      }

      // ✅ Usuario logueado
      this.isLogged = true;

      // 🔹 2. Obtener rol del usuario (usa el auth_id)
      const { data: roleData, error: roleError } = await this.supabaseService.getRole(authData.user.id);

      if (roleError) {
        console.error('Error obteniendo rol:', roleError.message);
        this.role = null;
      } else {
        this.role = roleData?.role || null;
        console.log('Rol del usuario:', this.role);
      }

    } catch (err) {
      console.error('Error inesperado:', err);
      this.isLogged = false;
    } finally {
      this.spinnerService.hide();
    }
  }

  toast() {
    Toastify({
      text: "This is a toast",
      duration: 3000,
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "left", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
        color: "#000"
      },
      onClick: function () { } // Callback after click
    }).showToast();
  }

  spinner() {
    this.spinnerService.show();
    setTimeout(() => {
      this.spinnerService.hide();
    }, 2000);
  }
}
