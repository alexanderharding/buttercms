import { HttpEvent } from '@angular/common/http';
import { Observable, ObservableInput } from 'rxjs';

/**
 * @description A function that handles an error response from a CMS HTTP request. When paired with the responseErrorHandlerInterceptor, it will be invoked within an injection context giving the inject() function access to an Injector.
 * @see requestMarker
 * @see responseErrorHandlerInterceptor
 * @see catchError
 */
export type ResponseErrorHandlerFn = <T = unknown>(
	error: unknown,
	caught: Observable<HttpEvent<unknown>>,
) => ObservableInput<HttpEvent<T>>;
