'use client'

import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import {
  ClipboardList,
  CookingPot,
  Home,
  LogOut,
  Moon,
  Settings,
  ShoppingCart,
  Sun,
  User,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/recipes', label: 'Recetas', icon: CookingPot },
  { href: '/shopping-lists', label: 'Lista de Compra', icon: ShoppingCart },
  { href: '/household', label: 'Mi Hogar', icon: ClipboardList },
  { href: '/settings', label: 'Configuración', icon: Settings },
]

export function DesktopSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex flex-col flex-1 border-r bg-background">
        <div className="flex items-center gap-2 h-14 px-6 border-b">
          <span className="text-xl">🛒</span>
          <span className="font-semibold text-base">Cesta Inteligente</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-xs">
                <User className="h-3.5 w-3.5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{user?.email ?? 'Usuario'}</p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
