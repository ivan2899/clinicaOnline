import { Component } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
 loading = false;
  loadingText = 'Cargando';
  private intervalId: any;
  private subscription!: Subscription;

  constructor(private spinnerService: SpinnerService) {}

  ngOnInit() {
    this.subscription = this.spinnerService.loading$.subscribe((state) => {
      this.loading = state;
      if (state) {
        this.startTextAnimation();
      } else {
        this.stopTextAnimation();
      }
    });
  }

  startTextAnimation() {
    let dotCount = 0;
    this.loadingText = 'Cargando';
    this.intervalId = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      this.loadingText = 'Cargando' + '.'.repeat(dotCount);
    }, 500);
  }

  stopTextAnimation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy() {
    this.stopTextAnimation();
    this.subscription.unsubscribe();
  }
}
