import { blockContentType } from "./blockContentType"; // Keep this for future rich-text needs
import { teamMemberType } from "./teamMemberType";
import { executiveTeamType } from "./executiveTeamType";
import { clubType } from "./clubType";
import { eventType } from "./eventType";
import { galleryItemType } from "./galleryItemType";
import { announcementType } from "./announcementType";
import { popupType } from "./popupType";
import { homepageType } from "./homepageType";

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
  ],
};