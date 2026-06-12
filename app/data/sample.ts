import type { StoryPage } from '~/types/story'

/** Sample content from the design handoff: Alia Rahman, a fictional
 *  independent type designer in Kuala Lumpur (Studio Huruf).
 *  Stands in for real user content until the API lands. */
export const aliaStory: StoryPage = {
  themeKey: 'editorial',
  accent: 'aurora',
  typeMood: 'serif',
  identity: {
    name: 'Alia Rahman',
    role: 'type designer',
    location: 'kuala lumpur',
    headline: 'Letters that carry stories home',
    intro:
      'Independent type designer drawing Latin and Jawi letterforms. Twelve typefaces released, most of them named after streets I grew up on.',
    meta: ['studio practice since 2017', 'chow kit, kuala lumpur'],
    availability: 'open for commissions',
  },
  about: {
    quote: 'I draw the letters that street signs and novels borrow when they need to feel like home.',
    body: 'I started with a brush, painting shop signs with my uncle before I ever opened a font editor. That order still shapes the work: warmth first, precision second. My retail typefaces live in bookshops, kopitiams and campaign posters across Southeast Asia, and my commissioned work helps brands sound like where they are from.',
  },
  chapters: [
    {
      period: '2014 – 2017',
      title: 'Sign painting first',
      body: 'Apprenticed with my uncle painting shop fascias around Chow Kit. Learned letters by brush before bezier, and learned that a sign has one job: make a stranger feel expected.',
    },
    {
      period: '2017 – 2019',
      title: 'The night classes',
      body: 'Taught myself type design after work, one stolen hour at a time. Released Kemuning, my first retail family, and watched a bookshop in Penang set its window in it.',
    },
    {
      period: '2020 – 2023',
      title: 'Studio Huruf',
      body: 'Opened a two-person foundry above a kopitiam. Custom lettering for local brands, a Jawi revival commissioned by a museum, and ten more families into the catalogue.',
    },
    {
      period: '2024 – now',
      title: 'Teaching the next hand',
      body: 'Half the week is workshops now. Brush first, software later. The other half is drawing the biggest project yet: a pan-Malay text family for long-form reading.',
    },
  ],
  gallery: [
    { slot: 'specimen poster', caption: 'kemuning display · 2019', ratio: '4 / 5', dir: 1, offset: 0 },
    { slot: 'process / brush studies', caption: 'jawi revival drafts · 2022', ratio: '4 / 3', dir: -1, offset: 48 },
    { slot: 'studio window', caption: 'studio huruf, chow kit', ratio: '4 / 3', dir: 1, offset: 0 },
    { slot: 'in use / bookshop fascia', caption: 'gerakbudaya, penang', ratio: '4 / 5', dir: -1, offset: 48 },
  ],
  links: [
    { label: 'Browse the typefaces', url: 'https://huruf.studio' },
    { label: 'Studio diary on instagram', url: 'https://instagram.com/aliahuruf' },
    { label: 'Letters, a monthly newsletter', url: 'https://huruf.studio/letters' },
    { label: 'Commission an alphabet', url: 'mailto:mail@huruf.studio' },
  ],
  isPublished: true,
}

export const hurufStory: StoryPage = {
  ...aliaStory,
  themeKey: 'minimal',
  accent: 'jade',
  typeMood: 'sans',
  identity: {
    ...aliaStory.identity,
    name: 'Studio Huruf',
    role: 'type foundry',
    headline: 'Warmth first, precision second',
  },
  isPublished: false,
}

export interface PageRecord {
  id: string
  slug: string
  story: StoryPage
  views: string
  updated: string
}

/** Stand-in for the pages table until the CRUD API lands. */
export const samplePages: PageRecord[] = [
  { id: 'alia', slug: 'alia', story: aliaStory, views: '1.4k views · 30d', updated: 'edited 2d ago' },
  { id: 'huruf', slug: 'huruf', story: hurufStory, views: '— views · 30d', updated: 'edited 3w ago' },
]
