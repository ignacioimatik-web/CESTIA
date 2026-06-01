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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const normalizedEmail = email.trim().toLowerCase()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (displayName.trim().length < 2) {
      toast.error('Introduce un nombre valido')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Las contrasenas no coinciden')
      return
    }

    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    if (authError) {
      toast.error(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      if (authData.session) {
        toast.success('Cuenta creada. Bienvenido!')
        router.push('/dashboard')
        router.refresh()
      } else {
        setPendingConfirmation(true)
        toast.success('Cuenta creada. Revisa tu email para confirmar la cuenta.')
      }
    }

    setLoading(false)
  }

  const handleResendConfirmation = async () => {
    if (!normalizedEmail) {
      toast.error('Escribe tu email primero')
      return
    }

    setResending(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    setResending(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Email de confirmacion reenviado')
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
          </Button>
        </form>
        {pendingConfirmation && (
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={resending}
            className="mt-3 w-full text-center text-sm text-primary hover:underline disabled:opacity-60"
          >
            {resending ? 'Reenviando...' : 'No llego el correo? Reenviar confirmacion'}
          </button>
        )}
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
