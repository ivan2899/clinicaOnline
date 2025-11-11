import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appUpperCase]',
  standalone: true
})
export class UpperCaseDirective {

  private timeout: any;

  @HostListener('input', ['$event'])
  onInput(event: any) {
    // Cancela cualquier conversión anterior si el usuario sigue escribiendo
    clearTimeout(this.timeout);

    const input = event.target;

    // Espera 1 segundo después de que el usuario deje de escribir
    this.timeout = setTimeout(() => {
      input.value = input.value.toUpperCase();
    }, 1000);
  }
}
