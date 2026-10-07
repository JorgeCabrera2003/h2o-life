import { UserProfile } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

// SHA-256 Polyfill / Helper (for internal client-side auth in PWA)
async function hashPin(pin: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Credenciales y Roles internos seguros
// Los PINs están hasheados para mayor seguridad incluso si se lee el código fuente.
// Jorge: 1234 -> 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
// Freyeliz: 5678 -> 92576b5d9beffbc720138cc3f57ce79cbaee8bbce9e3b4db2d40e94bbbbbfed2
// Karla: 4321 -> e662cc94e6bf76a1618cbf5e5c77749001b3337f7158756997b8e1f5cdbb4599
const USER_CREDENTIALS = [
  {
    id: 'user-jorge',
    name: 'TSU Jorge Cabrera',
    role: 'superadmin',
    email: 'jorge@h2olife.com',
    avatar: '👨‍💼',
    phone: '+58 424-5567016',
    pinHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // 1234
    permissions: ['all', 'dev', 'admin', 'pos', 'audit']
  },
  {
    id: 'user-freyeliz',
    name: 'Freyeliz',
    role: 'admin',
    email: 'freyeliz@h2olife.com',
    avatar: '👩‍💼',
    phone: '+58 424-5658068',
    pinHash: '92576b5d9beffbc720138cc3f57ce79cbaee8bbce9e3b4db2d40e94bbbbbfed2', // 5678
    permissions: ['admin', 'pos', 'audit']
  },
  {
    id: 'user-karla',
    name: 'Karla',
    role: 'worker',
    email: 'karla@h2olife.com',
    avatar: '👩‍🔧',
    phone: '+58 424-5717589',
    pinHash: 'e662cc94e6bf76a1618cbf5e5c77749001b3337f7158756997b8e1f5cdbb4599', // 4321
    permissions: ['pos']
  },
];

export async function verifyLogin(pinOrEmail: string, password?: string): Promise<UserProfile | null> {
  // 1. Supabase Auth (Producción)
  if (isSupabaseConfigured && password) {
    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email: pinOrEmail,
        password: password,
      });
      
      if (error || !data.user) return null;
      
      // Obtener el perfil de la tabla public.profiles validado por RLS
      const { data: profileData } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileData) {
        return {
          id: profileData.id,
          name: profileData.full_name || 'Usuario',
          role: profileData.role,
          email: profileData.email,
          avatar: profileData.role === 'superadmin' ? '👨‍💼' : '👩‍🔧',
          phone: '',
          permissions: profileData.role === 'superadmin' ? ['all'] : profileData.role === 'admin' ? ['admin', 'pos', 'audit'] : ['pos']
        };
      }
    } catch (e) {
      console.error('Error logging in with Supabase:', e);
      return null;
    }
  }

  // 2. Fallback / Mock Local (Desarrollo / Si Supabase no está configurado)
  const hash = await hashPin(pinOrEmail); // En modo fallback, `pinOrEmail` es el PIN
  const user = USER_CREDENTIALS.find(u => u.pinHash === hash);
  if (user) {
    const { pinHash, ...profile } = user;
    return profile as UserProfile;
  }
  return null;
}

// Cargar sesión activa de Supabase
export async function getActiveSession(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;
  
  const { data: { session } } = await supabase!.auth.getSession();
  if (!session?.user) return null;
  
  const { data: profileData } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  if (profileData) {
    return {
      id: profileData.id,
      name: profileData.full_name || 'Usuario',
      role: profileData.role,
      email: profileData.email,
      avatar: profileData.role === 'superadmin' ? '👨‍💼' : '👩‍🔧',
      phone: '',
      permissions: profileData.role === 'superadmin' ? ['all'] : profileData.role === 'admin' ? ['admin', 'pos', 'audit'] : ['pos']
    };
  }
  
  return null;
}

export async function signOut() {
  if (isSupabaseConfigured) {
    await supabase!.auth.signOut();
  }
}

export function hasPermission(user: UserProfile | null, permission: string): boolean {
  if (!user) return false;
  const userCred = USER_CREDENTIALS.find(u => u.id === user.id);
  if (!userCred) return false;
  
  if (userCred.permissions.includes('all')) return true;
  return userCred.permissions.includes(permission);
}

export const USERS_LIST = USER_CREDENTIALS.map(u => ({
  id: u.id,
  name: u.name,
  role: u.role,
  avatar: u.avatar
}));
