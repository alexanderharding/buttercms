import { InjectionToken, isDevMode } from '@angular/core';
import { ResponseCache } from '../types';

/**
 * @see {@linkcode ResponseCache}
 * @see {@linkcode InjectionToken}
 * @default new Map()
 */
export const responseCache = new InjectionToken<ResponseCache>(
	isDevMode() ? 'responseCache' : '',
	{ factory: () => new Map() },
);
