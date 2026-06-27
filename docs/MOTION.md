# Motion system

Themes feel like high-end, hand-built sites because motion is a **designed
system**, not scattered tweens. The whole engine lives in one file —
[`app/themes/_motion/useMotion.ts`](../app/themes/_motion/useMotion.ts) — and is
driven entirely by `data-*` attributes, so theme markup and motion stay
decoupled exactly the way content and theme do.

Stack: **GSAP** + **ScrollTrigger** + **SplitText**, client-only. (Lenis smooth
scroll is mentioned in the root README but is not installed yet.)

## The core idea: data-attribute choreography

A theme never calls GSAP. It annotates elements with attributes, and
`initMotion(root, personality)` walks the root once and wires everything up.
This is why a new theme gets the full motion system for free — it just labels its
markup.

| attribute | when it fires | kinds / values |
|---|---|---|
| `data-load="0.25"` | the one-time page **load timeline** (value = start time) | paired with `data-motion` |
| `data-motion` | how a load element enters | `split`, `rise`, `rise-sm`, `eyebrow`, `glow`, `fade` |
| `data-reveal` | **scroll** reveal, once, at `top 82%` | `rise` (default), `split`, `line`, `clip`, `fade`, `slide` |
| `data-reveal-delay` | extra delay on a scroll reveal | seconds |
| `data-parallax` | scrubbed parallax tied to scroll | `subtle`, `deep` (+ `data-dir="-1"`) |
| `data-magnetic` | pointer: element leans toward the cursor | (desktop only) |
| `data-follow` | pointer: element drifts with cursor position | (desktop only) |
| `data-drift` | ambient infinite yoyo loop (pauses when tab hidden) | — |
| `data-media` | inside a `clip` reveal: the image scales `1.12 → 1` | — |
| `data-opacity` | target alpha for a `glow` load element | 0–1 |

## The four-layer model

Motion is composed in layers, animated in order, so a page resolves the way a
designed title sequence does rather than everything moving at once:

```
L0 atmosphere   glow halos, grain, vignette        (data-load glow + data-drift/follow)
L1 structure    nav, rules, section frames          (data-load rise-sm, data-reveal line)
L2 content      headline, intro, body, cards        (data-load split/rise, data-reveal rise/split/clip)
L3 interactive  links, nav items                    (data-magnetic, hover states)
```

## Two timelines

### 1. The load timeline (once, on mount)

One orchestrated master `gsap.timeline()`. Every `[data-load]` element is sorted
by its numeric start time and added at that position, so the page composes as a
single sequence:

- `glow` — fades + scales a halo in (`autoAlpha 0 → data-opacity`, `scale 1.06 → 1`)
- `split` — the headline; split into lines (masked) and risen `yPercent 110 → 0`
  with a stagger
- `eyebrow` / `rise-sm` / `rise` — small/medium rises with `autoAlpha`
- `fade` — opacity in, staggering children if there are several

### 2. Scroll reveals (quiet, `once: true`)

After the load sequence, the page goes quiet. Each `[data-reveal]` binds a
ScrollTrigger at `start: 'top 82%'`, `once: true` — it plays a single time and
never re-animates on scroll-back:

- `rise` (default) — `y → 0`, fade
- `split` — line-split rise (bound after fonts settle)
- `line` — a hairline scales in from the left (`scaleX 0 → 1`)
- `clip` — `clipPath inset(... 100% ...) → inset(0)`; a child `[data-media]`
  scales `1.12 → 1` for a "reveal under a mask" feel
- `fade` — opacity only
- `slide` — small `x` slide + fade (used for chapter period labels)

### Parallax & ambient

- `[data-parallax]` scrubs `y` against its parent's scroll (`deep` uses
  `innerHeight * personality.parallax.deep`; `subtle` is a flat 24px). `data-dir`
  flips direction.
- `[data-drift]` runs an infinite `sine.inOut` yoyo and **pauses on
  `visibilitychange`** when the tab is hidden.
- `[data-magnetic]` / `[data-follow]` are pointer micro-interactions, wired only
  on desktop.

## Motion personalities

Same primitives, different temperament. Each theme declares a
`MotionPersonality` in `THEMES` (see [`registry.ts`](../app/themes/registry.ts)):

```ts
interface MotionPersonality {
  ease: string                                  // base easing
  easeExpressive: string                        // for splits/glows
  duration: { fast; base; slow }
  stagger:  { tight; base; loose }
  distance: { sm; md; lg }                       // px travel
  parallax: { subtle; deep }
}
```

| | editorial | minimal |
|---|---|---|
| ease | `power3.out` | `power2.out` |
| expressive ease | `expo.out` | `power3.out` |
| duration base | `0.9s` | `0.55s` |
| distance md | `40px` | `22px` |
| parallax deep | `0.22` | `0.08` |

### The user's motion level scales it

The `motionLevel` design control (`calm 0.55` / `balanced 1` / `expressive 1.45`)
runs through `scaleMotion(personality, level)`, which multiplies **amplitude
only** — distance, stagger, and parallax scale; **durations stay**. So "calm"
moves less, not slower. The public page passes
`scaleMotion(theme.motion, story.design.motionLevel)` into `useMotion`.

## The hard rules

These are non-negotiable and already enforced in `useMotion.ts`:

1. **Transforms, opacity, and clip-path only.** No animating layout properties.
2. **Accessibility first.** On `prefers-reduced-motion: reduce`, all motion is
   skipped — elements are set visible and only a 0.2s opacity settle plays.
3. **Mobile restraint.** On `max-width: 768px`, travel distances are halved and
   pointer effects (`magnetic`, `follow`) are not wired at all.
4. **Wait for fonts.** The load timeline and all `split` reveals are deferred
   until `document.fonts.ready` (raced against a 1.5s timeout), because real user
   headlines wrap unpredictably and SplitText must measure against the real
   faces. `ScrollTrigger.refresh()` is called after the split work.
5. **Clean teardown.** Everything runs inside a `gsap.context(... , root)`; the
   returned cleanup reverts the context and every SplitText, removes the
   `visibilitychange` listener, and guards against a fonts-ready callback firing
   after unmount (`disposed` flag). No orphaned triggers, no leaks on theme
   switch or route change.
6. **No flash.** `[data-load]` elements are set `autoAlpha: 0` up front so
   nothing appears before the timeline runs.

## Using motion from a page

One init per page. [`pages/[slug].vue`](../app/pages/%5Bslug%5D.vue):

```ts
const rootRef = ref<HTMLElement | null>(null)
useMotion(rootRef, () => scaleMotion(theme.motion, story.design.motionLevel))
// <div ref="rootRef"><component :is="theme.component" :story="story" /></div>
```

`useMotion` binds on `onMounted` (only if `rootRef` is set) and reverts on
`onBeforeUnmount`. `initMotion` is a no-op on the server (`import.meta.server`),
so SSR output ships markup with no inline transforms and the animation layers in
on the client.

## Adding motion to new markup

Don't write tweens — add attributes:

- Entering on load? `data-load="<time>" data-motion="<kind>"`.
- Entering on scroll? `data-reveal="<kind>"` (+ `data-reveal-delay`).
- Background depth? `data-parallax="subtle|deep"` (+ `data-dir`).
- Pointer life? `data-magnetic` or `data-follow` (degrade automatically on mobile).

If a new kind is genuinely needed, add a branch in `initMotion` — but prefer
composing existing kinds first.
</content>
