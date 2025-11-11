import { Component } from '@angular/core';
import { ProfileUser } from '../../../models/profile-user.model';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentModule } from '../../../modules/appointment/appointment.module';

@Component({
  selector: 'app-specialist',
  standalone: true,
  imports: [CommonModule, RouterLink, AppointmentModule],
  templateUrl: './specialist.component.html',
  styleUrl: './specialist.component.scss'
})
export class SpecialistComponent {
  users: ProfileUser[] = [];
  paginatedUsers: ProfileUser[] = [];
  loading = true;

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  showModal = false;
  selectedUser: any = null;

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    this.users = await this.supabaseService.getSpecialistPending();
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

  async acceptUser(user: any) {
    this.loading = true; // Mostrar spinner
    await this.supabaseService.changeStatus(user.auth_id, 'approved');
    await this.reloadUsers();
    this.loading = false;
  }

  async rejectUser(user: any) {
    this.loading = true; // Mostrar spinner
    await this.supabaseService.changeStatus(user.auth_id, 'rejected');
    await this.reloadUsers();
    this.loading = false;
  }

  private async reloadUsers() {
  this.users = await this.supabaseService.getSpecialistPending();
  this.totalPages = Math.ceil(this.users.length / this.pageSize);
  // Asegurarse de que la página actual no se pase del total
  if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
  this.loadPage(this.currentPage);
}

  async viewUserDetails(user: any) {
    const data = await this.supabaseService.getClientData(user.auth_id)
    this.selectedUser = data.data;
    this.showModal = true;
  }


  closeModal() {
    this.showModal = false;
    this.selectedUser = null;
  }
}
