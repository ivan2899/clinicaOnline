import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = "";
  password: string = "";

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private messagesServices: MessagesService
  ) { }

  async login() {
    let valido = true;
    let huboError = true;
    let mensaje = '';

    if (!this.username || !this.password) {
      mensaje = "Hay campos incompletos. Verifique su Correo y Clave";
      valido = false;
    }

    if (valido) {
      const { data, error } = await this.supabaseService.signIn(this.username, this.password);

      if (error) {
        mensaje = this.traducirError(error.message);
      } else {
        await this.supabaseService.logUser(this.username);
        huboError = false;
        this.router.navigateByUrl('home', {
          state: { username: this.username }
        });
      }
    }

    if (huboError) {
      this.messagesServices.errorMessage('Error', mensaje);
    }
  }

  private traducirError(codigo: string): string {
    switch (codigo) {
      case 'Invalid login credentials':
        return 'Credenciales inválidas. Verifique su Correo y Clave.';
      case 'Email not confirmed':
        return 'Debe confirmar su correo antes de iniciar sesión.';
      case 'User not found':
        return 'El usuario no existe en el sistema.';
      case 'Password should be at least 6 characters':
        return 'La contraseña debe tener al menos 6 caracteres.';
      default:
        return 'Ocurrió un error inesperado. Intente nuevamente.';
    }
  }

  autoCompletar(user: string) {

    switch (user) {
      case 'paciente':
        this.username = "navebo4226@aperiol.com";
        this.password = "@a--_:5858NaveBor";
        break;
      case 'especialista':
        this.username = "navebo4226@aperiol.com";
        this.password = "@a--_:5858NaveBor";
        break;
      case 'admin':
        this.username = "navebo4226@aperiol.com";
        this.password = "@a--_:5858NaveBor";
        break;

        break;
    }
  }
}