import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'defaultAdmin',
})
export class DefaultAdminPipe implements PipeTransform {
  transform(value: string, fallback: string = 'https://fuwqovndluczbpnnywse.supabase.co/storage/v1/object/public/images/clients/default/adming.webp'): string {
    // Si no hay valor o la URL está vacía
    if (!value || value.trim() === '') {
      return fallback;
    }
    return value;
  }
}

