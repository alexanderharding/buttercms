import { HttpContextToken } from '@angular/common/http';

export const REQUEST_MARKER = new HttpContextToken<void>(() => void 0);
