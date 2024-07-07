import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { baseUrl, preview, authToken } from '../injection-tokens';
import { requestMarker } from '../constants';

/**
 * @description Hydrates requests marked with {@link requestMarker} with the provided {@link baseUrl}, {@link preview}, and {@link authToken}.
 * @see {@link requestMarker}
 * @see {@link baseUrl}
 * @see {@link preview}
 * @see {@link authToken}
 * @see {@link HttpInterceptorFn}
 */
export const requestHydrationInterceptor: HttpInterceptorFn = (
	request,
	next,
) => {
	if (request.context.has(requestMarker)) request = hydrate(request);
	return next(request);
};

function hydrate(request: HttpRequest<unknown>): HttpRequest<unknown> {
	return request.clone({
		url: `${inject(baseUrl)}${request.url}`,
		setParams: {
			preview: inject(preview).toString(),
			auth_token: inject(authToken),
		},
	});
}
