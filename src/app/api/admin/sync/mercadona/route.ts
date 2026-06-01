import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadonaProvider } from '@/services/supermarkets/mercadona/MercadonaProvider'

export async function POST() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isDev = process.env.NODE_ENV !== 'production'
  const { data: membership } = await supabase
    .from('household_members')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  const isAdmin = membership?.role === 'admin'
  if (!isAdmin && !isDev) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const provider = new MercadonaProvider()
    const result = await provider.syncProducts()
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
