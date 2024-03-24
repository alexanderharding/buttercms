import { InjectionToken } from '@angular/core';
import { DEFAULT_PREVIEW } from './default-preview';
import { Preview } from '../models';

/**
 * @public
 */
export const PREVIEW = new InjectionToken<Preview>('PREVIEW', {
  factory: () => DEFAULT_PREVIEW,
});
