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
import { Appointment } from '../../../models/appointment.model';
import { Patient } from '../../../models/patient.model';

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
  appo: Appointment = {
    specialist_id: '',
    user_id: '',
    speciality: '',
    day: '',
    time: '',
    is_confirm: false,
    created_at: ''
  };

  opciones = [0, 1, 2, 3, 4, 5];

  specialities: any[] = []; // se llena con la consulta de especialidades
  specialists: any[] = []; // se llena con la consulta de especialistas
  patients: any[] = []; // se llena con la consulta de pacientes

  showSpecialityModal = false;
  showSpecialistModal = false;
  showPatientModal = false;
  showText = false;
  showDesc = false;
  showMotivoModal = false;
  showSurvey = false;
  showAttention = false;
  motivoText: string = '';
  motivoTitle: string = '';

  filteredUsers: any[] = []; // usuarios filtrados

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  patientData: Patient = {
    altura: 0,
    peso: 0,
    temperatura: 0,
    presion: '',
    descripcion: ''
  };
  dynamicFields: { key: string; value: string }[] = [];
  appoId: number = 0;

  srvText: string = '';
  srvAttention: number = 0;
  srvClean: number = 0;
  srvPlace: number = 0;

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

  openEndModal() {
    this.showDesc = true;
  }

  async openMotivoModal(id: number, type: string) {
    if (type == 'end') {
      this.motivoTitle = 'Reseña del turno';
      const result = await this.appointmentService.getResHistory(id);
      this.motivoText = result.data?.description || 'Sin reseña registrada.';
    } else {
      this.motivoTitle = 'Motivo del rechazo';
      const result = await this.appointmentService.getDataHistory(id);
      this.motivoText = result.data?.commentary || 'Sin motivo registrado.';
    }
    this.showMotivoModal = true;
  }

  closeMotivoModal() {
    this.showMotivoModal = false;
    this.motivoText = '';
  }

  closeModals() {
    this.showSpecialityModal = false;
    this.showSpecialistModal = false;
    this.showPatientModal = false;
    this.showDesc = false;
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

  async cancel(id: number, app: Appointment) {
    await this.appointmentService.changeStatus(id);
    await this.appointmentService.changeStatusDos(id);
    this.openTextModal();
    this.appo = app;
  }

  async confirm(id: number) {
    await this.appointmentService.changeConfirm(id, true);
    this.toastService.toast('El turno fue aceptado con éxito')
  }

  async finalize(id: number, app: Appointment) {
    await this.appointmentService.changeStatus(id);
    await this.appointmentService.changeStatusEnd(id);
    this.openEndModal();
    this.appo = app;
    this.appoId = id;
  }

  async end() {
    this.showDesc = false;
    await this.appointmentService.pushHistoryEnd(this.appo, this.patientData, this.dynamicFields);
    //await this.appointmentService.appointmentEnd(this.appoId)
    this.toastService.toast('El turno se finalizó con éxito')
  }

  async send() {
    this.showText = false;
    this.text = `El turno fue cancelado por ${this.role}: ` + this.text
    await this.appointmentService.pushHistoryCancel(this.appo, this.text)
    this.toastService.toast('El turno se canceló con éxito')
    this.loadPage(this.currentPage);
  }

  soloNumeros(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  soloPresion(event: KeyboardEvent) {
    const allowed = /^[0-9\/]$/; // números o barra

    if (!allowed.test(event.key)) {
      event.preventDefault();
    }
  }

  async survey(id: number, txt: string) {
    if (txt == 'survey') {
      await this.appointmentService.changeStatusSurvey(id);
      this.appoId = id;
      this.openSurveyModal();
    } else {
      await this.appointmentService.changeStatusAttention(id);
      this.appoId = id;
      this.openCalificacionModal();
    }
  }

  async saveSurvey() {
    this.toastService.toast('La encuesta fue enviada con éxito')
    await this.appointmentService.newSurvey(this.srvText, this.appoId)
    this.closeSurveyModal();
  }

  openSurveyModal() {
    this.showSurvey = true;
  }

  closeSurveyModal() {
    this.showSurvey = false;
  }

  openCalificacionModal() {
    this.showAttention = true;
  }

  closeCalificacionModal() {
    this.showAttention = false;
  }

  async guardarCalificacion() {
    this.toastService.toast('La calificación fue enviada con éxito')
    await this.appointmentService.newAttention(this.srvAttention, this.srvClean, this.srvPlace, this.appoId)
    this.closeCalificacionModal();
  }

  addField() {
    this.dynamicFields.push({ key: '', value: '' });
  }

  removeField(index: number) {
    this.dynamicFields.splice(index, 1);
  }
}