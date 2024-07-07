import { InjectionToken, isDevMode } from '@angular/core';
import { ResponseTimeoutConfig } from '../types';

/**
 * @see {@link ResponseTimeoutConfig}
 * @see {@link InjectionToken}
 * @default { each: 3_000 }
 */
export const responseTimeoutConfig = new InjectionToken<ResponseTimeoutConfig>(
	isDevMode() ? 'responseTimeoutConfig' : '',
	{ factory: () => ({ each: 3_000 }) },
);
