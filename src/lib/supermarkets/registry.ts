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
      throw new Error(`Supermarket provider "${name}" not found. Available: ${Array.from(this.providers.keys()).join(', ')}`)
    }
    return provider
  }

  getById(supermarketId: string): SupermarketProvider | undefined {
    for (const provider of this.providers.values()) {
      if (provider.config.externalId === supermarketId) {
        return provider
      }
    }
    return undefined
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

// Auto-register on first import
export function initProviders(): void {
  if (supermarketRegistry.has('mercadona')) return

  const { registerMercadona } = require('./mercadona')
  const { registerLidl } = require('./lidl')
  const { registerAldi } = require('./aldi')
  const { registerDia } = require('./dia')
  const { registerFamilyCash } = require('./family-cash')

  registerMercadona()
  registerLidl()
  registerAldi()
  registerDia()
  registerFamilyCash()
}
