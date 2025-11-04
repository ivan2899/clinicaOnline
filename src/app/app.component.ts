import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LayoutComponent } from "./components/layout/layout.component";
import { SpinnerComponent } from './components/spinner/spinner.component';
import { trigger, transition, style, query, animate, group } from '@angular/animations';

// Define la animación de transición de página
const slideAnimation = trigger('routeAnimations', [
    // Define la transición de Entrada (e.g., /login -> /registro)
    // Se ejecuta cuando la ruta cambia
    transition('* => *', [ 
        // 1. Esconder los elementos anteriores y preparar los nuevos
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
        
        // 2. Definir la posición inicial del nuevo componente (viene de la derecha)
        query(':enter', style({ transform: 'translateX(100%)' }), { optional: true }),

        // 3. Agrupar las animaciones de salida y entrada para que sean simultáneas
        group([
            // Transición del componente saliente (se va a la izquierda)
            query(':leave', [
                animate('400ms ease-in-out', style({ transform: 'translateX(-100%)' }))
            ], { optional: true }),
            
            // Transición del componente entrante (se mueve de la derecha al centro)
            query(':enter', [
                animate('400ms ease-in-out', style({ transform: 'translateX(0%)' }))
            ], { optional: true })
        ])
    ])
]);
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink,LayoutComponent, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',

  animations: [slideAnimation] // Se inyecta la definición de la animación
})

/*  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      
    }
  `],*/
export class AppComponent {
    getRouteAnimationData(outlet: RouterOutlet) {
    // Si necesitas animaciones condicionales, usarías la data de la ruta (e.g., return outlet.activatedRouteData['animation']).
    // Para una transición simple en todas las rutas, retorna algo fijo.
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
