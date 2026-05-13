import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Check SUPABASE_SERVICE_ROLE_KEY is set
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response('ERROR: SUPABASE_SERVICE_ROLE_KEY env var is not set in Vercel.', { status: 500, headers: { 'Content-Type': 'text/plain' } })
    }

    // Find user in auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) return new Response(`Auth list error: ${listError.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } })

    const target = users.find(u => u.email === 'dr.talhaktk@gmail.com')
    if (!target) return new Response(`User not found in auth.users. Users found: ${users.map(u => u.email).join(', ')}`, { status: 404, headers: { 'Content-Type': 'text/plain' } })

    // Check current profile
    const { data: existing } = await supabase.from('user_profiles').select('*').eq('id', target.id).single()

    // Force update role to admin
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({ id: target.id, name: 'Dr Talha', role: 'admin', status: 'active' }, { onConflict: 'id' })

    if (updateError) return new Response(`Upsert error: ${updateError.message}\nExisting profile: ${JSON.stringify(existing)}`, { status: 400, headers: { 'Content-Type': 'text/plain' } })

    // Verify it was saved
    const { data: updated } = await supabase.from('user_profiles').select('*').eq('id', target.id).single()

    return new Response(
      `✅ SUCCESS!\nUser ID: ${target.id}\nEmail: ${target.email}\nBefore: ${JSON.stringify(existing)}\nAfter: ${JSON.stringify(updated)}\n\nNow sign out and sign back in.`,
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )
  } catch (err: any) {
    return new Response(`Exception: ${err.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } })
  }
}
