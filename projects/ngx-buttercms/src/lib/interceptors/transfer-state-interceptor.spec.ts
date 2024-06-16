import { transferStateInterceptor } from './transfer-state-interceptor';
import {
	HttpContext,
	HttpHandlerFn,
	HttpRequest,
	HttpResponse,
	HttpStatusCode,
} from '@angular/common/http';
import {
	Injector,
	PLATFORM_ID,
	TransferState,
	makeStateKey,
	runInInjectionContext,
} from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { provide } from '@shared/dependency-injection-interop';
import { autoMocker, observableReader } from '@shared/testing';
import { requestMarker } from '../constants/request-marker';
import { PaginatedResponse, Response } from '../types';

describe(transferStateInterceptor.name, () => {
	it(`should call next once with correct value when requestMarker does not exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.hasKey, true);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			false,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it(`should call ${TransferState.prototype.set.name} method on ${TransferState.name} once with correct value when requestMarker does exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false, response is successful, and is on server`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const bodyMock = chance.pickone<Response | PaginatedResponse>([
			{ data: [] },
			{
				data: [],
				meta: {
					count: chance.integer({ min: 0 }),
					next_page: 3,
					previous_page: 1,
				},
			},
		]);
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.hasKey, false);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.set).toHaveBeenCalledOnceWith(
			makeStateKey(requestMock.urlWithParams),
			bodyMock,
		);
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false, response is successful, and is on browser`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'browser';
		const bodyMock = chance.pickone<Response | PaginatedResponse>([
			{ data: [] },
			{
				data: [],
				meta: {
					count: chance.integer({ min: 0 }),
					next_page: 3,
					previous_page: 1,
				},
			},
		]);
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.hasKey, false);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true, response is successful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const bodyMock = chance.pickone<Response | PaginatedResponse>([
			{ data: [] },
			{
				data: [],
				meta: {
					count: chance.integer({ min: 0 }),
					next_page: 3,
					previous_page: 1,
				},
			},
		]);
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.hasKey, true);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true, and response is unsuccessful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const bodyMock = chance.pickone<Response | PaginatedResponse>([
			{ data: [] },
			{
				data: [],
				meta: {
					count: chance.integer({ min: 0 }),
					next_page: 3,
					previous_page: 1,
				},
			},
		]);
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.NotFound,
		});
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.hasKey, true);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does not exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true, and response is successful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const bodyMock = chance.pickone<Response | PaginatedResponse>([
			{ data: [] },
			{
				data: [],
				meta: {
					count: chance.integer({ min: 0 }),
					next_page: 3,
					previous_page: 1,
				},
			},
		]);
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.hasKey, true);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			false,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does not exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true, and response is unsuccessful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const bodyMock = chance.pickone<Response | PaginatedResponse>([
			{ data: [] },
			{
				data: [],
				meta: {
					count: chance.integer({ min: 0 }),
					next_page: 3,
					previous_page: 1,
				},
			},
		]);
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.NotFound,
		});
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.hasKey, true);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			false,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does not exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false, and response is successful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const bodyMock = chance.pickone<Response | PaginatedResponse>([
			{ data: [] },
			{
				data: [],
				meta: {
					count: chance.integer({ min: 0 }),
					next_page: 3,
					previous_page: 1,
				},
			},
		]);
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.hasKey, false);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			false,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does not exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false, and response is unsuccessful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const bodyMock = chance.pickone<Response | PaginatedResponse>([
			{ data: [] },
			{
				data: [],
				meta: {
					count: chance.integer({ min: 0 }),
					next_page: 3,
					previous_page: 1,
				},
			},
		]);
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.NotFound,
		});
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.hasKey, false);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			false,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should emit correct value when requestMarker does not exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const expected = autoMocker.mock(HttpResponse);
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnObservable(nextMock, expected);
		autoMocker.withReturnValue(transferStateMock.hasKey, true);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			false,
		);

		// Act
		const actual = observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(actual).toEqual(expected);
	}));

	it(`should not call ${TransferState.prototype.hasKey.name} method on ${TransferState.name} when requestMarker does not exist`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.hasKey, true);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			false,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.hasKey).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.get.name} method on ${TransferState.name} when requestMarker does not exist`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.get, true);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			false,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.get).not.toHaveBeenCalled();
	}));

	it(`should call ${TransferState.prototype.hasKey.name} method on ${TransferState.name} once with correct value when requestMarker does exist`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.hasKey).toHaveBeenCalledOnceWith(
			makeStateKey(requestMock.urlWithParams),
		);
	}));

	it(`should call ${TransferState.prototype.get.name} method on ${TransferState.name} once with correct value when requestMarker does exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);
		autoMocker.withReturnValue(transferStateMock.hasKey, true);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(transferStateMock.get).toHaveBeenCalledOnceWith(
			makeStateKey(requestMock.urlWithParams),
			void 0,
		);
	}));

	it(`should emit correct value when requestMarker does exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const bodyMock = chance.pickone<Response | PaginatedResponse>([
			{ data: [] },
			{
				data: [],
				meta: {
					count: chance.integer({ min: 0 }),
					next_page: 3,
					previous_page: 1,
				},
			},
		]);
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const expected = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);
		autoMocker.withReturnValue(transferStateMock.hasKey, true);
		autoMocker.withReturnValue(transferStateMock.get, bodyMock);

		// Act
		const actual = observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(actual).toEqual(expected);
	}));

	it(`should call next once with correct value when requestMarker does exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		const responseMock = autoMocker.mock(HttpResponse);
		autoMocker.withReturnObservable(nextMock, responseMock);
		autoMocker.withReturnValue(transferStateMock.hasKey, false);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it(`should emit correct value when requestMarker does exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const expected = autoMocker.mock(HttpResponse);
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnObservable(nextMock, expected);
		autoMocker.withReturnValue(transferStateMock.hasKey, false);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		const actual = observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(actual).toEqual(expected);
	}));

	it(`should not call next when requestMarker does exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true`, fakeAsync(() => {
		// Arrange
		const platformIdMock = chance.string();
		const httpContextMock = autoMocker.mock(HttpContext);
		const requestMock = autoMocker.mock(HttpRequest);
		const transferStateMock = autoMocker.mock(TransferState);
		const nextMock = autoMocker.createSpy<HttpHandlerFn>();
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		(requestMock.context as unknown) = httpContextMock;
		autoMocker.withReturnValue(transferStateMock.hasKey, true);
		autoMocker.withReturnForArguments(
			httpContextMock.has,
			[requestMarker],
			true,
		);

		// Act
		observableReader.readNextSynchronously(
			runInInjectionContext(injector, () =>
				transferStateInterceptor(requestMock, nextMock),
			),
		);

		// Assert
		expect(nextMock).not.toHaveBeenCalled();
	}));
});
