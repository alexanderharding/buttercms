import { InjectionToken, isDevMode } from '@angular/core';

/**
 * @see {@link InjectionToken}
 */
export const authToken = new InjectionToken<string>(
	isDevMode() ? 'authToken' : '',
);
