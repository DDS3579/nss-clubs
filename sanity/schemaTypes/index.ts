import { blockContentType } from "./blockContentType"; // Keep this for future rich-text needs
import { teamMemberType } from "./teamMemberType";
import { executiveTeamType } from "./executiveTeamType";
import { clubType } from "./clubType";
import { eventType } from "./eventType";
import { galleryItemType } from "./galleryItemType";
import { announcementType } from "./announcementType";
import { popupType } from "./popupType";
import { homepageType } from "./homepageType";
import { albumType } from "./albumType";
import { presidentLegacyType } from "./presidentLegacyType";
import { itTeamPageType } from "./itTeamPageType";
import { itTeamMemberType } from "./itTeamMemberType";
import { itProjectType } from "./itProjectType";

export const schema = {
  types: [
    blockContentType, 
    teamMemberType,
    executiveTeamType,
    clubType,
    eventType,
    galleryItemType,
    announcementType,
    popupType,
    homepageType,
    albumType,
    presidentLegacyType,
    itTeamPageType,
    itTeamMemberType,
    itProjectType,
  ],
};