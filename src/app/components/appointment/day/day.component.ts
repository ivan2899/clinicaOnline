import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-day',
  standalone: false,
  templateUrl: './day.component.html',
  styleUrl: './day.component.scss'
})
export class DayComponent {
  specialistId : string = '';
  dias: string[] = [];
  dia: string = ''

  constructor(private router: Router, private supabaseService: SupabaseService) {
    const id = localStorage.getItem('especialistaId');
    if(id) this.specialistId = id;
  }

  async ngOnInit() {
    this.dias = await this.supabaseService.getDiasSeleccionados(this.specialistId);
    console.log(this.dias);
  }

  seleccionarDia(dia: any) {
    localStorage.setItem('dia', JSON.stringify(dia));
    this.router.navigate(['appointment/request-appointment-confirm']);
  }

  volver() {
    this.router.navigate(['appointment/request-appointment-speciality']);
  }
}
