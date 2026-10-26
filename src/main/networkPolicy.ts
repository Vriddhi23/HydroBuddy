// Installed builds need no network access, including services on localhost.
export function allowedResource(url: string, developmentUrl?: string): boolean {
  try {
    const target = new URL(url)
    if (target.protocol === 'file:') return !target.hostname && !decodeURIComponent(target.pathname).replace(/\\/g, '/').startsWith('//')
    if (['data:', 'blob:'].includes(target.protocol)) return true
    if (url === 'about:blank') return true
    if (!developmentUrl) return false
    const development = new URL(developmentUrl)
    if (!['localhost', '127.0.0.1', '[::1]'].includes(development.hostname) || !['http:', 'https:'].includes(development.protocol)) return false
    const protocol = target.protocol.replace('ws:', 'http:').replace('wss:', 'https:')
    return protocol === development.protocol && target.hostname === development.hostname && target.port === development.port && !target.username && !target.password
  } catch { return false }
}
