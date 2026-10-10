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
| `SANITY_REVALIDATE_SECRET` | recommended | A long random text you invent. Turns on instant updates (see "Instant updates" below). Never prefix it with `NEXT_PUBLIC_` |

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
| `components/HomeScrollExperience.tsx` | The homepage scroll engine: phases, zoom animation, the atom's journey. Only logic; the visible sections are separate files |
| `components/home/ClubsSection.tsx`, `AboutSection.tsx`, `AtomOverlay.tsx`, `ClubIcon.tsx` | The visible homepage sections and the floating atom layer |
| `components/home/home-experience.css` | All the homepage styles |
| `components/home/NoticeLayer.tsx` | Homepage announcements (dismissible cards) and the popup (once per visit) |
| `sanity/lib/notices.ts` | Decides which announcements/popups are live right now (switched on and inside their dates) |
| `app/api/revalidate/route.ts` | The address Sanity calls after every edit, for instant updates |
| `hooks/` | Scroll engine (`useScrollStateMachine`, `useLenis`, `useMorphCoordinates`) |
| `sanity/schemaTypes` | Content structure (9 document types) |
| `sanity/lib/queries.ts` | **Every query to Sanity, plus the typed `get…` functions pages use** |

## Content (Sanity)

Edit content at `/studio` (log in with a Sanity account that has been invited to the project).

Document types: **homepage** (single document), **teamMember**, **executiveTeam** (roles for one academic year), **club**, **event**, **galleryItem**, **album** (a Google Drive album: link + cover photo), **announcement**, **popup**.

- **Photos:** featured photos are uploaded to Sanity as *galleryItem*. Full albums stay on Google Drive: create an *album* with the Drive link (shared as "Anyone with the link") and a cover photo.
- **Executive team:** create one *executiveTeam* per academic year (for example `2083/84`). The newest year is shown as the current team.
- **Announcements:** small dismissible cards at the top of the homepage (up to 3). Turn *Active* off or set an *Expiry Date* to hide one. The expiry day itself still shows.
- **Popups:** one modal on the homepage, shown once per visitor session (the newest live one wins). Needs *Active* on and the current time between *Start* and *Expiry*. The button link must start with `https://`.
- **Updates:** with instant updates set up (below), edits appear within seconds. Without it, within about a minute.

### Backend rules

- The Sanity client is pinned to a fixed API date in `sanity/env.ts`. Never use `new Date()` there.
- All reads go through `sanityFetch` (`sanity/lib/fetch.ts`): results are cached for 60 seconds and tagged by document type.
- The Vision plugin in the Studio is handy for testing GROQ queries.
- Images are served from `cdn.sanity.io`. Pages with many photos ask Sanity for the exact size and format (`sanity/lib/imageMeta.ts`) instead of using Vercel's image optimizer.
- Data is fetched in server components. Use `useEffect` fetching only for interactive widgets (like the event countdown).

## Instant updates (Sanity webhook)

By default the site re-checks Sanity regularly. To make edits appear immediately:

1. Invent a long random secret (for example run `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`).
2. Add it to Vercel as `SANITY_REVALIDATE_SECRET` (all environments) and redeploy. Put it in `.env.local` too if you want to test locally.
3. In Sanity (sanity.io/manage → your project → API → Webhooks → Create webhook):
   - **URL:** `https://YOUR-SITE/api/revalidate?secret=THE-SECRET`
   - **Dataset:** `production`
   - **Trigger on:** Create, Update, Delete
   - **Projection:** `{"_type": _type}`
   - **HTTP method:** POST, leave drafts off
4. Publish a small change in the Studio and reload the live page.

With the secret set, the site only re-asks Sanity every 15 minutes as a safety net (see `sanity/lib/fetch.ts`), which keeps the free-plan request quota very safe. Keep `useCdn: false` in `sanity/lib/client.ts`: Sanity's cached copy can lag a few seconds behind a publish, which would defeat the instant update.

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