'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const themes = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
] as const

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <PageHeader title="Configuración" description="Personaliza tu experiencia" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Apariencia</CardTitle>
            <CardDescription>Elige el tema de la aplicación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {themes.map((t) => {
                const Icon = t.icon
                const isActive = theme === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 p-4 flex-1 transition-all cursor-pointer',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-xs font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
                      {t.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cuenta</CardTitle>
            <CardDescription>Información de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Email</span>
              <span>tu@email.com</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Miembro desde</span>
              <span>Próximamente</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
