import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_whatsapp,
      message,
      tourName,
      destination,
      slug,
    } = body

    if (!customer_name?.trim() || !customer_phone?.trim()) {
      return NextResponse.json(
        { error: 'Name and phone number are required.' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from('leads').insert({
      customer_name: customer_name.trim(),
      customer_email: customer_email?.trim() || null,
      customer_phone: customer_phone.trim(),
      customer_whatsapp: customer_whatsapp?.trim() || null,
      message: message?.trim() || null,
      service_interest: 'tour',
      destination_interest: destination ?? null,
      source_page: slug ? `/tours/${slug}` : '/tours',
    })

    if (error) {
      console.error('[leads/create]', error.message)
      return NextResponse.json(
        { error: 'Could not save your request. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
