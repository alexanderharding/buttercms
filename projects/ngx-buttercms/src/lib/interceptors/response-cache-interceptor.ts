import { HttpInterceptorFn } from '@angular/common/http';
import { requestMarker } from '../constants';
import { inject } from '@angular/core';
import { responseCache } from '../injection-tokens';
import { shareReplay } from 'rxjs';

/**
 * @description Caches requests marked with {@link requestMarker} with the provided {@link responseCache}.
 * @see {@linkcode requestMarker}
 * @see {@linkcode responseCache}
 * @see {@linkcode HttpInterceptorFn}
 * @see {@linkcode shareReplay}
 */
export const responseCacheInterceptor: HttpInterceptorFn = (request, next) => {
	const event$ = next(request);
	if (!request.context.has(requestMarker)) return event$;

	const { urlWithParams: key } = request;
	const cache = inject(responseCache);
	if (!cache.has(key)) cache.set(key, event$.pipe(shareReplay(1)));
	return cache.get(key)!;
};
