import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Appointment } from '../models/appointment.model';
import { Patient } from '../models/patient.model';

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

  async getPatients() {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('auth_id, first_name, last_name, first_photo_url')
      .eq('role', 'Paciente')

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

  async pushHistoryEnd(appointment: Appointment, patientData: Patient, dinamics: any) {
    let id;

    const dinamicObj: Record<string, any> = {};
    dinamics.forEach((d: { key: string; value: any }) => {
      if (d.key) dinamicObj[d.key] = d.value;
    });

    const toInsert: any = { ...appointment };
    id = toInsert.id;
    delete toInsert.id;
    delete toInsert.is_active;
    delete toInsert.specialist_name;
    delete toInsert.user_name;
    delete toInsert.answered_attention;
    delete toInsert.answered_survey;
    delete toInsert.updated_at;

    // Agregar campos adicionales para guardar en el historial
    const payload = {
      ...toInsert,
      is_end: true,
      id_history: id,
      dinamic: dinamicObj,
      height: patientData.altura,
      weight: patientData.peso,
      temperature: patientData.temperatura,
      pressure: patientData.presion,
      description: patientData.descripcion
    };

    const { data, error } = await this.supabase.client
      .from('history')
      .insert([payload]);

    if (error) {
      console.error('Error al insertar historial:', error);
    }
  }

  async appointmentEnd(id: number) {
    const { data, error } = await this.supabase.client
      .from('appointments')
      .update({
        is_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return { data, error };
  }

  async pushHistoryCancel(appointment: Appointment, text: string) {
    let id;
    // Excluir is_active del objeto
    const toInsert: any = { ...appointment };
    id = toInsert.id;
    delete toInsert.id;
    delete toInsert.is_active;
    delete toInsert.specialist_name;
    delete toInsert.user_name;
    delete toInsert.answered_attention;
    delete toInsert.answered_survey;
    delete toInsert.updated_at;

    // Agregar campos adicionales para guardar en el historial
    const payload = {
      ...toInsert,
      is_end: false,
      id_history: id,
      commentary: text,
    };

    const { data, error } = await this.supabase.client
      .from('history')
      .insert([payload]);

    if (error) {
      console.error('Error al insertar historial:', error);
    }
  }

  async changeStatus(id: number) {
    await this.supabase.client
      .from('appointments')
      .update({ is_active: false })
      .eq('id', id)
  }

  async changeStatusEnd(id: number) {
    await this.supabase.client
      .from('appointments')
      .update({ is_active: false, is_end: true })
      .eq('id', id)
  }

  async changeStatusDos(id: number) {
    await this.supabase.client
      .from('appointments')
      .update({ is_confirm: false, is_end: false })
      .eq('id', id)
  }

  async changeConfirm(id: number, status: boolean) {
    await this.supabase.client
      .from('appointments')
      .update({ is_confirm: status })
      .eq('id', id)
  }

  async getHistoryAppointment() {
    const { data, error } = await this.supabase.client
      .from('history')
      .select('*')

    return { data, error };
  }

  async getHistoryAppointmentPatient(id: string) {
    // Traemos los turnos
    const { data: appointments, error } = await this.supabase.client
      .from('history')
      .select('*')
      .eq('user_id', id)


    if (error) {
      console.error('Error al obtener turnos:', error.message);
      return [];
    }

    if (!appointments || appointments.length === 0) return [];

    // Obtenemos todos los auth_id únicos de specialist y user
    const authIds = [
      ...new Set([
        ...appointments.map(a => a.specialist_id),
        ...appointments.map(a => a.user_id)
      ])
    ];

    // Traemos los perfiles
    const { data: profiles } = await this.supabase.client
      .from('profiles')
      .select('auth_id, first_name, last_name')
      .in('auth_id', authIds);

    // Creamos un mapa para acceder rápido a los nombres
    const profilesMap = new Map(
      profiles?.map(p => [p.auth_id, `${p.first_name} ${p.last_name}`]) || []
    );

    // Mapear nombres a cada appointment
    return appointments.map(a => ({
      ...a,
      specialist_name: profilesMap.get(a.specialist_id) || 'Desconocido',
      user_name: profilesMap.get(a.user_id) || 'Desconocido',
    }));
  }

  async getHistoryAppointmentSpecialist(id: string) {
    // Traemos los turnos
    const { data: appointments, error } = await this.supabase.client
      .from('history')
      .select('*')
      .eq('specialist_id', id)


    if (error) {
      console.error('Error al obtener turnos:', error.message);
      return [];
    }

    if (!appointments || appointments.length === 0) return [];

    // Obtenemos todos los auth_id únicos de specialist y user
    const authIds = [
      ...new Set([
        ...appointments.map(a => a.specialist_id),
        ...appointments.map(a => a.user_id)
      ])
    ];

    // Traemos los perfiles
    const { data: profiles } = await this.supabase.client
      .from('profiles')
      .select('auth_id, first_name, last_name')
      .in('auth_id', authIds);

    // Creamos un mapa para acceder rápido a los nombres
    const profilesMap = new Map(
      profiles?.map(p => [p.auth_id, `${p.first_name} ${p.last_name}`]) || []
    );

    // Mapear nombres a cada appointment
    return appointments.map(a => ({
      ...a,
      specialist_name: profilesMap.get(a.specialist_id) || 'Desconocido',
      user_name: profilesMap.get(a.user_id) || 'Desconocido',
    }));
  }

  async getHistoryAppointmentWithPatient(id: string) {
    const { data, error } = await this.supabase.client
      .from('history')
      .select('*')
      .eq('specialty', id)

    return { data, error };
  }

  async getDataHistory(id: number) {
    const { data, error } = await this.supabase.client
      .from('history')
      .select('commentary')
      .eq('id_history', id)
      .single();

    return { data, error };
  }

  async getResHistory(id: number) {
    const { data, error } = await this.supabase.client
      .from('history')
      .select('description')
      .eq('id_history', id)
      .single();

    return { data, error };
  }

  async newAttention(attention: number, clean: number, place: number, appointment_id: number) {
    const { data, error } = await this.supabase.client
      .from('attention')
      .insert([{ attention, clean, place, appointment_id }]);

    return { data, error };
  }

  async newSurvey(text: string, appointment_id: number) {
    const { data, error } = await this.supabase.client
      .from('survey')
      .insert([{ text, appointment_id }]);

    return { data, error };
  }

  async changeStatusAttention(id: number) {
    const { data, error } = await this.supabase.client
      .from('appointments')
      .update({ answered_attention: true })
      .eq('id', id)

    return { data, error };
  }

  async changeStatusSurvey(id: number) {
    const { data, error } = await this.supabase.client
      .from('appointments')
      .update({ answered_survey: true })
      .eq('id', id)

    return { data, error };
  }
}
