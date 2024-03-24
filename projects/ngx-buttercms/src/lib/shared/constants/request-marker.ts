import { HttpContextToken } from '@angular/common/http';

/**
 * @public
 */
export const REQUEST_MARKER = new HttpContextToken<void>(() => void 0);
