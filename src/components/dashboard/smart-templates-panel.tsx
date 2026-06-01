import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const templates = [
  'Compra semanal familiar',
  'Compra para persona sola',
  'Alta proteina 5 dias',
  'Menu bajo coste',
  'Batch cooking domingo',
  'Cena ligera semanal',
  'Merienda infantil',
  'Despensa basica',
]

export function SmartTemplatesPanel() {
  return (
    <Card className="warm-panel">
      <CardHeader className="pb-2"><CardTitle className="text-base">Plantillas inteligentes</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {templates.map((template) => (
          <div key={template} className="warm-surface rounded-xl p-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{template}</p>
            <Link href="/shopping-lists/new"><Button size="sm" className="h-9">Usar</Button></Link>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
