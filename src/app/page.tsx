import { CookingPot, ShoppingCart, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  {
    icon: CookingPot,
    title: "Tus Recetas",
    description:
      "Guarda tus recetas favoritas con ingredientes, cantidades y raciones. Escálalas automáticamente.",
  },
  {
    icon: ShoppingCart,
    title: "Lista Inteligente",
    description:
      "Genera listas de compra desde una o varias recetas. Ingredientes duplicados se consolidan.",
  },
  {
    icon: Users,
    title: "Hogar Compartido",
    description:
      "Comparte la lista con tu familia. Define preferencias alimentarias y supermercado favorito.",
  },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span>🛒</span>
          <span>Cesta Inteligente</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Iniciar sesión</Button>
          </Link>
          <Link href="/register">
            <Button>Crear cuenta</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Convierte recetas en{" "}
            <span className="text-primary">listas de compra</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Cesta Inteligente transforma tus recetas favoritas en listas de compra organizadas
            por secciones de supermercado. Ahorra tiempo, evita olvidos y compra solo lo necesario.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Comenzar gratis</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Ya tengo cuenta</Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>Cesta Inteligente &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
