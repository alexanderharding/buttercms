import { HttpContextToken } from '@angular/common/http';

/**
 * @description A signifier that an Http request should be treated as if it originated from a CMS context.
 * @see {@link HttpContextToken}
 */
export const requestMarker = new HttpContextToken<void>(() => void 0);
