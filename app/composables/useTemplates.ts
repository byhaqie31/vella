import { TEMPLATES, type Template } from '~/data/portal'

/** The template gallery + whether a given template is gated for the current
 *  plan (Pro templates are locked on the free plan). */
export function useTemplates() {
  const { user } = useAuth()
  function isLocked(t: Template) {
    return t.tier === 'pro' && user.value.plan !== 'pro'
  }
  return { templates: TEMPLATES, isLocked }
}
