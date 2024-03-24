import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, identity } from 'rxjs';
import { inject } from '@angular/core';
import { REQUEST_MARKER } from '../../../shared';
import { RESPONSE_ERROR_HANDLER } from './response-error-handler';

export const RESPONSE_ERROR_HANDLER_INTERCEPTOR: HttpInterceptorFn = (
  request,
  next
) => {
  return next(request).pipe(
    request.context.has(REQUEST_MARKER)
      ? catchError(inject(RESPONSE_ERROR_HANDLER))
      : identity
  );
};
