# NSS Club Website

## 🗄️ Backend Architecture (Sanity CMS)

The backend is powered by **Sanity.io**, operating as a fully headless, relational Content Lake. The Sanity Studio is mounted locally within the Next.js App Router at `/studio`.

### ⚙️ Core Backend Rules

- **API Versioning**: The Sanity client is pinned to a static UTC date (e.g., 2026-05-31) inside `sanity/env.ts`. Never use dynamic dates (like `new Date()`), as this prevents sudden breaking changes when Sanity updates their API.
- **Query Testing**: The Vision Plugin is enabled in the Studio navigation bar. Use it to test GROQ queries, verify reference resolution (`->`), and inspect raw JSON payloads before writing frontend fetch logic.
- **Image Pipeline**: Sanity stores images as asset references. They are transformed on-the-fly and served via `cdn.sanity.io` using the `urlFor()` helper located in `sanity/lib/image.ts`.
- **Singleton Pattern**: The homepage schema is structured as a Singleton (locked to `_id == "homepage"` via the Structure Tool) to prevent duplicate global configurations.

### 🧩 Schema Topology (8 Document Types)

The Content Lake is strictly relational. References (`type: 'reference'`) are used heavily to prevent data duplication.

- **homepage**: Global settings (President's message, Legacy Stats, Featured Events/Gallery).
- **teamMember**: Base directory of people (Name, Photo, Bio, Grade).
- **executiveTeam**: Maps specific roles (President, Secretary) to teamMember references by Academic Year.
- **club**: The 6 core institutions. Includes auto-generated slug for dynamic routing, and arrays of teamMember references for Club Heads.
- **event**: Datetime-driven events linked to specific clubs via references.
- **galleryItem**: Centralized media library. Images are tagged to clubs and/or events via cross-references.
- **announcement**: Standard text notices with `isActive` toggles and `expiryDate` (date only).
- **popup**: Marketing modals with CTA links, restricted by `startDate` and `expiryDate` (datetime).

### 🔄 Data Fetching Pipeline

- **Queries**: All GROQ queries are centralized in `sanity/lib/queries.ts`.
- **Types**: Strict TypeScript interfaces mapping the Sanity schemas live in `sanity/lib/types.ts`.
- **Execution**: Data is fetched exclusively via React Server Components (async/await) using the `next-sanity` client. Client-side fetching (`useEffect`) is strictly prohibited unless building interactive widgets (like live countdown timers).

