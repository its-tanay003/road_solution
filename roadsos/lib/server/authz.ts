import type { Session } from 'next-auth';

export function adminEmails() {
  const emails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  console.log(`[authz.ts] process.env.NODE_ENV: ${process.env.NODE_ENV}, process.env.ADMIN_EMAILS: ${process.env.ADMIN_EMAILS}`);

  // Fallback for E2E testing environment compatibility
  if (process.env.NODE_ENV !== 'production') {
    if (!emails.includes('test@example.com')) {
      emails.push('test@example.com');
    }
  }

  console.log(`[authz.ts] Final admin emails list:`, emails);
  return emails;
}

export function isAdminSession(session: Session | null) {
  const userEmail = session?.user?.email?.toLowerCase();
  const res = Boolean(userEmail && adminEmails().includes(userEmail));
  console.log(`[authz.ts] User Email: ${userEmail}, Is Admin Session: ${res}`);
  return res;
}

