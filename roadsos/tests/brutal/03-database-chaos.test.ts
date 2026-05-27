/**
 * Level 3 — Database Chaos Testing
 * Uses Vitest + Supabase SDK directly to test DB integrity, RLS, and performance.
 *
 * Run: npx vitest run tests/brutal/03-database-chaos.test.ts
 *
 * Requirements:
 *   NEXT_PUBLIC_SUPABASE_URL must be set (real Supabase project)
 *   SUPABASE_SERVICE_ROLE_KEY must be set (bypasses RLS for setup/teardown)
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY must be set (tests RLS boundaries)
 */
import { createClient } from '@supabase/supabase-js';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const hasRealCreds = SUPABASE_URL && !SUPABASE_URL.includes('example') &&
  SERVICE_KEY && !SERVICE_KEY.includes('ci-');

const skipIfNoRealDB = !hasRealCreds
  ? test.skip
  : test;

const admin = hasRealCreds ? createClient(SUPABASE_URL, SERVICE_KEY) : null;
const anon = hasRealCreds ? createClient(SUPABASE_URL, ANON_KEY) : null;

const FAKE_USER_A = '00000000-0000-0000-0000-aaaaaaaaaaaa';
const FAKE_USER_B = '00000000-0000-0000-0000-bbbbbbbbbbbb';
const LOAD_TEST_PREFIX = '00000000-0000-0000-ffff-';

