import { InjectionToken, isDevMode } from '@angular/core';

/**
 * @see {@link InjectionToken}
 * @default 'https://api.buttercms.com/v2'
 */
export const baseUrl = new InjectionToken<string>(
	isDevMode() ? 'baseUrl' : '',
	{ factory: () => 'https://api.buttercms.com/v2' },
);
