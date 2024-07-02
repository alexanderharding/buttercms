import {
	HttpContext,
	HttpEvent,
	HttpHandlerFn,
	HttpRequest,
} from '@angular/common/http';
import { NEVER, Observable, TimeoutError } from 'rxjs';
import { Injector, runInInjectionContext } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { responseTimeout } from '../injection-tokens';
import { responseTimeoutInterceptor } from './response-timeout-interceptor';

describe(responseTimeoutInterceptor.name, () => {
	it('should call next once with correct value when requestMarker does not exist', fakeAsync(() => {
		// Arrange
		const eventMock$ = jasmine.createSpyObj<Observable<HttpEvent<unknown>>>(
			'HttpEvent',
			['pipe'],
		);
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			[],
			{ context: httpContextMock },
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(eventMock$);

		// Act
		responseTimeoutInterceptor(requestMock, nextMock);

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it('should call next once with correct value when requestMarker exists', fakeAsync(() => {
		// Arrange
		const eventMock$ = jasmine.createSpyObj<Observable<HttpEvent<unknown>>>(
			'HttpEvent',
			['pipe'],
		);
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			[],
			{ context: httpContextMock },
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(eventMock$);
		const injector = Injector.create({
			providers: [{ provide: responseTimeout, useValue: 12345 }],
		});

		// Act
		runInInjectionContext(injector, () =>
			responseTimeoutInterceptor(requestMock, nextMock),
		);

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it('should apply timeout when requestMarker exists', fakeAsync(() => {
		// Arrange
		const timeoutMock = 3_000;
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			[],
			{ context: httpContextMock },
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(NEVER);
		const injector = Injector.create({
			providers: [{ provide: responseTimeout, useValue: timeoutMock }],
		});

		// Act
		let error: unknown;
		const subscription = runInInjectionContext(injector, () =>
			responseTimeoutInterceptor(requestMock, nextMock),
		).subscribe({ error: (e: unknown) => (error = e) });
		tick(timeoutMock);
		subscription.unsubscribe();

		// Assert
		expect(error).toEqual(jasmine.any(TimeoutError));
	}));

	it('should not apply timeout when requestMarker does not exist', fakeAsync(() => {
		// Arrange
		const timeoutMock = 3_000;
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			[],
			{ context: httpContextMock },
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(NEVER);
		const injector = Injector.create({
			providers: [{ provide: responseTimeout, useValue: timeoutMock }],
		});

		// Act
		let didEmit = false;
		const subscription = runInInjectionContext(injector, () =>
			responseTimeoutInterceptor(requestMock, nextMock),
		).subscribe(() => (didEmit = true));
		tick(timeoutMock);
		subscription.unsubscribe();

		// Assert
		expect(didEmit).toBeFalse();
	}));
});
