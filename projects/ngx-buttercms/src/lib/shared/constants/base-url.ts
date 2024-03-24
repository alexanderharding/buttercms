import { InjectionToken } from '@angular/core';
import { DEFAULT_BASE_URL } from './default-base-url';

export const BASE_URL = new InjectionToken<string>('BASE_URL', {
  factory: () => DEFAULT_BASE_URL,
});
