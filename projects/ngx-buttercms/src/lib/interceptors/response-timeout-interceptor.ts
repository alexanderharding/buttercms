import { HttpInterceptorFn } from '@angular/common/http';
import { identity, timeout } from 'rxjs';
import { inject } from '@angular/core';
import { requestMarker } from '../constants/request-marker';
import { responseTimeoutConfig } from '../injection-tokens';

/**
 * @description Applies a timeout to requests marked with {@link requestMarker} with the provided {@link responseTimeout}.
 * @see {@link requestMarker}
 * @see {@link responseTimeout}
 * @see {@link HttpInterceptorFn}
 * @see {@link timeout}
 */
export const responseTimeoutInterceptor: HttpInterceptorFn = (
	request,
	next,
) => {
	return next(request).pipe(
		request.context.has(requestMarker)
			? timeout({ ...inject(responseTimeoutConfig), meta: request })
			: identity,
	);
};
