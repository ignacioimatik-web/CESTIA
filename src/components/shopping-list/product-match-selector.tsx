'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Package, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchProductsForIngredient, selectProductForItem, clearProductMatch } from '@/app/(dashboard)/shopping-lists/actions'
import type { MatchResult } from '@/lib/matching/matcher'

type ProductMatchSelectorProps = {
  itemId: string
  ingredientName: string
  currentMatch: { id: string; name: string; brand: string | null; price: number | null } | null
  onMatchChange: () => void
}

export function ProductMatchSelector({
  itemId,
  ingredientName,
  currentMatch,
  onMatchChange,
}: ProductMatchSelectorProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(ingredientName)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const results = await searchProductsForIngredient(q)
      setMatches(results)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleOpen() {
    setOpen(true)
    search(ingredientName)
  }

  async function handleSelect(productId: string, matchType: 'exact' | 'fuzzy' | 'manual') {
    await selectProductForItem(itemId, productId, matchType)
    setOpen(false)
    onMatchChange()
  }

  async function handleClear() {
    await clearProductMatch(itemId)
    setOpen(false)
    onMatchChange()
  }

  return (
    <div ref={containerRef} className="relative">
      {currentMatch ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-green-600 font-medium truncate max-w-[120px]">
            {currentMatch.name}
          </span>
          {currentMatch.price != null && (
            <span className="text-[10px] text-muted-foreground">
              {currentMatch.price.toFixed(2)}€
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground shrink-0"
            onClick={handleOpen}
            title="Cambiar producto"
          >
            <Package className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px] text-muted-foreground px-1.5"
          onClick={handleOpen}
        >
          <Search className="h-3 w-3 mr-1" />
          Buscar producto
        </Button>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-popover border rounded-lg shadow-lg z-50 p-2">
          <div className="flex items-center gap-1 mb-2">
            <Input
              ref={inputRef}
              className="h-8 text-xs flex-1"
              placeholder="Buscar producto..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                search(e.target.value)
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => setOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {loading ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              Buscando...
            </div>
          ) : matches.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              Sin resultados
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {matches.map((m) => (
                <button
                  key={m.productId}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-muted text-xs flex items-center justify-between gap-2"
                  onClick={() => handleSelect(m.productId, m.matchType as 'exact' | 'fuzzy' | 'manual')}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{m.productName}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {m.brand && `${m.brand} · `}
                      {m.price != null && `${m.price.toFixed(2)}€`}
                      {m.section && ` · ${m.section}`}
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground shrink-0 text-right">
                    <div>{m.confidenceScore.toFixed(0)}%</div>
                    <div className="capitalize">{m.matchType}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentMatch && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 h-7 text-[10px] text-muted-foreground"
              onClick={handleClear}
            >
              Dejar como genérico
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
