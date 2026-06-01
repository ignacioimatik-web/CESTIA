'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  CookingPot,
  Plus,
  ShoppingCart,
  Users,
  Calendar,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { FadeIn, StaggerList, StaggerItem } from '@/components/shared/animations'
import { getShoppingLists } from '@/app/(dashboard)/shopping-lists/actions'

const quickActions = [
  {
    title: 'Nueva receta',
    description: 'Añade una receta con ingredientes',
    icon: CookingPot,
    href: '/recipes/new',
    accent: 'from-amber-500/20 to-orange-500/10',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Nuevo evento',
    description: 'Crea un evento con recetas',
    icon: Calendar,
    href: '/events/new',
    accent: 'from-rose-500/20 to-pink-500/10',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    title: 'Ir a la compra',
    description: 'Revisa tu lista activa',
    icon: ShoppingCart,
    href: '/shopping-lists',
    accent: 'from-emerald-500/20 to-teal-500/10',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
]

export default function DashboardPage() {
  const [lists, setLists] = useState<{ id: string; name: string; total: number; checked: number; isCompleted: boolean }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getShoppingLists().then((data) => {
      setLists(data.slice(0, 3))
      setLoading(false)
    })
  }, [])

  const totalItems = lists.reduce((s, l) => s + l.total, 0)
  const checkedItems = lists.reduce((s, l) => s + l.checked, 0)
  const activeLists = lists.filter((l) => !l.isCompleted).length

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-6 sm:py-8">
      {/* Hero */}
      <FadeIn>
        <div className="mb-8 warm-panel p-5 sm:p-6">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Cesta Inteligente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Buen provecho
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Planifica, cocina, ahorra
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          <div className="warm-surface rounded-2xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">{loading ? '—' : activeLists}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Listas activas</p>
          </div>
          <div className="warm-surface rounded-2xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {loading ? '—' : totalItems}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Productos</p>
          </div>
          <div className="warm-surface rounded-2xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
              {loading ? '—' : checkedItems}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Tachados</p>
          </div>
        </div>
      </FadeIn>

      {/* Quick Actions */}
      <StaggerList className="grid gap-3 sm:grid-cols-3 mb-8">
        {quickActions.map((action) => (
          <StaggerItem key={action.title}>
            <Link href={action.href}>
              <Card className="card-hover cursor-pointer h-full warm-panel">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${action.iconBg}`}>
                      <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${action.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base">{action.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </StaggerList>

      {/* Recent lists */}
      <FadeIn delay={0.2}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Listas recientes
            </h2>
            <Link href="/shopping-lists" className="text-xs text-primary font-medium hover:underline">
              Ver todas
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl skeleton" />
              ))}
            </div>
          ) : lists.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Todavía no hay listas de compra</p>
                <Link href="/shopping-lists/new">
                  <Button variant="outline" size="sm" className="mt-3">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Crear primera lista
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {lists.map((list) => {
                const pct = list.total > 0 ? Math.round((list.checked / list.total) * 100) : 0
                return (
                  <Link key={list.id} href={`/shopping-lists/${list.id}`}>
                     <Card className="card-hover cursor-pointer warm-panel">
                      <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{list.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {list.checked} / {list.total} productos
                          </p>
                        </div>
                        <div className="shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center relative">
                          <span className="text-xs font-bold text-primary">{pct}%</span>
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                              cx="24" cy="24" r="20"
                              fill="none"
                              stroke="oklch(0.9 0.01 75)"
                              strokeWidth="3"
                            />
                            <circle
                              cx="24" cy="24" r="20"
                              fill="none"
                              stroke="oklch(0.55 0.15 45)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 20}`}
                              strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
                              className="transition-all duration-500"
                            />
                          </svg>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  )
}
