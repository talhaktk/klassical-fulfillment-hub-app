import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST — create user directly with password (no email invite)
export async function POST(request: Request) {
  const supabase = createServiceClient()
  const { name, email, role, seller_id, password } = await request.json()

  if (!name || !email || !role || !password) {
    return NextResponse.json({ error: 'name, email, role and password are required' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { error: profileError } = await supabase.from('user_profiles').insert({
    id:        data.user.id,
    name,
    role,
    seller_id: seller_id ?? null,
    status:    'active',
  })

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 })

  await supabase.from('audit_logs').insert({
    action: 'user.created', target_type: 'user', target_id: data.user.id,
    details: { name, email, role },
  })

  return NextResponse.json({ success: true })
}

// DELETE — hard delete user (super admin only)
export async function DELETE(request: Request) {
  const supabase = createServiceClient()
  const { userId, userEmail } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  await supabase.from('user_profiles').delete().eq('id', userId)
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('audit_logs').insert({
    action: 'user.deleted', target_type: 'user', target_id: userId,
    details: { email: userEmail },
  })

  return NextResponse.json({ success: true })
}
