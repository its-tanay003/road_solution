import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const adminDb = createAdminClient();
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // 1. Get profile from public.users
    const { data: profile, error: profileError } = await adminDb
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 2. Get emergency contacts
    const { data: contacts, error: contactsError } = await adminDb
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

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

  const userId = session.user.id;
  const body = await req.json();
  const { name, phone, bloodGroup, conditions, address, contacts } = body;

  const adminDb = createAdminClient();
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // 1. Ensure user exists in auth.users first to satisfy foreign key constraints
    const { data: authUser, error: checkError } = await adminDb.auth.admin.getUserById(userId);
    
    if (checkError || !authUser?.user) {
      // User doesn't exist in auth.users, let's create them
      const { error: createError } = await adminDb.auth.admin.createUser({
        id: userId,
        email: session.user.email || undefined,
        email_confirm: true,
        user_metadata: {
          full_name: name || session.user.name || 'User',
          avatar_url: session.user.image || null
        },
        phone: phone || undefined
      });
      
      if (createError) {
        console.warn('[Profile API] Could not create auth user:', createError.message);
      }
    }

    // 2. Upsert user profile in public.users
    const parsedConditions = Array.isArray(conditions)
      ? conditions
      : typeof conditions === 'string'
        ? conditions.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const { error: userError } = await adminDb
      .from('users')
      .upsert({
        id: userId,
        full_name: name || session.user.name || 'User',
        phone: phone || null,
        blood_group: bloodGroup || 'Unknown',
        medical_conditions: parsedConditions,
        home_address: address || null,
        updated_at: new Date().toISOString()
      });

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // 3. Update emergency contacts
    if (Array.isArray(contacts)) {
      // Delete existing contacts
      const { error: deleteError } = await adminDb
        .from('emergency_contacts')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      // Insert new ones (if any)
      if (contacts.length > 0) {
        const contactsToInsert = contacts.map((c, index) => ({
          user_id: userId,
          name: c.name,
          phone: c.phone,
          relationship: c.relationship || c.relation || 'Emergency Contact',
          sort_order: index,
          notify_via_sms: true,
          notify_via_whatsapp: true,
          notify_via_email: false
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
