import { InjectionToken, isDevMode } from '@angular/core';

/**
 * @see {@link InjectionToken}
 * @default 3_000
 */
export const responseTimeout = new InjectionToken<number>(
	isDevMode() ? 'responseTimeout' : '',
	{ factory: () => 3_000 },
);
