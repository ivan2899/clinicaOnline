import { Component } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  currentPage = 1;
  pageSize = 5;
  history: any = [];
  loading = true;
  userId = '';
  patientName: string = '';

  constructor(
    private appointmentService: AppointmentService,
    private supabaseService: SupabaseService,
    private pdfService: PdfService
  ) { }

  async ngOnInit() {
    const data = await this.supabaseService.getCurrentUser()
    if (data?.data?.user?.id) {
      this.userId = data?.data?.user?.id;

      if (data?.data?.user.role == 'Paciente') {
        const dto = await this.appointmentService.getHistoryAppointmentPatient(data?.data?.user?.id);
        this.history = dto;
      } else {
        const dto = await this.appointmentService.getHistoryAppointmentSpecialist(data?.data?.user?.id);
        this.history = dto;
      }
    }
    this.loading = false;
  }

  get paginatedHistory() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.history.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.history.length / this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  formatDate(date: string) {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-AR');
  }

  verHistorial(id: number, name: string) {
    this.patientName = name;
  }

  async descargaPDF() {
    await this.pdfService.generatePdf('Historia', this.history);
  }
}
