import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private supabase: SupabaseService) { }

  async getSpecialitys() {
    const { data, error } = await this.supabase.client
      .from('specialitys')
      .select('*')

    return { data, error };
  }

  async getSpecialistWithSpeciality(speciality: string) {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('auth_id, first_name, last_name, first_photo_url')
      .eq('specialty', speciality)

    return { data, error };
  }

  async pushAppointment(specialistId: string, userId: string, speciality: string, day: string, time: string) {
    const { data, error } = await this.supabase.client
      .from('appointments')
      .insert([{ specialist_id: specialistId, user_id: userId, speciality, day, time, is_active: true}]);

    return { data, error };
  }
}
