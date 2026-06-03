'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, CheckCircle2, ShoppingCart, Plus, Sparkles, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { SectionBadge } from '@/components/shared/section-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { FadeIn, StaggerList, StaggerItem, AnimatePresence, motion } from '@/components/shared/animations'
import { ItemRow } from './item-row'
import { ExportActions } from './export-actions'
import { AiRecipeButton } from './ai-recipe-button'
import {
  getShoppingList,
  updateShoppingList,
  deleteShoppingList,
  toggleItemChecked,
  toggleItemOwned,
  updateItemQuantity,
  deleteItem,
  addItem,
  updateItemSection,
  saveUserSectionPreference,
  type ShoppingListItemData,
} from '@/app/(dashboard)/shopping-lists/actions'

type ShoppingListData = Awaited<ReturnType<typeof getShoppingList>>

export function ShoppingListContent({ id }: { id: string }) {
  const cacheKey = `cestia:list:${id}`
  const router = useRouter()
  const [data, setData] = useState<ShoppingListData>(null)
  const [loading, setLoading] = useState(true)
  const [newItemName, setNewItemName] = useState('')
  const [isOffline, setIsOffline] = useState(false)
  const [checklistMode, setChecklistMode] = useState(true)

  const fetchList = useCallback(async () => {
    try {
      const result = await getShoppingList(id)
      setData(result)
      if (typeof window !== 'undefined' && result) {
        window.localStorage.setItem(cacheKey, JSON.stringify(result))
      }
    } catch {
      if (typeof window !== 'undefined') {
        const cached = window.localStorage.getItem(cacheKey)
        if (cached) {
          setData(JSON.parse(cached))
          setIsOffline(true)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [id, cacheKey])

  useEffect(() => {
    queueMicrotask(() => {
      void fetchList()
    })
  }, [fetchList])

  useEffect(() => {
    const syncOnlineState = () => setIsOffline(!navigator.onLine)
    syncOnlineState()
    window.addEventListener('online', syncOnlineState)
    window.addEventListener('offline', syncOnlineState)
    return () => {
      window.removeEventListener('online', syncOnlineState)
      window.removeEventListener('offline', syncOnlineState)
    }
  }, [])

  useEffect(() => {
    if (!data || typeof window === 'undefined') return
    window.localStorage.setItem(cacheKey, JSON.stringify(data))
  }, [data, cacheKey])

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="space-y-3">
          <div className="h-7 w-40 skeleton rounded-lg" />
          <div className="h-4 w-28 skeleton rounded-lg" />
          <div className="h-10 skeleton rounded-xl" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <EmptyState
          icon={ShoppingCart}
          title="Lista no encontrada"
          description="Esta lista de compra no existe o ha sido eliminada."
          action={
            <Button onClick={() => router.push('/shopping-lists')} className="rounded-xl">
              Volver a listas
            </Button>
          }
        />
      </div>
    )
  }

  const checkedCount = data.items.filter((i) => i.isChecked).length
  const ownedCount = data.items.filter((i) => i.isOwned).length
  const allChecked = data.items.length > 0 && checkedCount === data.items.length

  const sections = new Map<string, ShoppingListItemData[]>()
  for (const item of data.items) {
    const key = item.section ?? 'Otros'
    if (!sections.has(key)) sections.set(key, [])
    sections.get(key)!.push(item)
  }

  async function handleToggleCheck(itemId: string, checked: boolean) {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, isChecked: checked } : i
        ),
      }
    })
    try {
      await toggleItemChecked(itemId, checked)
    } catch {
      setIsOffline(true)
    }
  }

  async function handleToggleOwned(itemId: string, owned: boolean) {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, isOwned: owned } : i
        ),
      }
    })
    try {
      await toggleItemOwned(itemId, owned)
    } catch {
      setIsOffline(true)
    }
  }

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      }
    })
    try {
      await updateItemQuantity(itemId, quantity)
    } catch {
      setIsOffline(true)
    }
  }

  async function handleChangeSection(itemId: string, section: string) {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, section } : i
        ),
      }
    })
    try {
      await updateItemSection(itemId, section)
      await saveUserSectionPreference({ ingredientId: null, productId: null, section })
    } catch {
      setIsOffline(true)
    }
  }

  async function handleDeleteItem(itemId: string) {
    await deleteItem(itemId)
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      }
    })
  }

  async function handleAddItem() {
    const name = newItemName.trim()
    if (!name || !data) return
    await addItem(data.id, { name, quantity: 1, unit: 'ud' })
    setNewItemName('')
    await fetchList()
  }

  async function handleComplete() {
    if (!data) return
    await updateShoppingList(data.id, { is_completed: !data.isCompleted })
    setData((prev) => prev ? { ...prev, isCompleted: !prev.isCompleted } : prev)
  }

  async function handleDelete() {
    if (!data) return
    if (window.confirm('¿Eliminar esta lista de compra?')) {
      await deleteShoppingList(data.id)
      router.push('/shopping-lists')
    }
  }

  const progressPct = data.items.length > 0 ? Math.round((checkedCount / data.items.length) * 100) : 0

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <FadeIn>
        {isOffline && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            Sin conexion: trabajando con cache local. Tus cambios se mantienen en este dispositivo.
          </div>
        )}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{data.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data.items.length} producto{data.items.length !== 1 ? 's' : ''}
              {checkedCount > 0 && ` · ${checkedCount} tachado${checkedCount !== 1 ? 's' : ''}`}
              {ownedCount > 0 && ` · ${ownedCount} en casa`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <AiRecipeButton listName={data.name} items={data.items} />
            <Button
              variant={checklistMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChecklistMode((v) => !v)}
              className="h-10 rounded-xl"
            >
              Modo checklist
            </Button>
            <ExportActions
              listName={data.name}
              supermarketName={null}
              createdAt={data.createdAt}
              items={data.items}
            />
            <Button
              variant={data.isCompleted ? 'outline' : 'default'}
              size="sm"
              onClick={handleComplete}
              className="rounded-xl h-10"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {data.isCompleted ? 'Reabrir' : 'Completar'}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {data.items.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{checkedCount} / {data.items.length}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
          </div>
        )}
      </FadeIn>

      {/* Add item */}
      <FadeIn delay={0.05}>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Añadir producto..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              className="pl-10 rounded-xl h-12 text-base"
            />
          </div>
          <Button
            onClick={handleAddItem}
            disabled={!newItemName.trim()}
            className="rounded-xl h-12 px-5 text-base"
          >
            <Plus className="h-4 w-4 mr-1" />
            Añadir
          </Button>
        </div>
      </FadeIn>

      {/* All checked banner */}
      <AnimatePresence>
        {allChecked && (
          <FadeIn>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-medium">¡Lista completada!</span>
            </div>
          </FadeIn>
        )}
      </AnimatePresence>

      {/* Items */}
      {data.items.length === 0 ? (
        <FadeIn>
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Lista vacía</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Añade productos manualmente o genera la lista desde recetas.
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <div className="space-y-3">
          {Array.from(sections.entries()).map(([section, items]) => (
            <FadeIn key={section} delay={0.05}>
              <Card className="overflow-hidden border shadow-sm">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border/50">
                  <SectionBadge name={section} />
                  <span className="text-xs text-muted-foreground ml-auto">{items.length}</span>
                </div>
                <StaggerList>
                  {items.map((item) => (
                    <StaggerItem key={item.id}>
                      <ItemRow
                        item={item}
                        onToggleCheck={handleToggleCheck}
                        onToggleOwned={handleToggleOwned}
                        onUpdateQuantity={handleUpdateQuantity}
                        onDelete={handleDeleteItem}
                        onChangeSection={handleChangeSection}
                        onMatchChange={fetchList}
                        checklistMode={checklistMode}
                      />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </Card>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  )
}
