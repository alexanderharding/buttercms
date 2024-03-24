import { InjectionToken } from '@angular/core';
import { ResponseErrorHandlerFn } from '../models';

/**
 * @public
 */
export const RESPONSE_ERROR_HANDLER =
  new InjectionToken<ResponseErrorHandlerFn>('RESPONSE_ERROR_HANDLER');
