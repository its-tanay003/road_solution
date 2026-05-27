import type { Session } from 'next-auth';

export function adminEmails() {
  const emails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  // Fallback for E2E testing environment compatibility (never in production)
  if (process.env.NODE_ENV !== 'production') {
    if (!emails.includes('test@example.com')) {
      emails.push('test@example.com');
    }
  }

  return emails;
}

export function isAdminSession(session: Session | null) {
  const userEmail = session?.user?.email?.toLowerCase();
  return Boolean(userEmail && adminEmails().includes(userEmail));
}

