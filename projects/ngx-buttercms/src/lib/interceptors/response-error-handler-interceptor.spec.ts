import {
	HttpContext,
	HttpEvent,
	HttpHandlerFn,
	HttpRequest,
	HttpResponse,
} from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import {
	Injector,
	assertInInjectionContext,
	runInInjectionContext,
} from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { responseErrorHandlerInterceptor } from './response-error-handler-interceptor';
import { responseErrorHandler } from '../constants/response-error-handler';
import { autoMocker, observableReader } from '@shared/testing';
import { provide } from '@shared/dependency-injection-interop';
import { ResponseErrorHandlerFn } from '../types';
import { requestMarker } from '../constants/request-marker';

describe(responseErrorHandlerInterceptor.name, () => {
	it('should call next once with correct value when requestMarker does not exist', fakeAsync(() => {
		// Arrange
		const errorHandlerMock = autoMocker.createSpy<ResponseErrorHandlerFn>();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injectorMock = autoMocker.mock(Injector);
		const injector = Injector.create({
			providers: [
				provide(responseErrorHandler).useValue(errorHandlerMock),
				provide(Injector).useValue(injectorMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			false,
		);

		// Act
		runInInjectionContext(injector, () =>
			observableReader.readNextSynchronously(
				responseErrorHandlerInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it('should call next once with correct value when requestMarker exists', fakeAsync(() => {
		// Arrange
		const errorHandlerMock = autoMocker.createSpy<ResponseErrorHandlerFn>();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const injectorMock = autoMocker.mock(Injector);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		(requestMock.context as unknown) = httpContextMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		const injector = Injector.create({
			providers: [
				provide(responseErrorHandler).useValue(errorHandlerMock),
				provide(Injector).useValue(injectorMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		runInInjectionContext(injector, () =>
			responseErrorHandlerInterceptor(requestMock, nextMock),
		);

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it('should apply error handler in injection context when requestMarker exists', fakeAsync(() => {
		// Arrange
		const errorHandlerMock = autoMocker.createSpy<ResponseErrorHandlerFn>();
		const errorMock = new Error(chance.string());
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const injectorMock = autoMocker.mock(Injector);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(responseErrorHandler).useValue(errorHandlerMock),
				provide(Injector).useValue(injectorMock),
			],
		});
		autoMocker.withCallFake(errorHandlerMock, () => {
			assertInInjectionContext(errorHandlerMock);
			return EMPTY;
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnThrowObservable(nextMock, errorMock);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		const actual = observableReader.readCompleteSynchronously(
			runInInjectionContext(injector, () =>
				responseErrorHandlerInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(actual).toBeTrue();
		expect(errorHandlerMock).toHaveBeenCalledOnceWith(
			errorMock,
			jasmine.any(Observable),
		);
	}));

	it('should not apply error handler when requestMarker does not exist', fakeAsync(() => {
		// Arrange
		const errorMock = new Error(chance.string());
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
			.createSpy<HttpHandlerFn>()
			.and.returnValue(throwError(() => errorMock));
		const injectorMock = jasmine.createSpyObj<Injector>(Injector.name, ['get']);
		const injector = Injector.create({
			providers: [
				provide<jasmine.Spy<ResponseErrorHandlerFn>>(
					responseErrorHandler,
				).useValue(errorHandlerMock),
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
