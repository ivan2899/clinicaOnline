import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'defaultSpecialist',
})
export class DefaultSpecialistPipe implements PipeTransform {
  transform(value: string, fallback: string = 'https://fuwqovndluczbpnnywse.supabase.co/storage/v1/object/public/images/clients/default/iconUser.webp'): string {
    // Si no hay valor o la URL está vacía
    if (!value || value.trim() === '') {
      return fallback;
    }
    return value;
  }
}
