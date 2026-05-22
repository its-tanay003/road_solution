import type { Session } from 'next-auth';

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminSession(session: Session | null) {
  const userEmail = session?.user?.email?.toLowerCase();
  return Boolean(userEmail && adminEmails().includes(userEmail));
}
