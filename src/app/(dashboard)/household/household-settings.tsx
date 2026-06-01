'use client'

import { useState, useEffect } from 'react'
import { Save, Users, BookmarkCheck, ShoppingCart, Plus, Trash2, Repeat, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { FadeIn, StaggerList, StaggerItem } from '@/components/shared/animations'
import { generateSummary } from '@/lib/household/multiplier'
import {
  getHouseholdWithDetails,
  updateHousehold,
  getSupermarkets,
  addUsualProduct,
  removeUsualProduct,
} from './actions'

type HouseholdData = Awaited<ReturnType<typeof getHouseholdWithDetails>>

export function HouseholdSettings() {
  const [data, setData] = useState<HouseholdData>(null)
  const [supermarkets, setSupermarkets] = useState<{ id: string; name: string; display_name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [teens, setTeens] = useState(0)
  const [guests, setGuests] = useState(0)
  const [budget, setBudget] = useState('')
  const [supermarket, setSupermarket] = useState<string | null>(null)
  const [restrictions, setRestrictions] = useState('')
  const [preferences, setPreferences] = useState('')

  // Usual product form
  const [newProductName, setNewProductName] = useState('')
  const [newProductQty, setNewProductQty] = useState('1')
  const [newProductUnit, setNewProductUnit] = useState('ud')
  const [newProductFreq, setNewProductFreq] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly')

  useEffect(() => {
    Promise.all([
      getHouseholdWithDetails(),
      getSupermarkets(),
    ]).then(([h, s]) => {
      if (h?.household) {
        setName(h.household.name)
        setAdults(h.household.adults)
        setChildren(h.household.young_children)
        setTeens(h.household.teenagers)
        setGuests(h.household.frequent_guests)
        setBudget(h.household.weekly_budget ? String(h.household.weekly_budget) : '')
        setSupermarket(h.household.primary_supermarket_id)
        setRestrictions((h.household.dietary_restrictions ?? []).join(', '))
        setPreferences((h.household.preferences ?? []).join(', '))
      }
      setData(h)
      setSupermarkets(s)
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await updateHousehold({
        name,
        adults,
        young_children: children,
        teenagers: teens,
        frequent_guests: guests,
        weekly_budget: budget ? parseFloat(budget) : null,
        primary_supermarket_id: supermarket === '__none__' ? null : supermarket,
        dietary_restrictions: restrictions.split(',').map((s) => s.trim()).filter(Boolean),
        preferences: preferences.split(',').map((s) => s.trim()).filter(Boolean),
      })
      setMessage('Guardado correctamente')
      setTimeout(() => setMessage(null), 2000)
    } catch {
      setMessage('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!newProductName.trim()) return
    try {
      await addUsualProduct({
        name: newProductName.trim(),
        quantity: parseFloat(newProductQty) || 1,
        unit: newProductUnit,
        frequency: newProductFreq,
      })
      setNewProductName('')
      const fresh = await getHouseholdWithDetails()
      setData(fresh)
    } catch { /* ignore */ }
  }

  async function handleRemoveProduct(id: string) {
    await removeUsualProduct(id)
    const fresh = await getHouseholdWithDetails()
    setData(fresh)
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <div className="space-y-3">
          <div className="h-7 w-32 skeleton rounded-lg" />
          <div className="h-4 w-48 skeleton rounded-lg" />
          {[1, 2, 3].map((i) => <div key={i} className="h-40 skeleton rounded-xl" />)}
        </div>
      </div>
    )
  }

  const householdComp = { adults, teenagers: teens, youngChildren: children, frequentGuests: guests }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <FadeIn>
        <div className="mb-6">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Hogar</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Mi Hogar</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Gestiona la configuración de tu hogar</p>
        </div>

        {message && (
          <div className="text-sm px-4 py-2.5 rounded-xl mb-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            {message}
          </div>
        )}
      </FadeIn>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Composición del hogar</CardTitle>
            <p className="text-sm text-muted-foreground">
              {generateSummary(householdComp)} — {adults + teens + children} miembros
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre del hogar</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supermarket">Supermercado principal</Label>
                <Select value={supermarket} onValueChange={(v: string | null) => setSupermarket(v)}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Ninguno</SelectItem>
                    {supermarkets.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'adults', label: 'Adultos', value: adults, set: setAdults },
                { id: 'teens', label: 'Adolescentes', value: teens, set: setTeens },
                { id: 'children', label: 'Niños', value: children, set: setChildren },
                { id: 'guests', label: 'Invitados', value: guests, set: setGuests },
              ].map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <Label htmlFor={f.id}>{f.label}</Label>
                  <Input
                    id={f.id}
                    type="number" min={0} max={20}
                    value={f.value}
                    onChange={(e) => f.set(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 rounded-lg"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="budget">Presupuesto semanal (€)</Label>
                <Input id="budget" type="number" min={0} step={10} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Ej. 150" className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="restrictions">Restricciones</Label>
                <Input id="restrictions" value={restrictions} onChange={(e) => setRestrictions(e.target.value)} placeholder="vegano, sin gluten..." className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="preferences">Preferencias</Label>
                <Input id="preferences" value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="ecológico, local..." className="h-10 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="h-11 w-full sm:w-auto rounded-xl" disabled={saving}>
          <Save className="h-4 w-4 mr-1.5" />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>

      <StaggerList className="space-y-4">
        <StaggerItem>
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Miembros</CardTitle>
                  <p className="text-sm text-muted-foreground">Personas con acceso a este hogar</p>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {data?.members?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Sin miembros</p>
              ) : (
                <div className="space-y-1">
                  {(data?.members ?? []).map((m: { id: string; role: string; user?: { display_name?: string | null; id?: string } | null }) => {
                    const profile = m.user
                    return (
                      <div key={m.id} className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg hover:bg-muted/50">
                        <span className="flex-1 font-medium">{profile?.display_name ?? profile?.id ?? 'Usuario'}</span>
                        <Badge variant="outline" className="text-[10px]">{m.role === 'admin' ? 'Admin' : 'Miembro'}</Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Productos habituales</CardTitle>
                  <p className="text-sm text-muted-foreground">Productos que se compran cada semana</p>
                </div>
                <Repeat className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddProduct} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Producto</Label>
                <Input
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Leche, pan, huevos..."
                  className="h-9 text-sm"
                />
              </div>
              <div className="w-16 space-y-1">
                <Label className="text-xs">Cant.</Label>
                <Input
                  value={newProductQty}
                  onChange={(e) => setNewProductQty(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="w-16 space-y-1">
                <Label className="text-xs">Ud.</Label>
                <Input
                  value={newProductUnit}
                  onChange={(e) => setNewProductUnit(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs">Frecuencia</Label>
                <Select value={newProductFreq} onValueChange={(v: string | null) => setNewProductFreq((v ?? 'weekly') as never)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="biweekly">Quincenal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            {(!data?.usualProducts || data.usualProducts.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Añade productos que se compran con frecuencia
              </p>
            ) : (
              <div className="space-y-1">
                {data.usualProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm py-1.5 px-2 rounded hover:bg-muted">
                    <span className="flex-1">{p.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {p.quantity} {p.unit}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {p.frequency === 'weekly' ? 'Semanal' : p.frequency === 'biweekly' ? 'Quincenal' : 'Mensual'}
                    </Badge>
                    <button onClick={() => handleRemoveProduct(p.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recetas favoritas del hogar</CardTitle>
                  <p className="text-sm text-muted-foreground">Recetas que se repiten a menudo</p>
                </div>
                <BookmarkCheck className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          <CardContent>
            {(!data?.favoriteRecipes || data.favoriteRecipes.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Marca una receta como favorita del hogar desde la ficha de receta
              </p>
            ) : (
              <div className="space-y-1">
                {(data?.favoriteRecipes ?? []).map((fr: { household_id: string; recipe_id: string; recipe?: { name?: string | null } | null }) => {
                  const recipe = fr.recipe
                  return (
                    <div key={`${fr.household_id}-${fr.recipe_id}`} className="flex items-center gap-2 text-sm py-1.5 px-2 rounded hover:bg-muted">
                      <span className="flex-1">{recipe?.name ?? 'Receta'}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Listas recurrentes</CardTitle>
                  <p className="text-sm text-muted-foreground">Listas de compra que se generan automáticamente</p>
                </div>
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          <CardContent>
            {(!data?.recurringLists || data.recurringLists.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Las listas recurrentes estarán disponibles próximamente
              </p>
            ) : (
              <div className="space-y-1">
                {data.recurringLists.map((rl) => (
                  <div key={rl.id} className="text-sm py-1.5">{rl.name}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </StaggerItem>
      </StaggerList>
    </div>
  )
}
