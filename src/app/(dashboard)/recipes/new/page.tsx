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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

const units = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'unit', 'slice', 'clove', 'pack', 'can', 'bunch', 'piece']

export default function NewRecipePage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <PageHeader title="Nueva receta" description="Añade los ingredientes y pasos de tu receta" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información básica</CardTitle>
            <CardDescription>Nombre, descripción y tiempo de preparación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la receta</Label>
              <Input id="name" placeholder="Ej: Paella de verduras" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Breve descripción" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="servings">Raciones base</Label>
                <Input id="servings" type="number" min="1" defaultValue="4" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prepTime">Tiempo (min)</Label>
                <Input id="prepTime" type="number" min="0" placeholder="30" className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas</Label>
              <Input id="tags" placeholder="vegetariana, rápida, económica" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Instrucciones</Label>
              <Textarea id="instructions" placeholder="Pasos para preparar la receta..." rows={5} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Ingredientes</CardTitle>
              <CardDescription>Cantidades y unidades para las raciones base</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Añadir
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input placeholder="Nombre del ingrediente" className="h-11" />
                </div>
                <div className="w-20">
                  <Input type="number" step="0.01" min="0" placeholder="Cant." className="h-11" />
                </div>
                <div className="w-28">
                  <Select defaultValue="unit">
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="ghost" size="icon" className="mt-1 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1 h-11 text-base">Guardar receta</Button>
          <Button variant="outline" className="h-11">Cancelar</Button>
        </div>
      </div>
    </div>
  )
}
