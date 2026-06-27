import { DOMAINS_KEY, makeSite, type PortalDomain, type PortalSite, SITE_KEY, TEMPLATES, timeAgo } from '~/data/portal'
import { LOOKS } from '~/themes/registry'

/** The user's single site, its derived state (setup checklist, public URL,
 *  publish status), and the mutations the portal screens call. Backed by
 *  localStorage; re-syncs on mount so edits made in the editor (which writes the
 *  same key) show up when you return to the dashboard. */
export function useSite() {
  const site = usePersistentState<PortalSite>(SITE_KEY, () => makeSite())
  const domains = usePersistentState<PortalDomain[]>(DOMAINS_KEY, () => [])

  // Pull the latest from storage when a dashboard screen mounts, so content
  // edited in the editor is reflected without a full reload.
  onMounted(() => {
    try {
      const raw = localStorage.getItem(SITE_KEY)
      if (raw) site.value = JSON.parse(raw) as PortalSite
    } catch {
      // ignore — keep the in-memory value
    }
  })

  const publicUrl = computed(() => `${site.value.handle}.vella.site`)
  const isPublished = computed(() => site.value.status === 'published')
  const lastEdited = computed(() => timeAgo(site.value.lastEditedAt))
  const hasContent = computed(
    () => !!(site.value.story.identity.name && site.value.story.about.body),
  )

  const setup = computed(() => [
    { key: 'template', label: 'Choose a template', done: true },
    { key: 'content', label: 'Add your content', done: hasContent.value },
    { key: 'domain', label: 'Connect a custom domain', done: domains.value.length > 0 },
    { key: 'publish', label: 'Publish your site', done: isPublished.value },
  ])
  const setupDone = computed(() => setup.value.filter((s) => s.done).length)

  function touch() {
    site.value = { ...site.value, lastEditedAt: new Date().toISOString() }
  }

  function publish() {
    site.value = {
      ...site.value,
      status: 'published',
      publishedAt: new Date().toISOString(),
      views7d: site.value.views7d ?? 0,
      visitors7d: site.value.visitors7d ?? 0,
    }
    site.value.story.isPublished = true
  }

  function unpublish() {
    site.value = { ...site.value, status: 'draft' }
    site.value.story.isPublished = false
  }

  function setHandle(raw: string) {
    site.value = { ...site.value, handle: raw.toLowerCase().replace(/[^a-z0-9-]/g, '') }
  }

  function setTitle(title: string) {
    site.value = { ...site.value, title }
  }

  /** Apply a template (a curated look): swaps theme + accent + type + design so
   *  the live preview reflects it, exactly like the editor's applyLook. */
  function applyTemplate(key: string) {
    const tpl = TEMPLATES.find((t) => t.key === key)
    if (!tpl) return
    const look = LOOKS.find((l) => l.key === key)
    site.value.templateKey = tpl.key
    site.value.themeKey = tpl.themeKey
    site.value.story.themeKey = tpl.themeKey
    if (look) {
      site.value.story.accent = look.accent
      site.value.story.typeMood = look.typeMood
      if (look.customHue !== undefined) site.value.story.design.customHue = look.customHue
      Object.assign(site.value.story.design, look.design)
    }
    touch()
  }

  function addDomain(domain: string) {
    const clean = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
    if (!clean) return
    domains.value = [
      ...domains.value,
      { id: `d${Date.now()}`, domain: clean, status: 'pending', addedAt: new Date().toISOString() },
    ]
  }

  function verifyDomain(id: string) {
    domains.value = domains.value.map((d) => (d.id === id ? { ...d, status: 'verified' } : d))
  }

  function removeDomain(id: string) {
    domains.value = domains.value.filter((d) => d.id !== id)
  }

  return {
    site,
    domains,
    publicUrl,
    isPublished,
    lastEdited,
    hasContent,
    setup,
    setupDone,
    touch,
    publish,
    unpublish,
    setHandle,
    setTitle,
    applyTemplate,
    addDomain,
    verifyDomain,
    removeDomain,
  }
}
