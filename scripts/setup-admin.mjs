/**
 * Run once to bootstrap the admin_users table and create the first superadmin.
 * Usage: node scripts/setup-admin.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ynrzvfvcoyliwlnczhtb.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('❌  Missing SUPABASE_SERVICE_ROLE_KEY env variable.')
  console.error('    Run: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/setup-admin.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── 1. Create admin_users table ───────────────────────────────────────────────
async function createTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      create table if not exists public.admin_users (
        id              uuid primary key default gen_random_uuid(),
        auth_user_id    uuid references auth.users(id) on delete cascade,
        email           text not null,
        full_name       text,
        role            text not null check (role in ('super_admin','manager_admin','agent_admin')),
        is_active       boolean not null default true,
        created_at      timestamptz not null default now(),
        updated_at      timestamptz not null default now()
      );

      -- Row-level security (only service role can write; admins read own row via auth)
      alter table public.admin_users enable row level security;

      create policy if not exists "Admins can read own record"
        on public.admin_users for select
        using (auth.uid() = auth_user_id);
    `
  })

  if (error) {
    // Table may already exist or exec_sql not available — try direct insert approach
    console.log('ℹ️   Table setup via RPC skipped (may already exist):', error.message)
  } else {
    console.log('✅  admin_users table ready.')
  }
}

// ── 2. Create Supabase Auth user ──────────────────────────────────────────────
async function createAuthUser(email, password, name) {
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existing = existingUsers?.users?.find(u => u.email === email)

  if (existing) {
    console.log('ℹ️   Auth user already exists, updating password...')
    const { error } = await supabase.auth.admin.updateUserById(existing.id, { password })
    if (error) throw new Error(`Failed to update password: ${error.message}`)
    console.log('✅  Password updated.')
    return existing.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,  // skip confirmation email
    user_metadata: { full_name: name },
  })

  if (error) throw new Error(`Failed to create auth user: ${error.message}`)
  console.log('✅  Auth user created:', data.user.id)
  return data.user.id
}

// ── 3. Upsert admin_users record ─────────────────────────────────────────────
async function upsertAdminRecord(authUserId, email, name, role) {
  // Delete any existing record for this auth user first, then insert fresh
  await supabase.from('admin_users').delete().eq('auth_user_id', authUserId)

  const { error } = await supabase
    .from('admin_users')
    .insert({ auth_user_id: authUserId, email, full_name: name, role, is_active: true })

  if (error) throw new Error(`Failed to insert admin record: ${error.message}`)
  console.log(`✅  admin_users record inserted as ${role}.`)
}

// ── Main ─────────────────────────────────────────────────────────────────────
const ADMIN_EMAIL    = 'nnneboh@gmail.com'
const ADMIN_PASSWORD = 'Voyages@01'
const ADMIN_NAME     = 'AceAdmin'
const ADMIN_ROLE     = 'super_admin'

;(async () => {
  console.log('\n🚀  ACE Voyages — Admin bootstrap\n')
  try {
    await createTable()
    const authId = await createAuthUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME)
    await upsertAdminRecord(authId, ADMIN_EMAIL, ADMIN_NAME, ADMIN_ROLE)
    console.log('\n🎉  Done! Login at /admin/login')
    console.log(`    Email:    ${ADMIN_EMAIL}`)
    console.log(`    Password: ${ADMIN_PASSWORD}`)
    console.log(`    Role:     ${ADMIN_ROLE}\n`)
  } catch (err) {
    console.error('\n❌ ', err.message)
    process.exit(1)
  }
})()
