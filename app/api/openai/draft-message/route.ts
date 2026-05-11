import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

export async function POST(req: NextRequest) {
  try {
    const { sellerName, context, intent } = await req.json()

    const systemPrompt = `You are a professional warehouse manager at Klassical Holdings Ltd in Luton, UK.
Draft a short, professional, friendly message to a seller partner.
Keep it under 3 sentences. Be helpful and courteous. No greetings or sign-offs needed.`

    const userPrompt = [
      sellerName ? `Seller: ${sellerName}` : '',
      context    ? `Recent conversation:\n${context}` : '',
      intent     ? `Intent: ${intent}` : 'Draft a helpful response based on the conversation.',
    ].filter(Boolean).join('\n\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 150,
      temperature: 0.6,
    })

    return NextResponse.json({ draft: completion.choices[0].message.content?.trim() })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Draft error' }, { status: 500 })
  }
}
