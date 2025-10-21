import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LayoutComponent } from "./components/layout/layout.component";
import { SpinnerComponent } from './components/spinner/spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink,LayoutComponent, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
