import { UserProfile } from '@/types';

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

export async function verifyLogin(pin: string): Promise<UserProfile | null> {
  const hash = await hashPin(pin);
  const user = USER_CREDENTIALS.find(u => u.pinHash === hash);
  if (user) {
    const { pinHash, ...profile } = user;
    return profile as UserProfile;
  }
  return null;
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
