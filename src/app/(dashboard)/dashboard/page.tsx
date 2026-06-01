'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CookingPot, Plus, ShoppingCart, Users } from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  {
    title: 'Nueva receta',
    description: 'Añade una receta con ingredientes y raciones',
    icon: CookingPot,
    href: '/recipes/new',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100 dark:bg-emerald-950/50',
  },
  {
    title: 'Ir a la compra',
    description: 'Revisa y edita tu lista de compra activa',
    icon: ShoppingCart,
    href: '/shopping-lists',
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-950/50',
  },
  {
    title: 'Gestionar hogar',
    description: 'Configura miembros y preferencias',
    icon: Users,
    href: '/household',
    color: 'text-violet-600',
    bg: 'bg-violet-100 dark:bg-violet-950/50',
  },
]

export default function DashboardPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <PageHeader
        title="Inicio"
        description="Bienvenido a Cesta Inteligente"
        action={
          <Link href="/recipes/new">
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              Nueva receta
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm h-full">
              <CardHeader>
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${action.bg}`}
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <CardTitle className="mt-4 text-base">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cómo funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-muted-foreground">
            {[
              'Añade tus recetas con ingredientes, cantidades y raciones',
              'Selecciona las recetas que quieras cocinar',
              'Indica para cuántas personas comes',
              'Genera la lista de compra con ingredientes escalados y consolidados',
              'Compra organizado por secciones de supermercado',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
