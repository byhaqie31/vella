import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import type { Ref } from 'vue'
import type { MotionPersonality } from '~/types/story'

/* Vella shared motion primitives — ported from the handoff's motion.js.
   All animation reads data-* attributes so theme markup stays decoupled:
     data-load="0.25" data-motion="split|rise|rise-sm|eyebrow|glow|fade"   (load timeline)
     data-reveal="rise|split|line|clip|fade|slide" [data-reveal-delay]     (scroll, once, top 82%)
     data-parallax="deep|subtle" [data-dir="-1"]                           (scrub)
     data-magnetic, data-follow (pointer), data-drift (ambient loop)
   Split targets are split with SplitText (lines, masked) since real user
   headlines wrap unpredictably — the load timeline waits for fonts so the
   split measures against the real faces. */

const FONTS_TIMEOUT = 1500

export function initMotion(root: HTMLElement, p: MotionPersonality): () => void {
  if (import.meta.server) return () => {}
  gsap.registerPlugin(ScrollTrigger, SplitText)

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = window.matchMedia('(max-width: 768px)').matches
  const D = mobile
    ? { sm: p.distance.sm / 2, md: p.distance.md / 2, lg: p.distance.lg / 2 }
    : p.distance

  if (reduced) {
    gsap.set(root.querySelectorAll('[data-motion],[data-reveal]'), {
      opacity: 1,
      clearProps: 'transform,clipPath',
    })
    root.querySelectorAll('[data-motion],[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    })
    return () => {}
  }

  let disposed = false
  const splits: SplitText[] = []
  const drifts: gsap.core.Tween[] = []

  const onVis = () => {
    drifts.forEach((t) => (document.hidden ? t.pause() : t.resume()))
  }
  document.addEventListener('visibilitychange', onVis)

  const ctx = gsap.context(() => {
    /* hide load targets up front so nothing flashes before the timeline runs */
    gsap.set(root.querySelectorAll('[data-load]'), { autoAlpha: 0 })

    /* ---- scroll reveals (once) — non-split kinds bind immediately ---- */
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      const kind = el.dataset.reveal
      if (kind === 'split') return // bound after fonts settle
      const delay = +(el.dataset.revealDelay || 0)
      const st: ScrollTrigger.Vars = { trigger: el, start: 'top 82%', once: true }
      if (kind === 'line') {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: 'left center', duration: p.duration.base, ease: p.ease, delay, scrollTrigger: st },
        )
      } else if (kind === 'clip') {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: p.duration.slow, ease: p.ease, delay, scrollTrigger: st },
        )
        const media = el.querySelector('[data-media]')
        if (media) {
          gsap.fromTo(
            media,
            { scale: 1.12 },
            { scale: 1, duration: p.duration.slow, ease: p.ease, delay, scrollTrigger: { trigger: el, start: 'top 82%', once: true } },
          )
        }
      } else if (kind === 'fade') {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: p.duration.base, ease: p.ease, delay, scrollTrigger: st })
      } else if (kind === 'slide') {
        gsap.fromTo(el, { x: -12, opacity: 0 }, { x: 0, opacity: 1, duration: p.duration.fast, ease: p.ease, delay: delay + 0.2, scrollTrigger: st })
      } else {
        gsap.fromTo(el, { y: D.md, opacity: 0 }, { y: 0, opacity: 1, duration: p.duration.base, ease: p.ease, delay, scrollTrigger: st })
      }
    })

    /* ---- parallax (scrub) ---- */
    root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
      const deep = el.dataset.parallax === 'deep'
      const dir = +(el.dataset.dir || 1)
      const y = deep ? window.innerHeight * p.parallax.deep * dir : 24 * dir
      gsap.to(el, {
        y,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })

    /* ---- ambient drift loops (pause when tab hidden) ---- */
    root.querySelectorAll<HTMLElement>('[data-drift]').forEach((el, i) => {
      drifts.push(
        gsap.to(el, { x: i % 2 ? -26 : 22, y: i % 2 ? 18 : -24, duration: 7 + i * 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
      )
    })

    /* ---- pointer micro-interactions (desktop only) ---- */
    if (!mobile) {
      root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
        const qx = gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power3.out' })
        const qy = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power3.out' })
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect()
          qx(Math.max(-8, Math.min(8, (e.clientX - r.left - r.width / 2) * 0.25)))
          qy(Math.max(-8, Math.min(8, (e.clientY - r.top - r.height / 2) * 0.25)))
        })
        el.addEventListener('mouseleave', () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
        })
      })
      const follow = root.querySelectorAll<HTMLElement>('[data-follow]')
      if (follow.length) {
        const qs = Array.from(follow, (el) => ({
          x: gsap.quickTo(el, 'xPercent', { duration: 1.2, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'yPercent', { duration: 1.2, ease: 'power3.out' }),
        }))
        root.addEventListener('mousemove', (e) => {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2
          const ny = (e.clientY / window.innerHeight - 0.5) * 2
          qs.forEach((q) => {
            q.x(nx * 6)
            q.y(ny * 6)
          })
        })
      }
    }
  }, root)

  /* ---- load timeline + split targets, once fonts settle ---- */
  const fontsReady = Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => setTimeout(r, FONTS_TIMEOUT)),
  ])
  fontsReady.then(() => {
    if (disposed) return
    ctx.add(() => {
      const splitLines = (el: HTMLElement): Element[] => {
        const split = SplitText.create(el, { type: 'lines', mask: 'lines' })
        splits.push(split)
        return split.lines
      }

      /* one master load sequence */
      const tl = gsap.timeline({ defaults: { ease: p.ease } })
      const loads = Array.from(root.querySelectorAll<HTMLElement>('[data-load]')).sort(
        (a, b) => +(a.dataset.load || 0) - +(b.dataset.load || 0),
      )
      loads.forEach((el) => {
        const at = +(el.dataset.load || 0)
        const kind = el.dataset.motion || 'rise'
        if (kind === 'glow') {
          tl.fromTo(
            el,
            { autoAlpha: 0, scale: 1.06 },
            { autoAlpha: +(el.dataset.opacity || 0.5), scale: 1, duration: p.duration.slow, ease: p.easeExpressive },
            at,
          )
        } else if (kind === 'split') {
          const lines = splitLines(el)
          gsap.set(el, { autoAlpha: 1 })
          tl.fromTo(
            lines,
            { yPercent: 110 },
            { yPercent: 0, duration: p.duration.base, ease: p.easeExpressive, stagger: p.stagger.base },
            at,
          )
        } else if (kind === 'eyebrow') {
          tl.fromTo(el, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: p.duration.fast }, at)
        } else if (kind === 'rise-sm') {
          tl.fromTo(el, { y: D.sm, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: p.duration.fast }, at)
        } else if (kind === 'fade') {
          gsap.set(el, { autoAlpha: 1 })
          tl.fromTo(
            el.children.length > 1 ? Array.from(el.children) : el,
            { opacity: 0 },
            { opacity: 1, duration: p.duration.base, stagger: p.stagger.tight },
            at,
          )
        } else {
          tl.fromTo(el, { y: D.md, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: p.duration.base }, at)
        }
      })

      /* split scroll reveals */
      root.querySelectorAll<HTMLElement>('[data-reveal="split"]').forEach((el) => {
        const delay = +(el.dataset.revealDelay || 0)
        const lines = splitLines(el)
        gsap.fromTo(
          lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: p.duration.base,
            ease: p.easeExpressive,
            stagger: p.stagger.base,
            delay,
            scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          },
        )
      })

      ScrollTrigger.refresh()
    })
  })

  return () => {
    disposed = true
    document.removeEventListener('visibilitychange', onVis)
    splits.forEach((s) => s.revert())
    ctx.revert()
  }
}

/** One init per page: binds the motion system to a root element on mount,
 *  reverts everything on unmount. */
export function useMotion(rootRef: Ref<HTMLElement | null>, personality: () => MotionPersonality) {
  let cleanup: (() => void) | undefined
  onMounted(() => {
    if (rootRef.value) cleanup = initMotion(rootRef.value, personality())
  })
  onBeforeUnmount(() => {
    cleanup?.()
    cleanup = undefined
  })
}
