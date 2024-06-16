import { InjectionToken, isDevMode } from '@angular/core';
import { Preview } from '../enums';

/**
 * @see {@link Preview}
 * @see {@link InjectionToken}
 * @default Preview.off
 */
export const preview = new InjectionToken<Preview>(
	isDevMode() ? 'preview' : '',
	{ factory: () => Preview.off },
);
