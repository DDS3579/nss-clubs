import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import { teamMemberType } from "./teamMemberType";

export const schema = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    teamMemberType,
  ],
};
