import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

export async function POST(req: NextRequest) {
  try {
    const { snapshot } = await req.json()

    const systemPrompt = `You are a warehouse analytics AI for Klassical Holdings Ltd.
Analyse the operational snapshot and identify anomalies, risks, or recommendations.
Return JSON only (no markdown):
{
  "anomalies": [
    { "severity": "critical|warning|info", "title": "string", "detail": "string", "module": "string" }
  ],
  "summary": "string (1 sentence)"
}`

    const userPrompt = `Analyse this warehouse snapshot:\n${JSON.stringify(snapshot, null, 2)}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    })

    const raw    = completion.choices[0].message.content ?? '{}'
    const result = JSON.parse(raw)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Anomaly error' }, { status: 500 })
  }
}
