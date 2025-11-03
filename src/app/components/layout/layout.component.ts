import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, LoginComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  isLoggedIn = false;
  id: string = '';
  name = '';
  usuario: any = {};

  private authSub: any;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private messagesService: MessagesService,
  ) { }

  async ngOnInit() {

      this.authSub = this.supabaseService.currentUser$
      .subscribe(user => {
        if (user) {
          // Usuario logueado (incluye carga inicial y revalidación de sesión)
          this.id = user.id;
          this.isLoggedIn = true;

          // Obtenemos el nombre del email o metadatos
          this.name = user.user_metadata?.['name'] || user.email || 'Usuario';

          // 1. Llamamos a la función que trae los datos completos del perfil
          this.fetchProfileData(user.id);

        } else {
          // No hay usuario logueado
          this.isLoggedIn = false;
          this.name = '';
          this.id = '';
          this.usuario = {};
        }
      });   
  }

  // Creamos un método separado para obtener la data del perfil
  private async fetchProfileData(userId: string) {
    try {
      // 2. Traer datos completos del perfil desde 'profiles'
      const { data: perfilData, error: perfilError } = await this.supabaseService.getClientData(userId);

      if (!perfilError && perfilData) {
        this.usuario = perfilData;

        // 💡 Actualiza la propiedad 'name' con el nombre y apellido del perfil si están disponibles
        if (perfilData.first_name && perfilData.last_name) {
          this.name = `${perfilData.first_name} ${perfilData.last_name}`;
        }

      } else {
        console.error('Error al obtener perfil:', perfilError);
      }
    } catch (error) {
      console.error('Error inesperado al cargar perfil:', error);
    }
    // Ocultar el spinner si lo mostraste al inicio de este método
  }

  private async logoutInt() {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
    this.isLoggedIn = false;
  }

  async logout() {
    const isConfirmed = await this.messagesService.warningMessage('¿Estás seguro?', 'Volverás al inicio y deberás loguear');
    if (isConfirmed) this.logoutInt();
  }

  ngOnDestroy() {
    if (this.authSub?.unsubscribe) {
      this.authSub.unsubscribe();
    }
  }
}