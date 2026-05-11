import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createServiceClient()

  const { name, email, role, seller_id } = await request.json()

  if (!name || !email || !role) {
    return NextResponse.json({ error: 'name, email and role are required' }, { status: 400 })
  }

  // Invite user via Supabase Auth (sends magic link / invite email)
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { name, role },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Create user profile
  const { error: profileError } = await supabase.from('user_profiles').insert({
    id:        data.user.id,
    name,
    role,
    seller_id: seller_id ?? null,
    status:    'active',
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
