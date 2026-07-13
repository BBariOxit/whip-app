const REDIRECT_AFTER_LOGIN_KEY = 'redirectAfterLogin'

const normalizeInternalPath = (value) => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null

  try {
    const url = new URL(value, window.location.origin)
    if (url.origin !== window.location.origin) return null

    const normalized = `${url.pathname}${url.search}${url.hash}`
    if (/^\/(login|register)(\/|$)/.test(url.pathname)) return null
    return normalized
  } catch {
    return null
  }
}

export const getLocationPath = (location) => (
  `${location.pathname}${location.search || ''}${location.hash || ''}`
)

export const saveRedirectAfterLogin = (path) => {
  const safePath = normalizeInternalPath(path)
  // Tab-scoped storage survives OAuth redirects without leaving a stale target
  // for a future login session in another tab.
  if (safePath) sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, safePath)
  return safePath
}

export const consumeRedirectAfterLogin = (fallback = '/') => {
  const storedPath = sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)
    || localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY) // consume legacy values once
  sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY)
  localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY)
  return normalizeInternalPath(storedPath) || fallback
}
