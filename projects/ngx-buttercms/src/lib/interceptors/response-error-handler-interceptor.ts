import { HttpInterceptorFn } from '@angular/common/http';
import { requestMarker, responseErrorHandler } from '../constants';
import { catchError, identity } from 'rxjs';
import { Injector, inject, runInInjectionContext } from '@angular/core';

/**
 * @description Catches and handles errors for requests marked with {@link requestMarker} with the provided {@link responseErrorHandler} from within an injection context.
 * @see {@link requestMarker}
 * @see {@link responseErrorHandler}
 * @see {@link HttpInterceptorFn}
 * @see {@link catchError}
 */
export const responseErrorHandlerInterceptor: HttpInterceptorFn = (
	request,
	next,
) => {
	const injector = inject(Injector);
	const handler = inject(responseErrorHandler);
	return next(request).pipe(
		request.context.has(requestMarker)
			? catchError((...params) =>
					runInInjectionContext(injector, () => handler(...params)),
				)
			: identity,
	);
};
