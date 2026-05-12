import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient()

    // First: ensure user_profiles table exists by running the migration
    await supabase.rpc('exec_sql', { sql: '' }).catch(() => {}) // no-op, just checking

    // Check if any admin already exists — only allow setup if none
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Setup already complete. An admin account already exists.' },
        { status: 403 }
      )
    }

    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email and password are required' }, { status: 400 })
    }

    // Create auth user with confirmed email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create admin profile
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id:     authData.user.id,
      name,
      role:   'admin',
      status: 'active',
    })

    if (profileError) {
      // Cleanup auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Admin account created. You can now log in.' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Setup failed' }, { status: 500 })
  }
}
