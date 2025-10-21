import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MessagesService } from '../../services/messages.service';
import Toastify from 'toastify-js';

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
        this.toast();
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
      case 'admin':
        this.username = "admin@clinicaonline.com";
        this.password = "@a--_:5858NaveBor";
        break;
      case 'especialistaUno':
        this.username = "j_perez21@clinicaonline.com";
        this.password = "#LunA:49_zT7@dev";
        break;
      case 'especialistaDos':
        this.username = "s_alvarez1344@clinicaonline.com";
        this.password = "r@Y-5!noVel_AbC";
        break;
      case 'pacienteUno':
        this.username = "j_gimenez@clinicaonline.com";
        this.password = "xZ@--_38Moon*UpeBor";
        break;
      case 'pacienteDos':
        this.username = "i_cordoba@clinicaonline.com";
        this.password = "@@FoX-94:plAnE_t";
        break;
      case 'pacienteTres':
        this.username = "p_ramirez@clinicaonline.com";
        this.password = "!SoL_22@rCaZ_yT";
        break;
    }
  }

  toast() {
    Toastify({
      text: "Debes confirmar tu correo",
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
}