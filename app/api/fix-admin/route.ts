import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) return new Response(`Auth list error: ${listError.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } })

    const target = users.find(u => u.email === 'dr.talhaktk@gmail.com')
    if (!target) return new Response('User not found.', { status: 404, headers: { 'Content-Type': 'text/plain' } })

    // 1. Update user_profiles table
    await supabase.from('user_profiles')
      .upsert({ id: target.id, name: 'Dr Talha', role: 'admin', status: 'active' }, { onConflict: 'id' })

    // 2. Also set role in auth user_metadata so it works even if RLS blocks the profile read
    const { error: metaError } = await supabase.auth.admin.updateUserById(target.id, {
      user_metadata: { role: 'admin', name: 'Dr Talha' }
    })
    if (metaError) return new Response(`Metadata error: ${metaError.message}`, { status: 400, headers: { 'Content-Type': 'text/plain' } })

    return new Response(
      '✅ Done! Role set to admin in BOTH user_profiles and auth metadata.\n\nSign out and sign back in — you will see Super Admin badge.',
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )
  } catch (err: any) {
    return new Response(`Exception: ${err.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } })
  }
}
