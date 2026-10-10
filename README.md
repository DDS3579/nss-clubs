# NSS Clubs Website

The website of NSS Clubs: an executive team (the nucleus) and six clubs (the electrons): Social, Entertainment, Sports, Literature, Arts and Crafts, STEM. Built with Next.js (App Router), Tailwind CSS v4 and Sanity as the content system.

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in the values (see below)
npm run dev                    # http://localhost:3000
```

Before sharing changes: `npm run build && npm run lint` (both should finish clean).

### Environment variables

| Variable | Needed | What it is |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | Sanity project ID (sanity.io/manage → your project) |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | Usually `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | no | Defaults to a pinned date in `sanity/env.ts` |
| `NEXT_PUBLIC_SITE_URL` | recommended | The public address, e.g. `https://nssclubs.example`. Used for share previews and the sitemap |

None of these are secrets (they are public by design), but `.env.local` is not committed to git. Put the same variables in the hosting dashboard.

## Where things live

| Path | What |
|---|---|
| `app/page.tsx` | Homepage (the scroll story) |
| `app/clubs/[slug]` | The six club pages |
| `app/events`, `app/events/[slug]` | Events list and event pages |
| `app/gallery` | Photo wall and Google Drive albums |
| `app/executive-team` | Current and previous teams |
| `app/contact` | Contact page |
| `app/studio` | The content editor (Sanity Studio) at `/studio` |
| `lib/clubs.ts` | **The six clubs + executive team: names, colours, orbit slots.** Edit here to change club details shown on the atom |
| `lib/site.ts` | Site name and **contact details** (email, phone, address, social links) |
| `lib/dates.ts` | Event date formatting. The time zone is one constant at the top |
| `lib/math.ts` | Shared math/easing helpers for the animations |
| `components/HeroAtom.tsx` | The atom (canvas) |
| `components/HomeScrollExperience.tsx` | The homepage scroll choreography; styles in `components/home/home-experience.css` |
| `hooks/` | Scroll engine (`useScrollStateMachine`, `useLenis`, `useMorphCoordinates`) |
| `sanity/schemaTypes` | Content structure (9 document types) |
| `sanity/lib/queries.ts` | **Every query to Sanity, plus the typed `get…` functions pages use** |

## Content (Sanity)

Edit content at `/studio` (log in with a Sanity account that has been invited to the project).

Document types: **homepage** (single document), **teamMember**, **executiveTeam** (roles for one academic year), **club**, **event**, **galleryItem**, **album** (a Google Drive album: link + cover photo), **announcement**, **popup**.

- **Photos:** featured photos are uploaded to Sanity as *galleryItem*. Full albums stay on Google Drive: create an *album* with the Drive link (shared as "Anyone with the link") and a cover photo.
- **Executive team:** create one *executiveTeam* per academic year (for example `2083/84`). The newest year is shown as the current team.
- **Updates appear on the site within about a minute.**

### Backend rules

- The Sanity client is pinned to a fixed API date in `sanity/env.ts`. Never use `new Date()` there.
- All reads go through `sanityFetch` (`sanity/lib/fetch.ts`): results are cached for 60 seconds and tagged by document type.
- The Vision plugin in the Studio is handy for testing GROQ queries.
- Images are served from `cdn.sanity.io`. Pages with many photos ask Sanity for the exact size and format (`sanity/lib/imageMeta.ts`) instead of using Vercel's image optimizer.
- Data is fetched in server components. Use `useEffect` fetching only for interactive widgets (like the event countdown).

## Deploying (Vercel)

1. Push the repository to GitHub and import it at vercel.com/new.
2. Add the environment variables above (Project → Settings → Environment Variables), including `NEXT_PUBLIC_SITE_URL`.
3. In Sanity (sanity.io/manage → API → CORS origins), add your site address and enable **Allow credentials**. Without this, `/studio` will not log in on the live site.
4. Every push to the main branch deploys automatically.

## Handing over to next year's team

The president changes every year, so do not let any account live only in one person's name.

- Create or use a **shared club email** and register the GitHub, Vercel and Sanity accounts (or invite that address as owner/admin) with it.
- Keep that email's password with the club advisor and pass it on each year.
- Invite the new president and executive members to the Sanity project (sanity.io/manage → Members) and remove outgoing ones.
- Update `lib/site.ts` (contact details) and add the new *executiveTeam* in the Studio.