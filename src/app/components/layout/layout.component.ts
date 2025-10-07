import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, LoginComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  isLoggedIn = false;
  email = '';
  name = '';

  private authSub: any;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private messagesService: MessagesService
  ) { }

  async ngOnInit() {
    const { data } = await this.supabaseService.getCurrentUser();
    if (data.user) {
      this.isLoggedIn = true;
      this.name = data.user.user_metadata?.['name'] || data.user.email;
    }

    this.authSub = this.supabaseService.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this.isLoggedIn = true;
        this.name = session.user.user_metadata?.['name'] || session.user.email;
      } else {
        this.isLoggedIn = false;
        this.name = '';
      }
    });
  }

  private async logoutInt() {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
    this.isLoggedIn = false;
  }

  async logout() {
    const isConfirmed = await this.messagesService.warningMessage('¿Estás seguro?', 'Volverás al inicio y deberás loguear');
    if (isConfirmed) this.logoutInt();
  }

  ngOnDestroy() {
    if (this.authSub?.unsubscribe) {
      this.authSub.unsubscribe();
    }
  }
}