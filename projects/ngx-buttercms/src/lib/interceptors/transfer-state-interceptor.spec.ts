import { transferStateInterceptor } from './transfer-state-interceptor';
import {
	HttpContext,
	HttpEvent,
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
import { PaginatedResponse } from '../types';
import { of } from 'rxjs';
import { provide } from 'ngx-dependency-injection-interop';

describe(transferStateInterceptor.name, () => {
	it(`should call next once with correct value when requestMarker does not exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(true);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it(`should call ${TransferState.prototype.set.name} method on ${TransferState.name} once with correct value when requestMarker does exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false, response is successful, and is on server`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const bodyMock: PaginatedResponse = {
			data: {},
			meta: { count: 20, next_page: 3, previous_page: 1 },
		};
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(false);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.set).toHaveBeenCalledOnceWith(
			makeStateKey(requestMock.urlWithParams),
			bodyMock,
		);
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false, response is successful, and is on browser`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'browser';
		const bodyMock: PaginatedResponse = {
			data: {},
			meta: { count: 20, next_page: 3, previous_page: 1 },
		};
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(false);
		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true, response is successful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const bodyMock: PaginatedResponse = {
			data: {},
			meta: { count: 20, next_page: 3, previous_page: 1 },
		};
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(true);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true, and response is unsuccessful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const bodyMock: PaginatedResponse = {
			data: {},
			meta: { count: 20, next_page: 3, previous_page: 1 },
		};
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.NotFound,
		});
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(true);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does not exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true, and response is successful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const bodyMock: PaginatedResponse = {
			data: {},
			meta: { count: 20, next_page: 3, previous_page: 1 },
		};
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(true);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does not exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true, and response is unsuccessful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const bodyMock: PaginatedResponse = {
			data: {},
			meta: { count: 20, next_page: 3, previous_page: 1 },
		};
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.NotFound,
		});
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(true);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does not exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false, and response is successful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const bodyMock: PaginatedResponse = {
			data: {},
			meta: { count: 20, next_page: 3, previous_page: 1 },
		};
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(false);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.set.name} method on ${TransferState.name} when requestMarker does not exist, ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false, and response is unsuccessful`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const bodyMock: PaginatedResponse = {
			data: {},
			meta: { count: 20, next_page: 3, previous_page: 1 },
		};
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.NotFound,
		});
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(false);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.set).not.toHaveBeenCalled();
	}));

	it(`should emit correct value when requestMarker does not exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const responseMock = new HttpResponse({
			body: {},
			status: HttpStatusCode.NotFound,
		});
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(true);

		// Act
		let response: HttpEvent<unknown> | undefined;
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe((value) => (response = value))
			.unsubscribe();

		// Assert
		expect(response).toEqual(responseMock);
	}));

	it(`should not call ${TransferState.prototype.hasKey.name} method on ${TransferState.name} when requestMarker does not exist`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(true);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.hasKey).not.toHaveBeenCalled();
	}));

	it(`should not call ${TransferState.prototype.get.name} method on ${TransferState.name} when requestMarker does not exist`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.get.and.returnValue(true);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.get).not.toHaveBeenCalled();
	}));

	it(`should call ${TransferState.prototype.hasKey.name} method on ${TransferState.name} once with correct value when requestMarker does exist`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.hasKey).toHaveBeenCalledOnceWith(
			makeStateKey(requestMock.urlWithParams),
		);
	}));

	it(`should call ${TransferState.prototype.get.name} method on ${TransferState.name} once with correct value when requestMarker does exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(true);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(transferStateMock.get).toHaveBeenCalledOnceWith(
			makeStateKey(requestMock.urlWithParams),
			void 0,
		);
	}));

	it(`should emit correct value when requestMarker does exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const bodyMock: PaginatedResponse = {
			data: {},
			meta: { count: 20, next_page: 3, previous_page: 1 },
		};
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const responseMock = new HttpResponse({
			body: bodyMock,
			status: HttpStatusCode.Ok,
		});
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));

		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(true);
		transferStateMock.get.and.returnValue(bodyMock);

		// Act
		let event: HttpEvent<unknown> | undefined;
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe((value) => (event = value))
			.unsubscribe();

		// Assert
		expect(event).toEqual(responseMock);
	}));

	it(`should call next once with correct value when requestMarker does exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(false);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it(`should emit correct value when requestMarker does exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns false`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const responseMock = new HttpResponse({
			body: {},
			status: HttpStatusCode.NotFound,
		});
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(false);

		// Act
		let event: HttpEvent<unknown> | undefined;
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe((value) => (event = value))
			.unsubscribe();

		// Assert
		expect(event).toEqual(responseMock);
	}));

	it(`should not call next when requestMarker does exist and ${TransferState.prototype.hasKey.name} method on ${TransferState.name} returns true`, fakeAsync(() => {
		// Arrange
		const platformIdMock = 'server';
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			['clone'],
			{ context: httpContextMock },
		);
		const transferStateMock = jasmine.createSpyObj<TransferState>(
			TransferState.name,
			['hasKey', 'get', 'set'],
		);
		const nextMock = jasmine.createSpy<HttpHandlerFn>('HttpHandlerFn');
		const injector = Injector.create({
			providers: [
				provide(TransferState).useValue(transferStateMock),
				provide(PLATFORM_ID).useValue(platformIdMock),
			],
		});
		transferStateMock.hasKey.and.returnValue(true);

		// Act
		runInInjectionContext(injector, () =>
			transferStateInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(nextMock).not.toHaveBeenCalled();
	}));
});
