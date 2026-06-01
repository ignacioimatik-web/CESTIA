export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface SyncLogEntry {
  timestamp: string
  level: LogLevel
  module: string
  message: string
  data?: unknown
}

const isVerbose = process.argv.includes('--verbose') || process.env.MERCADONA_SYNC_VERBOSE === 'true'

function formatEntry(entry: SyncLogEntry): string {
  return JSON.stringify(entry)
}

export const syncLogger = {
  info(module: string, message: string, data?: unknown): void {
    if (!isVerbose && data) {
      console.log(formatEntry({ timestamp: new Date().toISOString(), level: 'info', module, message }))
    } else {
      console.log(formatEntry({ timestamp: new Date().toISOString(), level: 'info', module, message, data }))
    }
  },

  warn(module: string, message: string, data?: unknown): void {
    console.warn(formatEntry({ timestamp: new Date().toISOString(), level: 'warn', module, message, data }))
  },

  error(module: string, message: string, data?: unknown): void {
    console.error(formatEntry({ timestamp: new Date().toISOString(), level: 'error', module, message, data }))
  },

  debug(module: string, message: string, data?: unknown): void {
    if (isVerbose) {
      console.log(formatEntry({ timestamp: new Date().toISOString(), level: 'debug', module, message, data }))
    }
  },
}
