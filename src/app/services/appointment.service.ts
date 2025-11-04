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

  async getSpecialist() {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('auth_id, first_name, last_name, first_photo_url')
      .eq('role', 'Especialista')

    return { data, error };
  }

  async getSpecialityWithSpecialist(specialist: string) {
  // 1️⃣ Buscar las especialidades del especialista
  const { data: profile, error: profileError } = await this.supabase.client
    .from('profiles')
    .select('specialty')
    .eq('auth_id', specialist)
    .single();

  if (profileError || !profile) {
    console.error('Error obteniendo especialidades del especialista:', profileError);
    return { data: null, error: profileError };
  }

  // 2️⃣ Hacer inner query con esas especialidades en la tabla "specialitys"
  const { data: specialtiesData, error: specialtiesError } = await this.supabase.client
    .from('specialitys')
    .select('speciality, img_url')
    .in('speciality', profile.specialty); // 👈 como es array, va directo

  if (specialtiesError) {
    console.error('Error obteniendo datos de las especialidades:', specialtiesError);
    return { data: null, error: specialtiesError };
  }

  return { data: specialtiesData, error: null };
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
      .insert([{ specialist_id: specialistId, user_id: userId, speciality, day, time, is_active: true }]);

    return { data, error };
  }
}
