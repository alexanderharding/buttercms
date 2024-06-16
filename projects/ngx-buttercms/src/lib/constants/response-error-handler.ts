import { InjectionToken, isDevMode } from '@angular/core';
import { ResponseErrorHandlerFn } from '../types';

/**
 * @see {@link ResponseErrorHandlerFn}
 * @see {@link InjectionToken}
 */
export const responseErrorHandler = new InjectionToken<ResponseErrorHandlerFn>(
	isDevMode() ? 'responseErrorHandler' : '',
);
