import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-appointment',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './list-appointment.component.html',
  styleUrl: './list-appointment.component.scss'
})
export class ListAppointmentComponent {
  turns: any[] = [];
  paginatedTurns: any[] = [];
  loading = true;

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    this.turns = await this.supabaseService.getAppointments(); // Debe devolver los turnos
    console.log(this.turns);

    this.totalPages = Math.ceil(this.turns.length / this.pageSize);
    this.loadPage(this.currentPage);
    this.loading = false;
  }

  loadPage(page: number) {
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTurns = this.turns.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadPage(page);
  }

  formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}