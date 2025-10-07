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

  get client() {
    return this.supabase;
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
      .from('datos-usuarios')
      .select('*')
      .eq('email', email);
  }

  async saveUserData(user: User, name: string, email: string) {
    return await this.supabase
      .from('datos-usuarios')
      .insert([{ authId: user.id, name, email, role: 'Usuario' }]);
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

  async gameLog(score: number, game: string) {
    const res = await this.getCurrentUser();
    const user = res.data.user;

    if (!user) {
      throw new Error("No hay usuario logueado");
    }
    await this.supabase
      .from('datos-juegos')
      .insert([{ email: user.email, puntos: score, juego: game }]);
  }

  async loadSurveyResults(page: number = 1, pageSize: number = 5): Promise<{ data: any[]; total: number } | null> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await this.supabase
      .from('datos-encuesta')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .order('name', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error cargando resultados:', error.message);
      return null;
    }

    return { data: data ?? [], total: count ?? 0 };
  }

  async loadGameResults(
    page: number = 1,
    pageSize: number = 5,
    juego?: string
  ): Promise<{ data: any[]; total: number } | null> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from('datos-juegos')
      .select('*', { count: 'exact' })
      .order('puntos', { ascending: false })
      .range(from, to);

    if (juego) {
      query = query.eq('juego', juego);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error cargando resultados de juegos:', error.message);
      return null;
    }

    return { data: data ?? [], total: count ?? 0 };
  }
}