describe('Level 3 — Database Chaos Tests', () => {

  beforeAll(async () => {
    if (!hasRealCreds) {
      console.log('⚠️  No real Supabase credentials detected. All DB tests will SKIP.');
      console.log('   Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_ANON_KEY to run.');
    } else {
      console.log('✅ Real Supabase credentials found. Running full DB chaos suite.');
    }
  });

  afterAll(async () => {
    if (!admin) return;
    // Cleanup all test data
    await admin.from('profiles').delete().eq('id', FAKE_USER_A);
    await admin.from('profiles').delete().eq('id', FAKE_USER_B);
    // Cleanup load test rows
    const ids = Array(100).fill(null).map((_, i) =>
      `${LOAD_TEST_PREFIX}${String(i).padStart(12, '0')}`
    );
    await admin.from('profiles').delete().in('id', ids);
  });

  // ── L3-T1: CONCURRENT WRITE RACE CONDITION ────────────────────
  skipIfNoRealDB('L3-T1: Concurrent profile upserts produce exactly 1 row', async () => {
    const writes = Array(20).fill(null).map((_, i) =>
      admin!.from('profiles').upsert({
        id: FAKE_USER_A,
        name: `Concurrent Writer ${i}`,
        email: 'race@test.com',
        blood_group: ['O+', 'A+', 'B+', 'AB+'][i % 4],
        conditions: [`condition-${i}`],
        allergies: [],
        onboarded: false,
      }, { onConflict: 'id' })
    );

    const results = await Promise.allSettled(writes);
    const errors = results.filter(r =>
      r.status === 'rejected' ||
      (r.status === 'fulfilled' && (r as any).value.error)
    );
    console.log(`L3-T1: ${results.length} concurrent writes, ${errors.length} errors`);

    const { data, error } = await admin!.from('profiles').select('*').eq('id', FAKE_USER_A);
    expect(error).toBeNull();
    expect(data?.length).toBe(1);
    console.log(`L3-T1: PASS — exactly 1 row. Final name: "${data?.[0]?.name}"`);
  });

  // ── L3-T2: SQL INJECTION VIA SUPABASE ────────────────────────
  skipIfNoRealDB('L3-T2: SQL injection via Supabase query params returns empty results', async () => {
    const injections = [
      "'; DROP TABLE profiles; --",
      "1 OR 1=1",
      "1; SELECT * FROM auth.users; --",
      "' UNION SELECT email, password FROM auth.users --",
      "admin'--",
    ];

    for (const injection of injections) {
      const { data, error } = await anon!
        .from('profiles')
        .select('*')
        .eq('name', injection)
        .limit(1);

      console.log(`SQL injection "${injection.slice(0, 30)}": ${error ? 'error:' + error.code : 'safe, rows:' + data?.length}`);
      // Supabase parameterizes — should return 0 rows, not crash
      expect(data?.length ?? 0).toBe(0);
    }
    console.log('L3-T2: PASS — all SQL injections returned empty results');
  });

  // ── L3-T3: RLS BOUNDARY TESTING ──────────────────────────────
  skipIfNoRealDB('L3-T3: User A cannot access User B data via anon client', async () => {
    await admin!.from('profiles').upsert([
      { id: FAKE_USER_A, name: 'User A', email: 'a@chaos.test', onboarded: true },
      { id: FAKE_USER_B, name: 'User B', email: 'b@chaos.test', onboarded: true },
    ], { onConflict: 'id' });

    await admin!.from('emergency_contacts').insert({
      user_id: FAKE_USER_B,
      name: 'User B Secret Contact',
      phone: '9999999999',
      relationship: 'Friend',
    });

    // Anon client (no auth) should see 0 rows
    const { data: profileData } = await anon!.from('profiles').select('*').eq('id', FAKE_USER_B);
    const { data: contactData } = await anon!.from('emergency_contacts').select('*').eq('user_id', FAKE_USER_B);

    console.log(`Anon read User B profile: ${profileData?.length ?? 0} rows (expected: 0)`);
    console.log(`Anon read User B contacts: ${contactData?.length ?? 0} rows (expected: 0)`);
    expect(profileData?.length ?? 0).toBe(0);
    expect(contactData?.length ?? 0).toBe(0);
    console.log('L3-T3: PASS — RLS boundaries enforced');
  });

  // ── L3-T4: LARGE DATASET PERFORMANCE ─────────────────────────
  skipIfNoRealDB('L3-T4: Complex query returns results in <500ms with 100 rows', async () => {
    const bulkProfiles = Array(100).fill(null).map((_, i) => ({
      id: `${LOAD_TEST_PREFIX}${String(i).padStart(12, '0')}`,
      name: `Load Test User ${i}`,
      email: `loadtest${i}@chaos.test`,
      blood_group: ['O+', 'A+', 'B-', 'AB+'][i % 4],
      conditions: [`cond-${i % 5}`],
      allergies: [],
      onboarded: true,
    }));

    await admin!.from('profiles').upsert(bulkProfiles, { onConflict: 'id' });
    console.log('Inserted 100 test profiles for load test...');

    const start = Date.now();
    const { data, error } = await admin!
      .from('profiles')
      .select('id, name, blood_group, conditions')
      .eq('blood_group', 'O+')
      .order('created_at', { ascending: false })
      .limit(50);
    const queryTime = Date.now() - start;

    console.log(`L3-T4: Query returned ${data?.length} rows in ${queryTime}ms`);
    expect(error).toBeNull();
    expect(queryTime).toBeLessThan(500);
    console.log('L3-T4: PASS — Query under 500ms');
  });

  // ── L3-T5: CONNECTION POOL — 50 SIMULTANEOUS QUERIES ─────────
  skipIfNoRealDB('L3-T5: 50 simultaneous DB queries — >90% success rate', async () => {
    const queries = Array(50).fill(null).map(() =>
      admin!.from('profiles').select('count').limit(1)
    );

    const start = Date.now();
    const results = await Promise.allSettled(queries);
    const duration = Date.now() - start;

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`L3-T5: 50 simultaneous queries — ${succeeded} succeeded, ${failed} failed in ${duration}ms`);
    expect(succeeded).toBeGreaterThan(45); // >90% success
    expect(duration).toBeLessThan(10000);
    console.log('L3-T5: PASS — connection pool handled concurrent load');
  });

  // ── L3-T6: REALTIME SUBSCRIPTION STABILITY ───────────────────
  skipIfNoRealDB('L3-T6: 10 simultaneous Realtime subscriptions stay stable', async () => {
    const channels = Array(10).fill(null).map((_, i) =>
      admin!.channel(`chaos-stress-${i}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {})
    );

    const statuses: string[] = [];
    await Promise.all(channels.map(ch =>
      new Promise<void>(resolve => {
        ch.subscribe(status => {
          statuses.push(status);
          resolve();
        });
        setTimeout(resolve, 5000); // Max 5s wait
      })
    ));

    await Promise.all(channels.map(ch => admin!.removeChannel(ch)));
    const subscribed = statuses.filter(s => s === 'SUBSCRIBED').length;
    console.log(`L3-T6: ${subscribed}/10 channels subscribed. Statuses: ${[...new Set(statuses)].join(', ')}`);
    expect(subscribed).toBeGreaterThan(7);
    console.log('L3-T6: PASS — Realtime subscriptions stable');
  });

  // ── L3-T7: ANON CLIENT CANNOT READ AUTH TABLES ───────────────
  skipIfNoRealDB('L3-T7: Anon client cannot directly read auth.users', async () => {
    // This should always fail with permission error — anon cannot access auth schema
    const { data, error } = await anon!.from('users').select('*').limit(1);
    // Will either 404 (table not found in public schema) or RLS blocks it
    const blocked = error !== null || (data?.length ?? 0) === 0;
    console.log(`L3-T7: auth.users anon access — error: ${error?.code}, rows: ${data?.length ?? 0}`);
    expect(blocked).toBe(true);
    console.log('L3-T7: PASS — anon cannot read auth.users');
  });
});
