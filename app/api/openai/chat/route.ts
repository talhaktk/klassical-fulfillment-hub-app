import { NextRequest, NextResponse } from 'next/server'
import { openai, SYSTEM_PROMPT } from '@/lib/openai/client'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 600,
      temperature: 0.4,
    })

    return NextResponse.json({ reply: completion.choices[0].message.content })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'AI error' }, { status: 500 })
  }
}
