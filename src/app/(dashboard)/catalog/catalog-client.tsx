'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Search, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { AddToListDialog } from '@/components/catalog/add-to-list-dialog'
import { inferSubcategory } from '@/lib/catalog/subcategories'

type Product = {
  id: string
  name: string
  brand: string | null
  price: number | null
  package_size: string | null
  image_url: string | null
  supermarket_section: string | null
}

export function CatalogClientView({ products, section }: { products: Product[]; section: string }) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>()
    for (const p of products) {
      const sub = inferSubcategory(section, p.name)
      if (!map.has(sub)) map.set(sub, [])
      map.get(sub)!.push(p)
    }
    return Array.from(map.entries()).sort((a, b) => {
      if (a[0] === 'Otros') return 1
      if (b[0] === 'Otros') return -1
      return a[0].localeCompare(b[0], 'es')
    })
  }, [products, section])

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped
    const q = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return grouped
      .map(([group, items]) => [group, items.filter((p) => p.name.toLowerCase().includes(q))] as [string, Product[]])
      .filter(([, items]) => items.length > 0)
  }, [grouped, search])

  const totalProducts = products.length
  const filteredCount = filtered.reduce((s, [, items]) => s + items.length, 0)

  function toggleGroup(name: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Search + stats */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-lg h-10"
          />
        </div>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {search ? `${filteredCount} de ${totalProducts}` : `${totalProducts} productos`}
        </p>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card className="warm-panel">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No se encontraron productos para &quot;{search}&quot;
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filtered.map(([group, items], idx) => {
            const isCollapsed = collapsed.has(group)
            return (
              <section key={group}>
                {/* Separator between groups */}
                {idx > 0 && <hr className="border-border/40 mb-6" />}

                {/* Group header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-muted/30 hover:bg-accent/50 transition-colors group/header"
                >
                  <div className="flex items-center gap-2.5">
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                    />
                    <span className="text-sm font-semibold text-foreground">{group}</span>
                    <span className="text-xs text-muted-foreground font-normal bg-muted/50 px-2 py-0.5 rounded-full tabular-nums">
                      {items.length}
                    </span>
                  </div>
                </button>

                {/* Product grid with collapse animation */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${isCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}
                >
                  <div className="overflow-hidden min-h-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 pt-3">
                      {items.map((product) => (
                        <Card
                          key={product.id}
                          className="warm-panel overflow-hidden group/card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                        >
                          <CardContent className="p-0">
                            <div className="relative aspect-square bg-muted overflow-hidden">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.name}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <svg className="h-10 w-10 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                              )}
                              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/card:opacity-100 transition-all duration-200 translate-x-1 group-hover/card:translate-x-0">
                                <AddToListDialog
                                  product={{ name: product.name, section: product.supermarket_section, imageUrl: product.image_url }}
                                />
                              </div>
                            </div>
                            <div className="p-2.5 space-y-1">
                              <p className="text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
                              {product.brand && (
                                <p className="text-xs text-muted-foreground">{product.brand}</p>
                              )}
                              {product.package_size && (
                                <p className="text-xs text-muted-foreground">{product.package_size}</p>
                              )}
                              {product.price !== null && (
                                <p className="text-sm font-semibold">{product.price.toFixed(2)} EUR</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
