import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('NSS Clubs Dashboard')
    .items([
      // 1. HOMEPAGE SINGLETON
      S.listItem()
        .title('Homepage Settings')
        .child(S.document().schemaType('homepage').documentId('homepage')),
      
      S.divider(), // Adds a visual line in the sidebar
      
      // 2. PEOPLE GROUP
      S.listItem()
        .title('People & Leadership')
        .child(
          S.list()
            .title('People')
            .items([
              S.documentTypeListItem('executiveTeam').title('Executive Boards'),
              S.documentTypeListItem('teamMember').title('All Team Members'),
              S.documentTypeListItem('presidentLegacy').title("President's Legacy"),
            ])
        ),

      // 3. ACTIVITIES GROUP
      S.listItem()
        .title('Clubs & Events')
        .child(
          S.list()
            .title('Activities')
            .items([
              S.documentTypeListItem('club').title('Clubs'),
              S.documentTypeListItem('event').title('Events'),
              S.documentTypeListItem('album').title('Photo Albums'),
              S.documentTypeListItem('galleryItem').title('Media Gallery'),
            ])
        ),

      // 3b. NSS IT TEAM GROUP
      S.listItem()
        .title('NSS IT Team')
        .child(
          S.list()
            .title('NSS IT Team')
            .items([
              S.listItem()
                .title('Team Page Text')
                .child(S.document().schemaType('itTeamPage').documentId('itTeamPage')),
              S.documentTypeListItem('itTeamMember').title('IT Team Members'),
              S.documentTypeListItem('itProject').title('IT Projects'),
            ])
        ),

      // 4. COMMUNICATIONS GROUP
      S.listItem()
        .title('Site Communications')
        .child(
          S.list()
            .title('Communications')
            .items([
              S.documentTypeListItem('announcement').title('Announcements'),
              S.documentTypeListItem('popup').title('Popups'),
            ])
        ),
    ])