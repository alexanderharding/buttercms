import {
	HttpContext,
	HttpHandlerFn,
	HttpRequest,
	HttpResponse,
} from '@angular/common/http';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import {
	Injector,
	assertInInjectionContext,
	runInInjectionContext,
} from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { responseErrorHandlerInterceptor } from './response-error-handler-interceptor';
import { responseErrorHandler } from '../constants';
import { ResponseErrorHandlerFn } from '../types';
import { provide } from 'ngx-dependency-injection-interop';

describe(responseErrorHandlerInterceptor.name, () => {
	it('should call next once with correct value when requestMarker does not exist', fakeAsync(() => {
		// Arrange
		const errorHandlerMock = jasmine.createSpy<ResponseErrorHandlerFn>(
			'ResponseErrorHandlerFn',
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
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injectorMock = jasmine.createSpyObj<Injector>(Injector.name, ['get']);
		const injector = Injector.create({
			providers: [
				provide(responseErrorHandler).useValue(errorHandlerMock),
				provide(Injector).useValue(injectorMock),
			],
		});

		// Act
		runInInjectionContext(injector, () =>
			responseErrorHandlerInterceptor(requestMock, nextMock),
		);

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it('should call next once with correct value when requestMarker exists', fakeAsync(() => {
		// Arrange
		const errorHandlerMock = jasmine.createSpy<ResponseErrorHandlerFn>(
			'ResponseErrorHandlerFn',
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
		const injectorMock = jasmine.createSpyObj<Injector>(Injector.name, ['get']);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(responseErrorHandler).useValue(errorHandlerMock),
				provide(Injector).useValue(injectorMock),
			],
		});

		// Act
		runInInjectionContext(injector, () =>
			responseErrorHandlerInterceptor(requestMock, nextMock),
		);

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it('should apply error handler in injection context when requestMarker exists', fakeAsync(() => {
		// Arrange
		const errorHandlerMock = jasmine
			.createSpy<ResponseErrorHandlerFn>('ResponseErrorHandlerFn')
			.and.callFake(() => {
				assertInInjectionContext(errorHandlerMock);
				return EMPTY;
			});
		const errorMock = new Error('error');
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			[],
			{ context: httpContextMock },
		);
		const injectorMock = jasmine.createSpyObj<Injector>(Injector.name, ['get']);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(throwError(() => errorMock));
		const injector = Injector.create({
			providers: [
				provide(responseErrorHandler).useValue(errorHandlerMock),
				provide(Injector).useValue(injectorMock),
			],
		});

		// Act
		let isComplete = false;
		const subscription = runInInjectionContext(injector, () =>
			responseErrorHandlerInterceptor(requestMock, nextMock),
		).subscribe({ complete: () => (isComplete = true) });

		// Assert
		expect(isComplete).toBeTrue();
		expect(errorHandlerMock).toHaveBeenCalledOnceWith(
			errorMock,
			jasmine.any(Observable),
		);
		subscription.unsubscribe();
	}));

	it('should not apply error handler when requestMarker does not exist', fakeAsync(() => {
		// Arrange
		const errorMock = new Error('error');
		const errorHandlerMock = jasmine
			.createSpy<ResponseErrorHandlerFn>()
			.and.returnValue(EMPTY);
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
			.and.returnValue(throwError(() => errorMock));
		const injectorMock = jasmine.createSpyObj<Injector>(Injector.name, ['get']);
		const injector = Injector.create({
			providers: [
				provide(responseErrorHandler).useValue(errorHandlerMock),
				provide(Injector).useValue(injectorMock),
			],
		});

		// Act
		let error: unknown;
		runInInjectionContext(injector, () =>
			responseErrorHandlerInterceptor(requestMock, nextMock),
		)
			.subscribe({ error: (e: unknown) => (error = e) })
			.unsubscribe();

		// Assert
		expect(error).toEqual(errorMock);
		expect(errorHandlerMock).not.toHaveBeenCalled();
	}));
});
