'use client'

import { DesktopSidebar } from './desktop-sidebar'
import { MobileNav } from './mobile-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <div className="md:pl-72 pb-20 md:pb-0">
        <main className="min-h-screen pt-2 md:pt-5">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
