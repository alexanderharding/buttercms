import { InjectionToken, isDevMode } from '@angular/core';

/**
 * @see {@linkcode InjectionToken}
 * @default "campaigns"
 */
export const storageKey = new InjectionToken<string>(
	isDevMode() ? 'storageKey' : '',
	{ factory: () => 'campaigns' },
);
