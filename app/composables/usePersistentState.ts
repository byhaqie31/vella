import { effectScope } from 'vue'

/** A useState ref that hydrates from localStorage on the client and writes back
 *  on every change. SSR-safe: the server renders the factory value, the client
 *  swaps in localStorage synchronously during the first setup call (no flash),
 *  and a detached effect scope owns the persistence watcher so it survives any
 *  single component unmounting. The localStorage swap is the dev stand-in for a
 *  real API; replace these reads/writes with `$fetch` when the backend lands. */

const wired = new Set<string>()

export function usePersistentState<T>(key: string, factory: () => T) {
  const state = useState<T>(key, factory)

  if (import.meta.client && !wired.has(key)) {
    wired.add(key)
    try {
      const raw = localStorage.getItem(key)
      if (raw) state.value = JSON.parse(raw) as T
    } catch {
      // corrupt/absent value — keep the factory default
    }
    const scope = effectScope(true)
    scope.run(() => {
      watch(
        state,
        (v) => {
          try {
            localStorage.setItem(key, JSON.stringify(v))
          } catch {
            // storage full or unavailable — non-fatal for a mock
          }
        },
        { deep: true },
      )
    })
  }

  return state
}
