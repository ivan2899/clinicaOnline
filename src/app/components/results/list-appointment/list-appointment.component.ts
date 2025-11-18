import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Appointment } from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointment.service';
import { ToastService } from '../../../services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-appointment',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './list-appointment.component.html',
  styleUrl: './list-appointment.component.scss'
})
export class ListAppointmentComponent {
  turns: any[] = [];
  paginatedTurns: any[] = [];
  loading = true;
  filteredUsers: any[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  specialities: any[] = []; // se llena con la consulta de especialidades
  specialists: any[] = []; // se llena con la consulta de especialistas

  showSpecialityModal = false;
  showSpecialistModal = false;
  showText = false;
  text: string = '';
  role: string = '';

  appo: Appointment = {
    specialist_id: '',
    user_id: '',
    speciality: '',
    day: '',
    time: '',
    is_confirm: false,
    created_at: ''
  };

  constructor(private supabaseService: SupabaseService, private appointmentService: AppointmentService, private toastService: ToastService) { }

  async ngOnInit() {
    const data = await this.supabaseService.getCurrentUser()
    if (data?.data?.user?.id) {
      const rol = await this.supabaseService.getRole(data?.data?.user?.id);
      this.role = rol.data?.role;
    }
    this.turns = await this.supabaseService.getAppointments(); // Debe devolver los turnos
    console.log(this.turns);

          const res = await this.appointmentService.getSpecialist();
      if (res && res.data) {
        this.specialists = res.data.map((e: any) => ({
          id: e.auth_id,
          nombreCompleto: `${e.first_name} ${e.last_name}`,
          foto: e.first_photo_url
        }));
      }

      const spe = await this.appointmentService.getSpecialitys();
      if (spe && spe.data) {
        this.specialities = spe.data.map((e: any) => ({
          id: e.id,
          nombre: e.speciality,
          foto: e.img_url
        }));
      }

    this.filteredUsers = [...this.turns];
    this.totalPages = Math.ceil(this.turns.length / this.pageSize);
    this.loadPage(this.currentPage);
    this.loading = false;
  }
  
  loadPage(page: number) {
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTurns = this.filteredUsers.slice(start, end);
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

  openTextModal() {
    this.showText = true;
  }

  openSpecialityModal() {
    this.showSpecialityModal = true;
  }

  openSpecialistModal() {
    this.showSpecialistModal = true;
  }

  closeModals() {
    this.showSpecialityModal = false;
    this.showSpecialistModal = false;
    this.showText = false;
  }

  filterBySpecialist(specialist: any) {
    this.filteredUsers = this.turns.filter(u => u.specialist_id === specialist);
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1;
    this.loadPage(this.currentPage);
    this.closeModals();
  }

  // Filtrar por especialidad
  filterBySpeciality(speciality: string) {
    this.filteredUsers = this.turns.filter(u => u.speciality === speciality);
    console.log(speciality);

    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1;
    this.loadPage(this.currentPage);
    this.closeModals();
  }

  clearFilters() {
    this.filteredUsers = [...this.turns];
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1;
    this.loadPage(this.currentPage);
  }

  async cancel(id: number, app: Appointment) {
    await this.appointmentService.changeStatus(id);
    this.openTextModal();
    this.appo = app;
  }

  async send() {
    this.showText = false;
    this.text = `El turno fue cancelado por ${this.role} ` + this.text
    await this.appointmentService.pushHistoryCancel(this.appo, this.text)
    this.toastService.toast('El turno se canceló con éxito')
    this.loadPage(this.currentPage);
  }
}