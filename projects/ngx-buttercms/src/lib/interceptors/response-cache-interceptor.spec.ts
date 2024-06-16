import {
	HttpContext,
	HttpHandlerFn,
	HttpRequest,
	HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Injector, runInInjectionContext } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { autoMocker, chance, observableReader } from '@shared/testing';
import { requestMarker } from '../constants/request-marker';
import { responseCacheInterceptor } from './response-cache-interceptor';
import { responseCache } from '../injection-tokens';
import { provide } from '@shared/dependency-injection-interop';
import { createResponseCacheMock } from '../mock-factories';

describe(responseCacheInterceptor.name, () => {
	it('should call next once with correct value when requestMarker does not exist', fakeAsync(() => {
		// Arrange
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		(requestMock.context as unknown) = httpContextMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			false,
		);

		// Act
		observableReader.readNextSynchronously(
			responseCacheInterceptor(requestMock, nextMock),
		);

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it('should not cache response when requestMarker does not exist', fakeAsync(() => {
		// Arrange
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		(requestMock.context as unknown) = httpContextMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			false,
		);

		// Act
		const response = observableReader.readNextSynchronously(
			responseCacheInterceptor(requestMock, nextMock),
		);

		// Assert
		expect(response).toEqual(responseMock);
	}));

	it('should call next once with correct value when requestMarker does exist', fakeAsync(() => {
		// Arrange
		const cachedResponseMock = createResponseCacheMock();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [provide(responseCache).useValue(cachedResponseMock)],
		});
		(requestMock.context as unknown) = httpContextMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(cachedResponseMock.get, of(responseMock));
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				responseCacheInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it('should set cache when requestMarker does exist and is not currently cached', fakeAsync(() => {
		// Arrange
		const cachedResponseMock = autoMocker.mock(HttpResponse);
		const urlWithParamsMock = chance.url();
		const cacheMock = createResponseCacheMock();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [provide(responseCache).useValue(cacheMock)],
		});
		(requestMock.context as unknown) = httpContextMock;
		(requestMock.urlWithParams as unknown) = urlWithParamsMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(cacheMock.has, false);
		autoMocker.withReturnValue(cacheMock.get, of(cachedResponseMock));
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		const response = observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				responseCacheInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(response).toEqual(cachedResponseMock);
		expect(cacheMock.has).toHaveBeenCalledOnceWith(urlWithParamsMock);
		expect(cacheMock.has).toHaveBeenCalledBefore(cacheMock.get);
		expect(cacheMock.has).toHaveBeenCalledBefore(cacheMock.set);
		expect(cacheMock.set).toHaveBeenCalledBefore(cacheMock.get);
		expect(cacheMock.set).toHaveBeenCalledOnceWith(
			urlWithParamsMock,
			jasmine.any(Observable),
		);
		expect(cacheMock.get).toHaveBeenCalledOnceWith(urlWithParamsMock);
	}));

	it('should not set cache response when requestMarker does exist and is currently cached', fakeAsync(() => {
		// Arrange
		const cachedResponseMock = autoMocker.mock(HttpResponse);
		const urlWithParamsMock = chance.url();
		const cacheMock = createResponseCacheMock();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [provide(responseCache).useValue(cacheMock)],
		});
		(requestMock.context as unknown) = httpContextMock;
		(requestMock.urlWithParams as unknown) = urlWithParamsMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(cacheMock.has, true);
		autoMocker.withReturnValue(cacheMock.get, of(cachedResponseMock));
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		const response = observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				responseCacheInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(response).toEqual(cachedResponseMock);
		expect(cacheMock.has).toHaveBeenCalledOnceWith(urlWithParamsMock);
		expect(cacheMock.has).toHaveBeenCalledBefore(cacheMock.get);
		expect(cacheMock.set).not.toHaveBeenCalledOnceWith(
			urlWithParamsMock,
			jasmine.any(Observable),
		);
		expect(cacheMock.get).toHaveBeenCalledOnceWith(urlWithParamsMock);
	}));
});
