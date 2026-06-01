'use client'

import { createClient } from '@/lib/supabase/client'
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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (authError) {
      toast.error(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // The profile is auto-created by the on_auth_user_created trigger.
      // Create a default household for the new user.
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({ name: `Hogar de ${displayName}`, adults: 2, young_children: 0, teenagers: 0, frequent_guests: 0, dietary_restrictions: [], preferences: [] } as any)
        .select('id')
        .single()

      if (householdError) {
        toast.error('Error al crear el hogar')
        setLoading(false)
        return
      }

      // Add user as admin member of the household
      const { error: memberError } = await supabase.from('household_members').insert({
        household_id: household.id,
        user_id: authData.user.id,
        role: 'admin',
      })

      if (memberError) {
        toast.error('Error al añadirte al hogar')
        setLoading(false)
        return
      }

      toast.success('Cuenta creada. Bienvenido a Cesta Inteligente!')
      router.push('/login')
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <Link href="/" className="text-2xl mb-2 inline-block">
          🛒
        </Link>
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <CardDescription>
          Crea tu hogar y empieza a organizar tus compras
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Tu nombre"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
