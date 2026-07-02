# Onboarding — the interview that writes the first draft

The old onboarding asked for two things (a handle and a template) and dropped
the user into a dashboard full of Alia Rahman's sample content. The new
onboarding is a short **interview**: three light steps of context, then a
staged "crafting" moment that auto-drafts the entire `StoryPage` — headline,
intro, quote, about, chapter scaffolds, gallery slots, links, meta — **and**
auto-picks the Look, so the first thing a user sees in the editor is a page
that is already recognizably *theirs*.

## Principles

- **Every question earns its keep.** Nothing is asked that doesn't change the
  draft or the Look. Three steps, ~60 seconds, no free-text walls.
- **Bounded answers, like the design system.** Field, vibe and goal are chips,
  not essays — the same "depth inside a fence" bet as `DesignConfig`.
- **The reveal is the reward.** A staged generation moment (mocked, like
  autosave) makes the draft feel crafted, then shows the picked Look and the
  drafted words together, with one-tap alternates.
- **Nothing is final.** Every drafted word and the picked Look remain fully
  editable in the editor; the reveal says so explicitly.

## The flow (4 steps)

| step | asks | feeds |
|---|---|---|
| 1 · Who you are | name, location, handle (auto-suggested from name, editable) | `identity.name/location`, site handle, chapter scaffold |
| 2 · Your craft | field (6 chips), role (free text + per-field suggestions), vibe (4 chips) | headline, about, gallery slots, meta + **Look scoring** |
| 3 · Your intent | goal (4 chips), availability toggle, optional links (website / LinkedIn / GitHub / Instagram) | intro, about closer, `availability`, `links` + Look nudge |
| 4 · The reveal | nothing — staged "crafting" lines (~2.5s), then draft + Look with alternates | applies everything, then `/dashboard` |

Reveal actions: **Use this page** (apply + dashboard), **Try another look**
(cycles the top-3 scored Looks), **Redraft the words** (rotates copy variants
deterministically via a seed).

## The draft engine (`app/data/onboarding.ts`)

Pure and deterministic — `(context, seed) → draft`. No network, no randomness,
same answers always produce the same page. When the backend lands, an LLM
endpoint can replace `generateDraft` behind the same signature.

**Look picking** is a transparent score over the curated `LOOKS`:
vibe (0–3 pts, the main driver) + field (0–2) + goal (0–1), scored only over
templates the user's plan unlocks (Pro looks never auto-picked on free).
Top score wins; the next two become the "try another look" alternates.

**Copy** comes from curated template tables — headlines per field (one per
vibe, and the redraft seed rotates through the field's pool), quotes per vibe,
intro/about lines per goal, gallery slots per field. Chapters are written as
*scaffolds that coach*: each body tells the user what belongs there, in the
page's own voice, so an unedited page still reads intentionally.

## What it deliberately doesn't do

No section reordering (Looks dress, they don't restructure), no raw color/font
knobs (that's the editor's job), no required links, no more than one free-text
field per step.
