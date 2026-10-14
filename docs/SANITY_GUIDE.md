# Sanity Guide: how to edit the NSS Clubs website

This guide is for **anyone on the team** (no coding needed). Everything you see on the website (events, photos, the executive team, club pages, announcements) is edited in one place called the **Studio**.

If you only remember one thing: **after you edit something, click Publish.** Unpublished changes are invisible on the website.

---

## 1. Getting in

| Where | Address |
|---|---|
| The live site's editor | `https://YOUR-SITE-ADDRESS/studio` |
| On a developer's laptop | `http://localhost:3000/studio` |

1. Open the address and click **Login**.
2. Sign in with the account that was invited to the project (usually Google or GitHub, with the **shared club email**).
3. You will see the **NSS Clubs Dashboard** on the left.

Can't log in or it says "not allowed"? You need an invitation (see section 9). It works on a phone browser too.

---

## 2. The golden rules

1. **Edit, then Publish.** At the bottom right of every document there is a **Publish** button. Until you click it, the change is only a *draft*. The website shows published content only.
2. **The site updates by itself.** After you publish, the live site changes within about a minute (within seconds if "instant updates" were set up; see the README).
3. **Fill in the required fields.** Sanity will not let you publish until required fields are filled, and it shows a red message telling you which.
4. **Create things in this order**, because later items point to earlier ones:
   **Team members → Clubs → Events → Photos → Executive board → Homepage Settings.**
5. **Nothing is lost when you delete or unpublish by accident**: use the document's **⋯** menu and look at the history. Still, ask before deleting something that other items use (Sanity warns you when it is in use).

---

## 3. Tour of the dashboard

```
NSS Clubs Dashboard
├─ Homepage Settings          ← the homepage text, featured events, featured photos
├─ People & Leadership
│   ├─ Executive Boards       ← one entry per academic year
│   └─ All Team Members       ← everyone who appears on the site (photo + name)
├─ Clubs & Events
│   ├─ Clubs                  ← the six club pages
│   ├─ Events
│   ├─ Media Gallery          ← single photos
│   └─ Photo Albums           ← links to full Google Drive albums
└─ Site Communications
    ├─ Announcements          ← small notices on the homepage
    └─ Popups                 ← one pop-up window on the homepage
```

Handy buttons you will use all the time:

- **+ (plus) above a list** = create a new document of that kind.
- **Publish** (bottom right) = make your changes live.
- **⋯ menu** (next to Publish) = Unpublish, Duplicate, Delete, view history.
- **Search box** on every list = find a document fast.
- On a **reference field** (for example "Associated Club") click it, type a name, and pick from the list. You can also create the missing item right there.
- On a **list field** (for example "Key Achievements") click **Add item**. Drag the handle to reorder.

> **Photos:** drag a picture into any image field or click upload. After uploading, use the image's crop / hotspot tool to mark the **important part** (for example a face). The website then crops around that spot on phones and wide screens. Use photos that are not huge: about **3000 pixels wide or smaller, under 5 MB** is plenty.

---

## 4. Recipes (step by step)

### 4.1 Add a person (do this before the executive board or a club)
1. **People & Leadership → All Team Members → +**
2. Fill in **Full Name**, **Profile Photo**, **Gender**. (Grade and Short Bio are optional.)
3. **Publish.**

### 4.2 Set up the new executive board (once a year)
1. Make sure every person has a **Team Member** entry (4.1).
2. **People & Leadership → Executive Boards → +**
3. **Academic Year**: type it the same way every year, like `2083/84`. The website sorts these, and the **newest year is shown as the current team**, older ones appear under "Previous teams".
4. Pick people for the roles. **President, Secretary and Treasurer are required.** Advisor, the two Vice Presidents, Vice Secretary and Vice Treasurer are optional; empty roles simply don't appear.
5. **Publish.** It appears on the **Executive Team** page.

### 4.3 Edit a club page
1. **Clubs & Events → Clubs** and open the club.
2. You can edit: **Description**, **Club Logo**, **Hero Image** (the big banner), **Club Heads** (max 2), **Vice Heads** (max 2) and **Key Achievements** (click Add item for each).
3. **Publish.**

> **Never change the Slug of a club.** The website recognises the six clubs by these exact slugs. If one is different, its events and photos will not show up and its page loses its content.
>
> | Club | Slug (exactly) |
> |---|---|
> | STEM Club | `stem` |
> | Sports Club | `sports` |
> | Literature Club | `literature` |
> | Arts & Craft Club | `arts` |
> | Entertainment Club | `entertainment` |
> | Social Club | `social` |
>
> Careful: the **Generate** button next to Slug would create something like `stem-club`. That is wrong. Type the slug yourself.

