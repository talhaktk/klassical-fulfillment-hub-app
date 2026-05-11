import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

const LABEL_PROMPT = `You are a shipping label reader for a UK warehouse.
Extract ALL available information from this shipping label image.
Return ONLY valid JSON — no markdown, no explanation:
{
  "customer_name": "full recipient name or null",
  "customer_address": "full street address lines without postcode, or null",
  "customer_postcode": "UK postcode in format XX0 0XX or null",
  "carrier": "Royal Mail|DPD|Evri|Hermes|UPS|FedEx|Amazon Logistics|Yodel|Parcelforce|other or null",
  "tracking_number": "barcode/tracking number or null",
  "order_reference": "any order or reference number visible on the label or null"
}`

export async function POST(req: NextRequest) {
  try {
    const { image_base64, mime_type } = await req.json()
    if (!image_base64) return NextResponse.json({ error: 'image_base64 required' }, { status: 400 })

    const type = mime_type ?? 'image/png'

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: LABEL_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${type};base64,${image_base64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 400,
      temperature: 0,
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0].message.content ?? '{}'
    const label = JSON.parse(raw)
    return NextResponse.json({ label })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Parse error' }, { status: 500 })
  }
}
