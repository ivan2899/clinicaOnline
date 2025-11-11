import { Component, SimpleChanges } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { SpinnerService } from '../../services/spinner.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isLogged = false;
  role: string | null = '';
  text: string = 'Mis turnos';

  private authSubscription: Subscription = new Subscription();

  constructor(private spinnerService: SpinnerService, private supabaseService: SupabaseService, private router: Router) {
  }

  async ngOnInit() {
    // Muestra el spinner inmediatamente
    this.spinnerService.show();

    // 1. Suscripción al estado del usuario
    this.authSubscription = this.supabaseService.currentUser$
      .subscribe(user => {
        // Este código se ejecuta SIEMPRE que Supabase termine de verificar la sesión
        // (al inicio, al volver a la pestaña, al loguearse/desloguearse)

        if (user) {
          // Usuario encontrado: procede a buscar el rol
          this.isLogged = true;
          this.fetchUserRoleAndData(user);
        } else {
          // No hay usuario logueado
          this.isLogged = false;
          this.role = null;
          this.spinnerService.hide();
        }
      });
  }

  // Nueva función asíncrona para traer los datos después de la autenticación
  private async fetchUserRoleAndData(user: User) {
    try {
      // 2. Obtener rol del usuario
      const { data: roleData, error: roleError } = await this.supabaseService.getRole(user.id);

      if (roleError) {
        console.error('Error obteniendo rol:', roleError.message);
        this.role = null;
      } else {
        this.role = roleData?.role || null;
        switch (this.role) {
          case 'Paciente':
            this.text = 'Bienvenido, Paciente';
            break;
          case 'Especialista':
            this.text = 'Panel del Especialista';
            break;
          case 'Admin':
            this.text = 'Turnos';
            break;
        }
      }
    } catch (err) {
      console.error('Error al cargar datos adicionales:', err);
    } finally {
      // 3. Ocultar el spinner SOLO después de que toda la data haya sido cargada
      this.spinnerService.hide();
    }
  }

  ngOnDestroy(): void {
    // Importante: Limpia la suscripción para evitar pérdidas de memoria
    this.authSubscription.unsubscribe();
  }

  red(rol: string) {
    switch (rol) {
      case 'Admin':
        this.router.navigateByUrl('/appointments-list')
        break;
      default:
        this.router.navigateByUrl('/my-appointment')
        break;
    }
  }
}