### 4.4 Add an event
1. **Clubs & Events → Events → +**
2. **Event Title**, then click **Generate** next to **Slug** (the slug becomes the web address, e.g. `/events/nss-talent-hunt-2083`).
3. **Event Date & Time**: enter the real date and time as shown on your computer. The website shows event times in **Nepal time**.
4. **Event Description** (plain text; new lines are kept), **Cover Image**, and **Associated Club** (pick the host club so the event also appears on that club's page).
5. **Registration Link** (optional): paste a full address that starts with `https://`. A **Register now** button appears on the event page **only while the event is still upcoming**.
6. **Enable Countdown Timer?** turn it on to show a live countdown on the event page (only before the event).
7. **Publish.**

The event now appears on the **Events** page (under *Upcoming*, and later under *Past events*) and on its club's page.

> **To put the event on the homepage:** open **Homepage Settings → Featured Events** and add it there (see 4.7). The **Featured Event?** switch on the event itself currently does nothing.

### 4.5 Add photos to the gallery
1. **Clubs & Events → Media Gallery → +**
2. **Image Title / Caption** (shown when the photo is opened), **Image**.
3. Pick **Associated Club** and/or **Associated Event** if they apply. This is how the photo shows up on that club's page and on that event's page, and how the club filter buttons on the Gallery page work.
4. **Publish.**

The **Gallery** page shows **all** published photos, newest first (it loads the latest 120). To use many photos at once, add them one after another; use **Duplicate** from the **⋯** menu to copy the club/event settings.

> The **Featured in Main Gallery?** switch currently does nothing. The homepage uses the list in Homepage Settings instead (see 4.7).

### 4.6 Add a full photo album from Google Drive
Full albums stay on Google Drive; the website shows a nice card that opens the album.
1. In **Google Drive**: right-click the folder → **Share** → under *General access* choose **Anyone with the link** → **Viewer** → **Copy link**.
2. **Clubs & Events → Photo Albums → +**
3. **Album Title**, paste the **Google Drive Link**, upload one great **Cover Photo**, add **Album Date**, a short **Description**, and the **Associated Club / Event** if they apply.
4. **Publish.**

The album appears on the **Gallery** page, and on the event's page if you linked an event. If **Photo Albums** is missing from the menu, a developer has to add it (see README, "For developers").

### 4.7 Change the homepage
Open **Homepage Settings** (the first item). Sections:
- **President's Message** and **President's Photo**: shown in the **About** section on the homepage. Update both each year. (The message is required.)
- **Featured Events**: pick the events for the "Upcoming Events" cards after the About section (up to **6** are shown, in the order you choose).
- **Homepage Gallery Showcase**: the photos that float around the circle near the end of the page. It uses **6** photos. Pick **exactly 6** (fewer than 6 means some photos repeat; more than 6 and only the first 6 are used). Drag to reorder.
- **Legacy Statistics & Achievements**: not shown on the site yet; ignore it.
Then **Publish**.

### 4.8 Post an announcement
1. **Site Communications → Announcements → +**
2. **Notice Title**, **Notice Content** (keep it short), make sure **Active?** is on.
3. **Expiry Date** (optional): the notice disappears after that day. The expiry day itself still shows.
4. **Publish.**

It appears as a small card under the menu on the **homepage**. Visitors can close it. Up to **3** announcements show at once (newest first). To hide one early, switch **Active?** off and publish.

### 4.9 Show a pop-up
1. **Site Communications → Popups → +**
2. **Popup Title**, **Popup Message**, and optionally **Button Text** and **Button Link** (the link must start with `https://`).
3. **Active?** on. **Start Date & Time** and **Expiry Date & Time** are optional: leave them empty to show it until you switch it off.
4. **Publish.**

Visitors see **one** pop-up about a second and a half after the homepage loads, **once per visit**. If several are live, only the newest shows. Don't leave pop-ups on longer than needed; they can annoy people.

### 4.10 Hide or remove something
- **Hide it but keep it:** open it → **⋯** → **Unpublish**. (For announcements and pop-ups you can also switch **Active?** off.)
- **Remove it for good:** **⋯** → **Delete**. If it is used somewhere (for example an event listed in Featured Events), Sanity tells you where; remove it there first.

---

## 5. Where does each thing show up?

| You edit | It appears on |
|---|---|
| Homepage Settings: President's Message and Photo | Homepage, About section |
| Homepage Settings: Featured Events | Homepage, "Upcoming Events" cards |
| Homepage Settings: Homepage Gallery Showcase | Homepage, circle of photos |
| Event | Events page, its own page, its club's page, search engines (sitemap) |
| Club | Its club page (`/clubs/<slug>`) |
| Media Gallery item | Gallery page, its club's page, its event's page |
| Photo Album | Gallery page, its event's page |
| Executive Board | Executive Team page |
| Team Member | Wherever they are placed (board, club heads) |
| Announcement / Popup | Homepage only |

---

## 6. Quick rules and limits

| Thing | Rule |
|---|---|
| Club slug | Exactly: `stem`, `sports`, `literature`, `arts`, `entertainment`, `social` |
| Club Heads / Vice Heads | At most 2 each, no duplicates |
| Executive board | President, Secretary, Treasurer required; year like `2083/84`, same style every year |
| Team member | Name, photo and gender required |
| Event | Title, slug, date and time required |
| Links (registration, pop-up button, Drive) | Must start with `https://` |
| Announcements on the homepage | Up to 3 |
| Pop-up | One per visit, the newest live one |
| Homepage gallery showcase | 6 photos |
| Featured events | Up to 6 shown |
| Gallery page | Latest 120 photos |

---

## 7. Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| I changed something and the site is the same | You didn't click **Publish** (look for the **Draft** mark on the document). Then wait a minute and hard-refresh the page (Ctrl+Shift+R, or reopen on your phone). |
| Publish is greyed out | A required field is empty; look for the red messages. |
| An event is missing from a club page | Open the event and set **Associated Club**; check the club's slug (section 4.3). |
| A photo is missing from the club or event page | Open the photo and set **Associated Club / Event**, then Publish. |
| Executive team shows the wrong year as current | The newest **Academic Year** text wins. Make sure the format matches (for example `2083/84`, not `83/84`). |
| A club page shows only basic text | The club document is missing or its slug is wrong (section 4.3). |
| The Register button is missing | The event is already past, or the link doesn't start with `https://`. |
| A pop-up doesn't show | **Active?** is off, it's outside its start/expiry time, or you already saw it in this browser visit (open the site in a new private window to test). |
| The Studio won't load or log in on the live site | A developer must add the live address in Sanity under **API → CORS origins** with **Allow credentials** ticked (see README). |
| "Not allowed" or you can't edit | You need an invitation with an **Editor** role (section 9). |

Still stuck? Ask the executive team's tech person and mention the page and what you expected.

---

## 8. Photo and writing tips

- **Cover images** look best in landscape (wider than tall). **Profile photos** work best as a clear face, roughly centred; set the hotspot on the face.
- Use real captions on gallery photos ("Sports Day finals, 2083"), because they are read aloud by screen readers.
- Keep announcements to a sentence or two. Put details on the event page.
- Event descriptions: write short paragraphs; blank lines are kept.

---

## 9. People and access

**Inviting a new editor:** go to `sanity.io/manage` → pick the NSS Clubs project → **Members** → **Invite** → enter their email → role **Editor** (can edit content) or **Administrator** (can also manage the project). Give most people **Editor**.

**Each year (handover):** invite the new president and executive members, and remove people who left. The project, hosting and code accounts should belong to the **shared club email** held by the club advisor (see README, "Handing over"), so access never depends on one person.

---

## 10. Yearly checklist for the new team

- [ ] Log in to the Studio and the hosting accounts using the shared club email.
- [ ] Add the new **Team Members** (photos!).
- [ ] Create the new **Executive Board** (new academic year, same format).
- [ ] Update **President's Message** and **President's Photo** in Homepage Settings.
- [ ] Update each **Club**: heads, vice heads, achievements, hero image.
- [ ] Refresh **Homepage Gallery Showcase** with 6 fresh photos and **Featured Events**.
- [ ] Switch off or delete old **Announcements** and **Popups**.
- [ ] Ask a developer to update the contact details and the numbers in the About section (they live in the code: `lib/site.ts`, `components/home/AboutSection.tsx`, `lib/clubs.ts`).
- [ ] Invite the new members in Sanity, and remove the ones who left.

---

## 11. Notes for developers

- Content types live in `sanity/schemaTypes`, the sidebar layout in `sanity/structure.ts`. A new type only appears in the sidebar after you add it to `structure.ts`.
- To add **Photo Albums** to the menu, put `S.documentTypeListItem('album').title('Photo Albums')` inside the "Clubs & Events" list in `structure.ts`.
- All site queries are in `sanity/lib/queries.ts` (plus `notices.ts` and `clubQueries.ts`). They read **published** documents only.
- Known quirks: the **Featured Event?** (event) and **Featured in Main Gallery?** (gallery item) switches and **Legacy Statistics** (homepage) are stored but not used by the site. Either wire them up or remove them from the schema so editors are not misled.
- A dataset backup can be made from the project folder with `npx sanity login` then `npx sanity dataset export production`. Do this once a year and store it with the club's files.
- Instant updates and deployment are described in the README.