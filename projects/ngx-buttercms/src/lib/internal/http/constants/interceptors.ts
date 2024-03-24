import { HttpInterceptorFn } from '@angular/common/http';
import { RESPONSE_ERROR_HANDLER_INTERCEPTOR } from './response-error-handler-interceptor';
import { REQUEST_HYDRATION_INTERCEPTOR } from './request-hydration-interceptor';

export const INTERCEPTORS: ReadonlyArray<HttpInterceptorFn> = [
  RESPONSE_ERROR_HANDLER_INTERCEPTOR,
  REQUEST_HYDRATION_INTERCEPTOR,
];
