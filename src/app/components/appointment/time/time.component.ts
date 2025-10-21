import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time.component.html',
  styleUrl: './time.component.scss'
})
export class TimeComponent {
  horarios: string[] = []
  horaSeleccionada: string | null = null;
  specialistId: string = ''

  constructor(private router: Router, private supabaseService: SupabaseService) {
    const id = localStorage.getItem('especialistaId');
    if (id) this.specialistId = id;
    console.log(this.horarios);
  }

  async ngOnInit() {
    const res = await this.supabaseService.getQuantitySeleccionados(this.specialistId);
    this.generarHorarios(res.quantity)

    console.log(this.horarios);

  }

  seleccionarHora(hora: any) {
    this.horaSeleccionada = hora;
    console.log('Hora seleccionada:', this.horaSeleccionada);
    localStorage.setItem('hora', hora);
    this.router.navigate(['/request-appointment-confirm']);
  }

  volver() {
    this.router.navigate(['/request-appointment-day']);
  }

  generarHorarios(quantity: number) {
    this.horarios = []; // vaciar array antes de generar
    let hora = 8;
    let minutos = 0;

    for (let i = 0; i < quantity; i++) {
      // Formatear minutos con dos dígitos
      const minStr = minutos === 0 ? '00' : '30';
      this.horarios.push(`${hora}:${minStr}`);

      // Avanzar 30 minutos
      minutos += 30;
      if (minutos === 60) {
        minutos = 0;
        hora++;
      }
    }
  }
}
