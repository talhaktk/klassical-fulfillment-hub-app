import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient()

    // Check if any admin already exists — only allow setup once
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

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const { error: profileError } = await supabase.from('user_profiles').insert({
      id:     authData.user.id,
      name,
      role:   'admin',
      status: 'active',
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Setup failed' }, { status: 500 })
  }
}

// GET — creates the default admin in one click (only works if no admin exists)
export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (existing && existing.length > 0) {
      return new Response('Admin already exists. Setup is locked.', { status: 403, headers: { 'Content-Type': 'text/plain' } })
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email:         'dr.talhaktk@gmail.com',
      password:      'Amazon@123',
      email_confirm: true,
    })

    if (authError) {
      return new Response(`Error: ${authError.message}`, { status: 400, headers: { 'Content-Type': 'text/plain' } })
    }

    const { error: profileError } = await supabase.from('user_profiles').insert({
      id:     authData.user.id,
      name:   'Dr Talha Idrees',
      role:   'admin',
      status: 'active',
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return new Response(`Profile error: ${profileError.message}`, { status: 400, headers: { 'Content-Type': 'text/plain' } })
    }

    return new Response(
      'SUCCESS! Admin account created.\nEmail: dr.talhaktk@gmail.com\nPassword: Amazon@123\n\nGo to /auth/login to sign in.',
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } })
  }
}
