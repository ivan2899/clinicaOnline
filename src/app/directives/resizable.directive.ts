import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appResizable]',
  standalone: true
})
export class ResizableDirective {

     constructor(private el: ElementRef<HTMLTextAreaElement>) {}

  @HostListener('input')
  onInput() {
    const textarea = this.el.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
