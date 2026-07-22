const GITHUB_OAUTH_STATE_KEY = 'githubOAuthState'
const GITHUB_OAUTH_STATE_TTL_MS = 10 * 60 * 1000

const createState = () => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const startGitHubOAuth = () => {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
  if (!clientId) throw new Error('GitHub authentication is not configured')

  const state = createState()
  const redirectUri = `${window.location.origin}/login`
  sessionStorage.setItem(GITHUB_OAUTH_STATE_KEY, JSON.stringify({
    state,
    redirectUri,
    createdAt: Date.now()
  }))

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'user:email',
    state
  })
  window.location.assign(`https://github.com/login/oauth/authorize?${params.toString()}`)
}

export const consumeGitHubOAuthState = (receivedState) => {
  const storedValue = sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY)
  sessionStorage.removeItem(GITHUB_OAUTH_STATE_KEY)
  if (!receivedState || !storedValue) return null

  try {
    const stored = JSON.parse(storedValue)
    const age = Date.now() - stored.createdAt
    const isFresh = age >= 0 && age <= GITHUB_OAUTH_STATE_TTL_MS
    return isFresh && stored.state === receivedState ? stored.redirectUri : null
  } catch {
    return null
  }
}
