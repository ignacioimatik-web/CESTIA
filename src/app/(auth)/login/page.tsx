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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const normalizedEmail = email.trim().toLowerCase()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        toast.error('Email o contrasena incorrectos. Si te acabas de registrar, confirma primero tu email.')
      } else {
        toast.error(error.message)
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
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
    })
    setResending(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Te hemos reenviado el email de confirmacion')
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <Link href="/" className="text-2xl mb-2 inline-block">
          🛒
        </Link>
        <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
        <CardDescription>
          Accede a tu hogar y gestiona tus listas de compra
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
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
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Regístrate
          </Link>
        </p>
        <button
          type="button"
          onClick={handleResendConfirmation}
          disabled={resending}
          className="mt-2 w-full text-center text-sm text-primary hover:underline disabled:opacity-60"
        >
          {resending ? 'Reenviando...' : 'Reenviar email de confirmacion'}
        </button>
      </CardContent>
    </Card>
  )
}
