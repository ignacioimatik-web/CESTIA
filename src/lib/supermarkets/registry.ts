import { SupermarketProvider } from './provider'
import type { SupermarketConfig } from './types'

class SupermarketRegistry {
  private providers = new Map<string, SupermarketProvider>()

  register(provider: SupermarketProvider): void {
    this.providers.set(provider.config.name, provider)
  }

  get(name: string): SupermarketProvider {
    const provider = this.providers.get(name)
    if (!provider) {
      throw new Error(`Supermarket provider "${name}" not found`)
    }
    return provider
  }

  getAll(): SupermarketProvider[] {
    return Array.from(this.providers.values())
  }

  getConfigs(): SupermarketConfig[] {
    return this.getAll().map((p) => p.config)
  }

  has(name: string): boolean {
    return this.providers.has(name)
  }
}

export const supermarketRegistry = new SupermarketRegistry()
