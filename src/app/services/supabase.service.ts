import { Injectable } from '@angular/core';
import { AuthChangeEvent, createClient, RealtimeChannel, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // 1. BehaviorSubject para el estado de la sesión
  // Se inicializa en 'undefined' para indicar que aún no se ha verificado el estado.
  private _session$ = new BehaviorSubject<Session | undefined | null>(undefined);

  // Observable público para que los componentes se suscriban
  public session$: Observable<Session | null | undefined> = this._session$.asObservable();

  // Observable para el usuario, más conveniente para los componentes
  public currentUser$: Observable<User | null> = this.session$.pipe(
    filter(session => session !== undefined), // Esperamos a que se determine el estado inicial
    // Mapeamos la sesión a solo el objeto User
    // Si la sesión es null, el usuario es null.
    // Si la sesión tiene un objeto, tomamos session.user
    map(session => (session ? session.user : null))
  );

  constructor() {
    this.supabase = createClient(
      environment.apiUrl, environment.publicAnonKey,
    );

    // Configura la suscripción al estado de autenticación de Supabase
    this.setupAuthStateListener();
  }

  // Método central para manejar el estado de autenticación
  private setupAuthStateListener() {
    // Escucha todos los eventos de cambio de estado de autenticación (LOGIN, LOGOUT, REFRESH, INITIAL_SESSION)
    this.supabase.auth.onAuthStateChange((event, session) => {
      // 2. Actualizamos el BehaviorSubject con el estado más reciente de la sesión
      this._session$.next(session);

      console.log('Auth Event:', event, 'Session:', session ? 'Active' : 'Inactive');
    });
  }

  // ------------------
  // 🔹 AUTH (Se mantienen tus métodos, pero ahora se recomienda usar session$ o currentUser$)
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

  // Este método ahora es redundante si usas session$, pero lo mantenemos para compatibilidad
  async getSession() {
    return await this.supabase.auth.getSession();
  }

  // Este método se simplifica o se vuelve redundante si usas currentUser$
  async getCurrentUser() {
    // o simplemente obtener el usuario de la sesión, no es necesario hacer un 'getUser' extra
    const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession();

    if (sessionError || !sessionData?.session) {
      return { data: { user: null }, error: sessionError || { message: 'No hay sesión activa' } };
    }

    return { data: { user: sessionData.session.user }, error: null };
  }

  // Ya no necesitas este método de timeout, el patrón de BehaviorSubject lo soluciona
  async waitWithTimeout(promise: Promise<any>, ms: number) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout esperando Supabase')), ms)
    );
    return Promise.race([promise, timeout]);
  }

  // ------------------
  // 🔹 Perfiles y Datos (el resto se mantiene igual)
  // ------------------

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

  async getStatus(id: string) {
    return await this.supabase
      .from('profiles')
      .select('status, role')
      .eq('auth_id', id);
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

  async dayLog(days: string[], quantity: number, time: string) {
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
          time_start: time,
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