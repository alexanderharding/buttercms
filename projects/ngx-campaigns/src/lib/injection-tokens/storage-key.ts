import { InjectionToken, isDevMode } from '@angular/core';

/**
 * @description Configures the injector to return a key used to access and write to campaign storage.
 * @see {@linkcode InjectionToken}
 * @default "campaigns"
 */
export const storageKey = new InjectionToken<string>(
	isDevMode() ? 'storageKey' : '',
	{ factory: () => 'campaigns' },
);
