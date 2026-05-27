import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/client';

function generateUUID(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}-0000-4000-a000-000000000000`;
}

function ensureUUID(id: string, fallbackInput?: string | null) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  return generateUUID(fallbackInput || id);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = ensureUUID(session.user.id, session.user.email);
  const adminDb = createAdminClient();
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // 1. Get profile from public.profiles
    const { data: profile, error: profileError } = await adminDb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[Profile GET] profiles query error:', profileError);
      return NextResponse.json(
        { error: profileError.message, hint: 'Run supabase/migrations/202605270001_create_profiles_table.sql in your Supabase project.' },
        { status: 500 }
      );
    }

    // 2. Get emergency contacts
    const { data: contacts, error: contactsError } = await adminDb
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (contactsError) {
      return NextResponse.json({ error: contactsError.message }, { status: 500 });
    }

    return NextResponse.json({
      profile: profile || null,
      contacts: contacts || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = ensureUUID(session.user.id, session.user.email);
  const body = await req.json();
  const { name, phone, bloodGroup, conditions, allergies, address, contacts, dob } = body;

  const adminDb = createAdminClient();
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // 1. Ensure user exists in auth.users first to satisfy foreign key constraints
    let finalUserId = userId;
    const { data: authUser, error: checkError } = await adminDb.auth.admin.getUserById(finalUserId);
    
    if (checkError || !authUser?.user) {
      // User doesn't exist in auth.users with this ID, let's create them safely
      const { error: createError } = await adminDb.auth.admin.createUser({
        id: finalUserId,
        email: session.user.email || undefined,
        email_confirm: true,
        user_metadata: {
          full_name: name || session.user.name || 'User',
          avatar_url: session.user.image || null
        },
        phone: phone || undefined
      });
      
      if (createError && createError.message.includes('already been registered') && session.user.email) {
        // Fallback: Use the existing user's ID
        const { data: usersData } = await adminDb.auth.admin.listUsers();
        const existingUser = usersData?.users?.find((u: any) => u.email === session.user.email);
        if (existingUser) {
          finalUserId = existingUser.id;
        }
      } else if (createError) {
        console.warn('[Profile API] Could not create auth user:', createError.message);
      }
    }

    // 2. Upsert user profile in public.profiles
    const parsedConditions = Array.isArray(conditions)
      ? conditions
      : typeof conditions === 'string'
        ? conditions.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const parsedAllergies = Array.isArray(allergies)
      ? allergies
      : typeof allergies === 'string'
        ? allergies.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const profilePayload = {
      id: finalUserId,
      name: name || session.user.name || 'User',
      phone: phone || null,
      medical_data: {
        blood_group: bloodGroup || 'Unknown',
        medical_conditions: parsedConditions,
        allergies: parsedAllergies,
        date_of_birth: dob || null,
        home_address: address || null,
      },
      updated_at: new Date().toISOString()
    };

    const { error: userError } = await adminDb
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (userError) {
      console.error('[Profile POST] upsert error:', userError);
      return NextResponse.json(
        { error: userError.message, hint: 'Run supabase/migrations/202605270001_create_profiles_table.sql in your Supabase project.' },
        { status: 500 }
      );
    }

    // 3. Update emergency contacts
    if (Array.isArray(contacts)) {
      // Delete existing contacts
      const { error: deleteError } = await adminDb
        .from('emergency_contacts')
        .delete()
        .eq('user_id', finalUserId);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      // Insert new ones (if any)
      if (contacts.length > 0) {
        const contactsToInsert = contacts.map((c: any, index: number) => ({
          user_id: finalUserId,
          name: c.name,
          phone: c.phone,
          relationship: c.relationship || c.relation || 'Emergency Contact',
          is_primary: index === 0
        }));

        const { error: contactsError } = await adminDb
          .from('emergency_contacts')
          .insert(contactsToInsert);

        if (contactsError) {
          return NextResponse.json({ error: contactsError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
