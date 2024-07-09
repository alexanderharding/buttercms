import { fakeAsync } from '@angular/core/testing';
import {
	HttpContext,
	HttpEvent,
	HttpHandlerFn,
	HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injector, runInInjectionContext } from '@angular/core';
import { Preview } from '../enums';
import { authToken, baseUrl, preview } from '../injection-tokens';
import { requestHydrationInterceptor } from './request-hydration-interceptor';
import { provide } from 'ngx-dependency-injection-interop';

describe(requestHydrationInterceptor.name, () => {
	it('should skip formatting when requestMarker does not exist', fakeAsync(() => {
		// Arrange
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const eventMock$ = jasmine.createSpyObj<Observable<HttpEvent<unknown>>>(
			'HttpEvent',
			['subscribe'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(eventMock$);

		// Act
		const event$ = requestHydrationInterceptor(requestMock, nextMock);

		// Assert
		expect(event$).toEqual(eventMock$);
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
		expect(requestMock.clone).not.toHaveBeenCalled();
	}));

	it('should format request when requestMarker exists', fakeAsync(() => {
		// Arrange
		const authTokenMock = 'lknasvjiehjaska565asckasl;545';
		const baseUrlMock = 'https://www.example.com';
		const previewMock = Preview.on;
		const injector = Injector.create({
			providers: [
				provide(authToken).useValue(authTokenMock),
				provide(baseUrl).useValue(baseUrlMock),
				provide(preview).useValue(previewMock),
			],
		});
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const clonedRequestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			{ clone: clonedRequestMock },
			{ url: 'https://www.example.com', context: httpContextMock },
		);
		const eventMock$ = jasmine.createSpyObj<Observable<HttpEvent<unknown>>>(
			'HttpEvent',
			['subscribe'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(eventMock$);

		// Act
		const event$ = runInInjectionContext(injector, () =>
			requestHydrationInterceptor(requestMock, nextMock),
		);

		// Assert
		expect(event$).toEqual(eventMock$);
		expect(nextMock).toHaveBeenCalledOnceWith(clonedRequestMock);
		expect(requestMock.clone).toHaveBeenCalledOnceWith({
			url: `${baseUrlMock}${requestMock.url}`,
			setParams: { preview: previewMock.toString(), auth_token: authTokenMock },
		});
	}));
});
