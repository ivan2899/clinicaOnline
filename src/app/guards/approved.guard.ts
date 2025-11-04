import { CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { inject } from '@angular/core';
import { MessagesService } from '../services/messages.service';

interface Profile {
  status: string;
  role: string;
}

export const approvedGuard: CanActivateFn = async (route, state) => {
  const supabase = inject(SupabaseService);
  const messages = inject(MessagesService);

  // 1. Obtener el usuario actual
  const { data: userData, error: userError } = await supabase.getCurrentUser();
  const user = userData?.user;

  // Manejo de error de sesión (poco probable, pero bueno tenerlo)
  if (userError) {
    console.error('Error al obtener la sesión:', userError);
    // Si hay un error, lo tratamos como "no logueado" para permitir la entrada al home
    return true; 
  }

  // A. Caso 1: Usuario NO logueado
  if (!user) {
    // Si no hay usuario, PERMITIR el acceso al home para mostrar el mensaje de bienvenida.
    return true;
  }

  // --- De aquí en adelante, la validación solo corre si SÍ hay un usuario logueado ---

  const currentUserId = user.id;

  // 2. Obtener el status y rol del usuario usando el ID
  const result = await supabase.getStatus(currentUserId);

  if (result.error) {
    console.error('Error al obtener perfil:', result.error);
    messages.wrongStatus('Error en la base de datos.');
    return false;
  }

  const profiles: Profile[] | null = result.data as Profile[] | null;
  const userProfile = profiles?.[0];

  if (!userProfile) {
    messages.wrongStatus('Perfil de usuario no encontrado en la base de datos.');
    return false;
  }

  const { role, status } = userProfile;

  // 3. Lógica de validación
  // ------------------------------------------------------------------

  if (role === 'Paciente') {
    // 🏥 Rol 'paciente': debe tener el mail confirmado (status = 'confirmed')
      return true;
  } 
  
  else if (role === 'Especialista') {
    // 👨‍⚕️ Rol 'especialista': debe tener el status 'approved'
    if (status === 'approved') {
      return true;
    } else {
      messages.wrongStatus('No puedes ingresar, aún no has sido aprobado por un admin.'); // Mostrar mensaje de 'status incorrecto/pendiente'
      await supabase.signOut();
      return false; 
    }
  } 

  else if (role === 'Admin'){
    return true;
  }
  
  else {
    // 🚫 Otros roles o rol no definido (por seguridad, bloqueamos)
    messages.wrongRole(`Rol no autorizado: ${role}`);
    return false;
  }
};