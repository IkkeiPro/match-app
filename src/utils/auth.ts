export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = import.meta.env.VITE_PASSWORD_SALT || 'default-salt';
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}