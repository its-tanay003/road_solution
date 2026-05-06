import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { Request, Response, NextFunction } from 'express';

export const supabaseSsrMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(req.headers.cookie ?? '').map(cookie => ({
            name: cookie.name,
            value: cookie.value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookie(name, value, options);
          });
        },
      },
    }
  );

  // Add supabase client to request object for use in routes
  (req as any).supabase = supabase;

  // Optional: check for user and add to req
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    (req as any).user = user;
    (req as any).userId = user.id;
  }

  next();
};
