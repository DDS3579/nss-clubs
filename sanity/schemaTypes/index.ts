import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import { teamMemberType } from "./teamMemberType";
import { executiveTeamType } from "./executiveTeamType";
import { clubType } from "./clubType";
import {eventType} from "./eventType";
import { galleryItemType } from "./galleryItemType";

export const schema = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    teamMemberType,
    executiveTeamType,
    clubType,
    eventType,
    galleryItemType,
  ],
};
