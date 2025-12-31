export const JWT_EXPIRY_SECONDS = 3600 * 1000 * 24;
//export const JWT_EXPIRY_SECONDS = 1000 * 60;

export enum ROLES_ENUM {
  ADMIN = 'admin',
  USER = 'user',
  DEALER = 'dealer',
}

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  DEALER: 'dealer',
};
export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 100;

export const DEFAULT_SORT_BY = 'id';

export const API_PREFIX = '/api/v1';

//Regex
export const PHONE_REGEX = /^[0-9\s+-.()]+$/;

export const SLUG_SEPARATOR = '-';
