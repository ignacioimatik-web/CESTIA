import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type InputItem = { name: string; quantity: number; unit: string }

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key de IA no configurada' }, { status: 503 })
  }

  const body = await req.json()
  const items: InputItem[] = body.items ?? []
  const listName: string = body.listName ?? ''

  if (items.length === 0) {
    return NextResponse.json({ error: 'La lista está vacía' }, { status: 400 })
  }

  const prompt = `Eres un chef profesional. Genera una receta de cocina usando SOLO los siguientes ingredientes disponibles.

LISTA DE INGREDIENTES:
${items.map((i) => `- ${i.name}${i.quantity > 1 ? ` (${i.quantity} ${i.unit})` : ''}`).join('\n')}

${listName ? `Contexto: "${listName}"` : ''}

IMPORTANTE: Usa SOLO los ingredientes listados. Puedes asumir que tienes sal, pimienta, aceite de oliva y agua como básicos aunque no estén en la lista.

Responde en el siguiente formato JSON sin explicaciones adicionales:
{
  "name": "Nombre de la receta en español",
  "description": "Breve descripción de 1-2 frases",
  "prep_time_minutes": 15,
  "cook_time_minutes": 30,
  "base_servings": 4,
  "difficulty": "facil" | "media" | "dificil",
  "tags": ["etiqueta1", "etiqueta2"],
  "ingredients": [
    { "name": "nombre del ingrediente", "quantity": 2, "unit": "unidades" },
    { "name": "otro ingrediente", "quantity": 200, "unit": "g" }
  ],
  "steps": [
    "Paso 1 de la elaboración...",
    "Paso 2..."
  ]
}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `Error de IA: ${response.status}`, detail: err }, { status: 502 })
    }

    const data = await response.json()
    const recipe = JSON.parse(data.choices[0].message.content)

    return NextResponse.json({ recipe })
  } catch (err) {
    return NextResponse.json({ error: 'Error generando receta', detail: String(err) }, { status: 500 })
  }
}
