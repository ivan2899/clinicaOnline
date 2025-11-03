import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'defaultImage'
})
export class DefaultImagePipe implements PipeTransform {

  transform(value: string, fallback: string = 'https://fuwqovndluczbpnnywse.supabase.co/storage/v1/object/public/images/speciality/default.webp'): string {
    // Si no hay valor o la URL está vacía
    if (!value || value.trim() === '') {
      return fallback;
    }
    return value;
  }
}
