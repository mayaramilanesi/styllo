
import { getConnectionStatus } from './whatsappClient.js'

export function startHealthCheck(intervalMs = 30 * 60 * 1000) {
  const log = () => {
    const now = new Date().toISOString()
    const status = getConnectionStatus()
    console.log(`[HEALTH] ${now} status=${status}`)
  }

  log()

  const timer = setInterval(log, intervalMs)

  return () => clearInterval(timer)
}
