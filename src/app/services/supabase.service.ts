import { Injectable } from '@angular/core';
import { AuthChangeEvent, createClient, RealtimeChannel, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  // ------------------
  // 🔹 AUTH
  // ------------------

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({ email, password });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getSession() {
    return await this.supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async getCurrentUser() {
    return await this.supabase.auth.getUser();
  }

  async getRole(id: string) {
    return await this.supabase
      .from('profiles')
      .select('role')
      .eq('auth_id', id)
      .single();
  }

  get client() {
    return this.supabase;
  }

  async getClientData(id: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', id)
      .single();

    return { data, error };
  }

  // ------------------
  // 🔹 LOGS
  // ------------------
  async logUser(name: string) {
    return await this.supabase.from('logs').insert([{ name }]);
  }

  // ------------------
  // 🔹 USUARIOS
  // ------------------

  async userExists(email: string) {
    return await this.supabase
      .from('profiles')
      .select('*')
      .eq('email', email);
  }

  async saveUserDataPac(user: User, firstName: string, lastName: string, age: number, dni: number, email: string, healtInsurance: string, firstPhotoUrl: string, secondPhotoUrl: string) {
    return await this.supabase
      .from('profiles')
      .insert([{ auth_id: user.id, first_name: firstName, last_name: lastName, email, age, dni, health_insurance: healtInsurance, first_photo_url: firstPhotoUrl, second_photo_url: secondPhotoUrl, role: 'Paciente' }]);
  }

  async saveUserDataEspecialist(user: User, firstName: string, lastName: string, age: number, dni: number, email: string, specialty: string, firstPhotoUrl: string) {
    return await this.supabase
      .from('profiles')
      .insert([{ authId: user.id, first_name: firstName, last_name: lastName, email, age, dni, specialty, first_photo_url: firstPhotoUrl, status: 'pending', role: 'Especialista' }]);
  }

  async saveUserAdmin(user: User, firstName: string, lastName: string, age: number, dni: number, email: string, url: string) {
    return await this.supabase
      .from('profiles')
      .insert([{ authId: user.id, firstName, email, role: 'Admin' }]);
  }



  // ------------------
  // 🔹 Cargas
  // ------------------

  async surveyLog(name: string, age: number, phone: number, game: string, difficult: string, suggestion: string) {
    const res = await this.getCurrentUser();
    const user = res.data.user;

    if (!user) {
      throw new Error("No hay usuario logueado");
    }
    await this.supabase
      .from('datos-encuesta')
      .insert([{ name, age, phone, game, difficult, suggestion, user: user.email }]);
  }

  async dayLog(days: string[], quantity: number) {
    // 1️⃣ Obtener usuario actual
    const res = await this.getCurrentUser();
    const user = res.data.user;

    if (!user) {
      throw new Error('No hay usuario logueado');
    }

    // 2️⃣ Crear objeto con los días booleanos
    const dayFields = {
      monday: days.includes('Lunes'),
      tuesday: days.includes('Martes'),
      wednesday: days.includes('Miércoles'),
      thursday: days.includes('Jueves'),
      friday: days.includes('Viernes'),
      saturday: days.includes('Sábado'),
      quantity,
    };

    // 3️⃣ Upsert (inserta o actualiza según el user_id)
    const { data, error } = await this.supabase
      .from('days_worked')
      .upsert(
        {
          specialist_id: user.id,
          ...dayFields,
        },
        { onConflict: 'specialist_id' } // 👈 importante, evita duplicados
      );

    if (error) {
      console.error('Error al guardar días:', error.message);
      throw new Error('No se pudieron guardar los días de trabajo');
    }
    return data;
  }


  async getDiasSeleccionados(userId: string): Promise<string[]> {
    // 1️⃣ Consultar la fila del especialista
    const { data, error } = await this.supabase
      .from('days_worked')
      .select('*')
      .eq('specialist_id', userId)
      .single();

    if (error) {
      console.error('Error al obtener días de trabajo:', error.message);
      return [];
    }

    if (!data) {
      return [];
    }

    // 2️⃣ Transformar los booleanos en array de strings
    const dias: string[] = [];
    if (data.monday) dias.push('Lunes');
    if (data.tuesday) dias.push('Martes');
    if (data.wednesday) dias.push('Miércoles');
    if (data.thursday) dias.push('Jueves');
    if (data.friday) dias.push('Viernes');
    if (data.saturday) dias.push('Sábado');

    return dias;
  }

  async getQuantitySeleccionados(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('days_worked')
      .select('quantity')
      .eq('specialist_id', userId)
      .single();

    if (error) {
      console.error('Error al obtener turnos de trabajo:', error.message);
      return -1;
    }

    if (!data) {
      return -1;
    }

    return data;
  }
}