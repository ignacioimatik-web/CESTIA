'use client'

import { cn } from '@/lib/utils'
import {
  Calendar,
  ClipboardList,
  CookingPot,
  Home,
  Settings,
  ShoppingCart,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/events', label: 'Eventos', icon: Calendar },
  { href: '/recipes', label: 'Recetas', icon: CookingPot },
  { href: '/shopping-lists', label: 'Compra', icon: ShoppingCart },
  { href: '/household', label: 'Hogar', icon: ClipboardList },
  { href: '/settings', label: 'Ajustes', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-2 left-3 right-3 z-50 md:hidden">
      <div className="nav-glass warm-panel flex items-center justify-around h-[4.5rem] px-2 shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all min-w-[3.6rem] touch-target',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
