import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

const PARSE_PROMPT = `You are a warehouse order parser. Extract structured order data from unstructured text.
Return ONLY valid JSON matching this structure (no markdown):
{
  "order_number": "string or null",
  "customer_name": "string or null",
  "customer_address": "string or null",
  "customer_postcode": "string or null",
  "carrier": "string or null",
  "priority": "urgent|high|normal|low",
  "items": [{ "sku": "string or null", "product_name": "string", "quantity": number }],
  "notes": "string or null"
}`

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: PARSE_PROMPT },
        { role: 'user',   content: `Parse this order:\n\n${text}` },
      ],
      max_tokens: 500,
      temperature: 0,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(raw)
    return NextResponse.json({ order: parsed })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Parse error' }, { status: 500 })
  }
}
