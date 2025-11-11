import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-section.component.html',
  styleUrl: './user-section.component.scss'
})
export class UserSectionComponent {

  constructor(
    private router: Router
  ){}

  redirigir(){
    this.router.navigateByUrl('/register', {state: {from: 'admin'}})
  }
}
