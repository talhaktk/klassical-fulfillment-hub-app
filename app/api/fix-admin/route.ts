import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// One-time endpoint: sets dr.talhaktk@gmail.com as admin
// Safe to call multiple times — just upserts the profile
export async function GET() {
  try {
    const supabase = createServiceClient()

    // Find the auth user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) return new Response(`Error: ${listError.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } })

    const target = users.find(u => u.email === 'dr.talhaktk@gmail.com')
    if (!target) return new Response('User dr.talhaktk@gmail.com not found in auth. Make sure you have logged in at least once.', { status: 404, headers: { 'Content-Type': 'text/plain' } })

    // Upsert user_profiles with admin role
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id:     target.id,
        name:   'Dr Talha',
        role:   'admin',
        status: 'active',
      }, { onConflict: 'id' })

    if (profileError) return new Response(`Profile error: ${profileError.message}`, { status: 400, headers: { 'Content-Type': 'text/plain' } })

    return new Response(
      '✅ SUCCESS! dr.talhaktk@gmail.com is now ADMIN.\n\nLog out and log back in — you will see Super Admin badge and full user management access.',
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } })
  }
}
