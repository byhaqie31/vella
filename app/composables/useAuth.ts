import { AUTH_KEY, defaultUser, type PortalUser, USER_KEY } from '~/data/portal'

/** Mock auth. Holds the current user + a signed-in flag in localStorage and
 *  routes between auth screens. No real sessions — the signatures (signup/login/
 *  logout/user) are what the server-backed version will expose, so swapping in
 *  `$fetch('/api/auth/...')` later is a drop-in. */
export function useAuth() {
  const user = usePersistentState<PortalUser>(USER_KEY, () => structuredClone(defaultUser))
  const authed = usePersistentState<boolean>(AUTH_KEY, () => false)

  function signup(name: string, email: string) {
    const initial = (name.trim()[0] ?? 'Q').toUpperCase()
    user.value = {
      ...structuredClone(defaultUser),
      name: name.trim() || 'there',
      email: email.trim(),
      initial,
    }
    authed.value = true
    return navigateTo('/onboarding')
  }

  function login() {
    authed.value = true
    return navigateTo('/dashboard')
  }

  function logout() {
    authed.value = false
    return navigateTo('/login')
  }

  function setPlan(plan: PortalUser['plan']) {
    user.value = { ...user.value, plan }
  }

  return { user, isAuthenticated: authed, signup, login, logout, setPlan }
}
