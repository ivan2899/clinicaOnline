import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppointmentModule } from '../../../modules/appointment/appointment.module';
import { ProfileUser } from '../../../models/profile-user.model';
import { ExcelService } from '../../../services/excel.service';
import { AppointmentService } from '../../../services/appointment.service';
import { PdfService } from '../../../services/pdf.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppointmentModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  users: ProfileUser[] = [];
  paginatedUsers: ProfileUser[] = [];
  loading = true;

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  history: any = [];

  constructor(
    private supabaseService: SupabaseService,
    private excelService: ExcelService,
    private appointmentService: AppointmentService,
    private pdfService: PdfService,
    private spinnerService: SpinnerService,
    private toastService: ToastService

  ) { }

  async ngOnInit() {
    this.users = await this.supabaseService.getUsers();
    this.totalPages = Math.ceil(this.users.length / this.pageSize);
    this.loadPage(this.currentPage);
    this.loading = false;
  }

  loadPage(page: number) {
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.users.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadPage(page);
  }

  descargarExcel() {
    const hoy = new Date();

    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();

    const nombreArchivo = `listado_usuarios(${dia}-${mes}-${anio})`;

    this.excelService.descargarExcel(this.users, nombreArchivo);
  }

  async download(user: any) {
    console.log(user);

    try {
      this.spinnerService.show();

      if (user.role == 'Paciente') {
        const dto = await this.appointmentService.getHistoryAppointmentPatient(user.auth_id);
        this.history = dto;
        this.pdfService.generatePdf(`Historia clinica - ${user.first_name} ${user.last_name}`, this.history)
      } else if (user.role == 'Especialista') {
        const dto = await this.appointmentService.getHistoryAppointmentSpecialist(user.auth_id);
        this.history = dto;
        this.pdfService.generatePdf(`Historia clinica - ${user.first_name} ${user.last_name}`, this.history)
      } else {
        this.toastService.toast('Los admin no tienen historia clinica')
      }
    } catch (error) {

    } finally {
      this.spinnerService.hide();
    }

  }
}