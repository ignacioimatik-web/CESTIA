'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Save, Users } from 'lucide-react'

export default function HouseholdPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <PageHeader title="Mi Hogar" description="Gestiona la configuración de tu hogar" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información del hogar</CardTitle>
            <CardDescription>Define los miembros y preferencias de tu hogar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del hogar</Label>
              <Input id="name" defaultValue="Mi Hogar" className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults">Adultos</Label>
                <Input id="adults" type="number" min="0" defaultValue="2" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children">Niños</Label>
                <Input id="children" type="number" min="0" defaultValue="0" className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supermarket">Supermercado favorito</Label>
              <Select defaultValue="mercadona">
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mercadona">Mercadona</SelectItem>
                  <SelectItem value="lidl">Lidl</SelectItem>
                  <SelectItem value="aldi">Aldi</SelectItem>
                  <SelectItem value="dia">DIA</SelectItem>
                  <SelectItem value="carrefour">Carrefour</SelectItem>
                  <SelectItem value="consum">Consum</SelectItem>
                  <SelectItem value="family_cash">Family Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="h-11">
              <Save className="h-4 w-4 mr-1.5" />
              Guardar cambios
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferencias alimentarias</CardTitle>
            <CardDescription>Preferencias del hogar para filtrar recetas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['Mediterránea'].map((pref) => (
                <Badge key={pref} variant="secondary">
                  {pref}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Miembros</CardTitle>
                <CardDescription>Personas con acceso a este hogar</CardDescription>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-full">Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">tú@email.com</TableCell>
                  <TableCell>
                    <Badge variant="outline">Admin</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
