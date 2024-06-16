import { HttpInterceptorFn } from '@angular/common/http';
import { requestMarker } from '../constants/request-marker';
import { catchError, identity } from 'rxjs';
import { Injector, inject, runInInjectionContext } from '@angular/core';
import { responseErrorHandler } from '../constants/response-error-handler';

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
