import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppointmentModule } from '../../../modules/appointment/appointment.module';
import { ProfileUser } from '../../../models/profile-user.model';

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

  constructor(private supabaseService: SupabaseService) { }

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
}