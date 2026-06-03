import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

type CatalogPageProps = {
  searchParams: Promise<{ section?: string }>
}

type ProductRow = {
  id: string
  name: string
  brand: string | null
  price: number | null
  package_size: string | null
  image_url: string | null
  supermarket_section: string | null
}

const knownSection = (raw: string): string | null => {
  const cleaned = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
  const map: Record<string, string> = {
    'fruta y verdura': 'Fruta y verdura',
    carne: 'Carne',
    pescado: 'Pescado',
    charcuteria: 'Charcutería',
    'charcuteria y quesos': 'Charcutería',
    'lacteos y huevos': 'Lácteos y huevos',
    panaderia: 'Panadería',
    'pasta, arroz y legumbres': 'Pasta, arroz y legumbres',
    conservas: 'Conservas',
    'aceite, especias y salsas': 'Aceite, especias y salsas',
    'desayuno y dulces': 'Desayuno y dulces',
    congelados: 'Congelados',
    bebidas: 'Bebidas',
    limpieza: 'Limpieza',
    'higiene y perfumeria': 'Higiene y perfumería',
    bebe: 'Bebé',
    mascotas: 'Mascotas',
    otros: 'Otros',
  }
  return map[cleaned] ?? null
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const rawSection = params.section?.trim() || null
  if (!rawSection) notFound()
  const section = knownSection(rawSection)
  if (!section) notFound()

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user

  if (!user) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Card className="warm-panel">
          <CardContent className="p-5 text-sm text-muted-foreground">
            Necesitas iniciar sesion para ver el catalogo.
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const householdId = membership?.household_id
  if (!householdId) notFound()

  const { data: household } = await supabase
    .from('households')
    .select('primary_supermarket_id')
    .eq('id', householdId)
    .single()

  const marketId = household?.primary_supermarket_id
  if (!marketId) notFound()

  const { data } = await supabase
    .from('supermarket_products')
    .select('id,name,brand,price,package_size,image_url,supermarket_section')
    .eq('supermarket_id', marketId)
    .eq('supermarket_section', section)
    .order('name')
    .limit(120)

  const products = (data ?? []) as ProductRow[]

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Catalogo: {section}</h1>
          <p className="text-sm text-muted-foreground">{products.length} productos</p>
        </div>
        <Link href="/dashboard" className="text-sm text-primary font-medium">Volver</Link>
      </div>

      {products.length === 0 ? (
        <Card className="warm-panel">
          <CardContent className="p-5 text-sm text-muted-foreground">
            No hay productos en esta seccion para el supermercado activo.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((product) => (
            <Card key={product.id} className="warm-panel overflow-hidden">
              <CardContent className="p-3 space-y-2">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image_url} alt={product.name} className="w-full aspect-square object-cover rounded-lg bg-muted" />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-muted" />
                )}
                <p className="text-sm font-medium leading-tight">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.brand ?? 'Mercadona'}</p>
                <p className="text-xs text-muted-foreground">{product.package_size ?? 'Formato no disponible'}</p>
                <p className="text-sm font-semibold">{product.price !== null ? `${product.price.toFixed(2)} EUR` : 'Precio no disponible'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
