import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from "sweetalert2";

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private router: Router) { }

  errorMessage(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: "error",
      background: "#fccfcf"
    });
  }

  equalMessage(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: "info",
      timer: 2000,
      timerProgressBar: true,
      background: "#ffa"
    });
  }

  succesMessage(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: "success",
      timer: 2000,
      timerProgressBar: true,
      color: '#000',
      background: "rgba(26, 111, 0, 1)"
    });
  }

  warningMessage(title: string, text: string): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      background: '#ece390ff',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result) => { return result.isConfirmed; });
  }

  helpMessage(text: string) {
    Swal.fire({
      title: "Cómo funciona?",
      text: text,
      icon: "question",
      background: "#ffa"
    });
  }

  wrongRole(text: string) {
    Swal.fire({
      title: '😢 UPS, no es un rol permitido',
      text: text,
      icon: 'error',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#fccfcf'
    });
  }

  anonymous() {
    let timerInterval: any;
    let secondsLeft = 10;

    Swal.fire({
      title: 'No iniciaste sesión',
      html: `No puedes ingresar, serás redirigido al login en <b>${secondsLeft}</b> segundos.`,
      icon: 'error',
      timer: secondsLeft * 1000,
      timerProgressBar: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar redirección',
      confirmButtonText: 'Ir ahora',
      background: '#fccfcf',
      allowOutsideClick: false,
      didOpen: () => {
        const b = Swal.getHtmlContainer()?.querySelector('b');
        timerInterval = setInterval(() => {
          if (b) {
            secondsLeft--;
            b.textContent = secondsLeft.toString();
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer || result.isConfirmed) {
        this.router.navigateByUrl('/login');
      }
    });
  }

  wrongStatus(text : string) {
    Swal.fire({
      title: 'Acceso denegado',
      text: text,
      icon: 'error',
      background: "#fccfcf",
      confirmButtonText: 'OK'
    });
  }
}
