import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHover]',
  standalone: true
})
export class HoverDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Agrega una transición suave
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', '#17a589');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1.05)');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.removeStyle(this.el.nativeElement, 'background-color');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
  }
}
