import {
	HttpInterceptorFn,
	HttpResponse,
	HttpStatusCode,
} from '@angular/common/http';
import { requestMarker } from '../constants';
import {
	PLATFORM_ID,
	TransferState,
	inject,
	makeStateKey,
} from '@angular/core';
import { of, tap, identity } from 'rxjs';
import { isPlatformServer } from '@angular/common';

/**
 * @description Transfers the state of successful response bodies for requests marked with {@link requestMarker} from the server to the client.
 * @see {@link requestMarker}
 * @see {@link TransferState}
 * @see {@link HttpInterceptorFn}
 */
export const transferStateInterceptor: HttpInterceptorFn = (request, next) => {
	const { context, urlWithParams } = request;
	const hasRequestMarker = context.has(requestMarker);
	const transferState = inject(TransferState);
	const key = makeStateKey<unknown>(urlWithParams);
	if (hasRequestMarker && transferState.hasKey(key)) {
		const body = transferState.get(key, void 0);
		return of(new HttpResponse({ body, status: HttpStatusCode.Ok }));
	}
	const isServer = isPlatformServer(inject(PLATFORM_ID));
	return next(request).pipe(
		hasRequestMarker
			? tap(
					(event) =>
						event instanceof HttpResponse &&
						event.ok &&
						isServer &&
						transferState.set(key, event.body),
				)
			: identity,
	);
};
