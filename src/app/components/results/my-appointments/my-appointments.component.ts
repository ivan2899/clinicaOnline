import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
import { UpperCaseDirective } from '../../../directives/upper-case.directive';
import { HoverDirective } from '../../../directives/hover.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HoverDirective, UpperCaseDirective, ResizableDirective],
  templateUrl: './my-appointments.component.html',
  styleUrl: './my-appointments.component.scss'
})
export class MyAppointmentsComponent {
  turns: any[] = [];
  paginatedTurns: any[] = [];
  loading = true;
  role = '';
  text: string = '';

  specialities: any[] = []; // se llena con la consulta de especialidades
  specialists: any[] = []; // se llena con la consulta de especialistas
  patients: any[] = []; // se llena con la consulta de pacientes

  showSpecialityModal = false;
  showSpecialistModal = false;
  showPatientModal = false;
  showText = false;

  filteredUsers: any[] = []; // usuarios filtrados

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;


  constructor(
    private supabaseService: SupabaseService,
    private appointmentService: AppointmentService,
    private toastService: ToastService
  ) { }

  async ngOnInit() {
    const data = await this.supabaseService.getCurrentUser()
    if (data?.data?.user?.id) {
      const rol = await this.supabaseService.getRole(data?.data?.user?.id);
      this.role = rol.data?.role;

      if (this.role == 'Paciente') {
        this.turns = await this.supabaseService.getAppointmentsPatient(data?.data?.user?.id);
      } else {
        this.turns = await this.supabaseService.getAppointmentsSpecialist(data?.data?.user?.id);
      }
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

      const pa = await this.appointmentService.getPatients();
      if (pa && pa.data) {
        this.patients = pa.data.map((e: any) => ({
          id: e.auth_id,
          nombreCompleto: `${e.first_name} ${e.last_name}`,
          foto: e.first_photo_url
        }));
      }

      this.filteredUsers = [...this.turns];
      this.totalPages = Math.ceil(this.turns.length / this.pageSize);
      this.loadPage(this.currentPage);
      this.loading = false;
    }
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

  openSpecialityModal() {
    this.showSpecialityModal = true;
  }

  openSpecialistModal() {
    this.showSpecialistModal = true;
  }

  openPatientModal() {
    this.showPatientModal = true;
  }

  openTextModal() {
    this.showText = true;
  }

  closeModals() {
    this.showSpecialityModal = false;
    this.showSpecialistModal = false;
    this.showPatientModal = false;
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

  // Filtrar por especialista
  filterBySpecialist(specialist: any) {
    this.filteredUsers = this.turns.filter(u => u.specialist_id === specialist);
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1;
    this.loadPage(this.currentPage);
    this.closeModals();
  }

  // Filtrar por paciente
  filterByPatient(patient: any) {
    this.filteredUsers = this.turns.filter(u => u.user_id === patient);
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

  async cancel(id: number) {
    await this.appointmentService.changeStatus(id);
    this.openTextModal();
  }

  async reject(id: number) {
    await this.appointmentService.changeConfirm(id, false);
    this.openTextModal();
  }

  async confirm(id: number) {
    await this.appointmentService.changeConfirm(id, true);
  }

  send() {
    this.showText = false;
    console.log(this.text);
    this.toastService.toast('El turno se canceló con éxito')
    this.loadPage(this.currentPage);
  }
}