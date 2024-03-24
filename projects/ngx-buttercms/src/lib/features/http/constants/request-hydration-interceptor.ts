import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AUTH_TOKEN, BASE_URL, PREVIEW, REQUEST_MARKER } from '../../../shared';

/**
 * @public
 */
export const REQUEST_HYDRATION_INTERCEPTOR: HttpInterceptorFn = (
  request,
  next
) => {
  request.context.has(REQUEST_MARKER) && (request = hydrate(request));
  return next(request);
};

function hydrate(request: HttpRequest<unknown>): HttpRequest<unknown> {
  return request.clone({
    url: `${inject(BASE_URL)}${request.url}`,
    setParams: {
      preview: inject(PREVIEW).toString(),
      auth_token: inject(AUTH_TOKEN),
    },
  });
}
