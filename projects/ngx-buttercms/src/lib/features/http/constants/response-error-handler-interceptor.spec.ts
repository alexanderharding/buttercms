import { HttpContext, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { EMPTY, NEVER, noop, throwError } from 'rxjs';
import { Injector, runInInjectionContext } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { RESPONSE_ERROR_HANDLER_INTERCEPTOR } from './response-error-handler-interceptor';
import { RESPONSE_ERROR_HANDLER } from './response-error-handler';
import { ResponseErrorHandlerFn } from '../models';
import { REQUEST_MARKER } from '../../../shared';

describe(RESPONSE_ERROR_HANDLER_INTERCEPTOR.name, () => {
  it('should call next once with correct value when REQUEST_MARKER does not exist', fakeAsync(() => {
    // Arrange
    const httpContextMock = jasmine.createSpyObj<HttpContext>(
      HttpContext.name,
      ['has']
    );
    const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
      HttpRequest.name,
      [],
      { context: httpContextMock }
    );
    const nextMock = jasmine.createSpy<HttpHandlerFn>().and.returnValue(NEVER);
    httpContextMock.has.withArgs(REQUEST_MARKER).and.returnValue(false);

    // Act
    RESPONSE_ERROR_HANDLER_INTERCEPTOR(requestMock, nextMock)
      .subscribe()
      .unsubscribe();

    // Assert
    expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
  }));

  it('should call next once with correct value when REQUEST_MARKER exists', fakeAsync(() => {
    // Arrange
    const httpContextMock = jasmine.createSpyObj<HttpContext>(
      HttpContext.name,
      ['has']
    );
    const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
      HttpRequest.name,
      [],
      { context: httpContextMock }
    );
    const nextMock = jasmine.createSpy<HttpHandlerFn>().and.returnValue(NEVER);
    const injector = Injector.create({
      providers: [{ provide: RESPONSE_ERROR_HANDLER, useValue: noop }],
    });
    httpContextMock.has.withArgs(REQUEST_MARKER).and.returnValue(true);

    // Act
    runInInjectionContext(injector, () =>
      RESPONSE_ERROR_HANDLER_INTERCEPTOR(requestMock, nextMock)
    );

    // Assert
    expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
  }));

  it('should apply error handler when REQUEST_MARKER exists', fakeAsync(() => {
    // Arrange
    const errorHandlerMock = jasmine
      .createSpy<ResponseErrorHandlerFn>()
      .and.returnValue(EMPTY);
    const httpContextMock = jasmine.createSpyObj<HttpContext>(
      HttpContext.name,
      ['has']
    );
    const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
      HttpRequest.name,
      [],
      { context: httpContextMock }
    );
    const nextMock = jasmine
      .createSpy<HttpHandlerFn>()
      .and.returnValue(throwError(() => new Error()));
    const injector = Injector.create({
      providers: [
        { provide: RESPONSE_ERROR_HANDLER, useValue: errorHandlerMock },
      ],
    });
    httpContextMock.has.withArgs(REQUEST_MARKER).and.returnValue(true);

    // Act
    let actual = false;
    const subscription = runInInjectionContext(injector, () =>
      RESPONSE_ERROR_HANDLER_INTERCEPTOR(requestMock, nextMock)
    ).subscribe({ complete: () => (actual = true) });

    // Assert
    expect(actual).toBeTrue();
    expect(errorHandlerMock).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
  }));

  it('should not apply error handler when REQUEST_MARKER does not exist', fakeAsync(() => {
    // Arrange
    const expected = new Error();
    const errorHandlerMock = jasmine
      .createSpy<ResponseErrorHandlerFn>()
      .and.returnValue(EMPTY);
    const httpContextMock = jasmine.createSpyObj<HttpContext>(
      HttpContext.name,
      ['has']
    );
    const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
      HttpRequest.name,
      [],
      { context: httpContextMock }
    );
    const nextMock = jasmine
      .createSpy<HttpHandlerFn>()
      .and.returnValue(throwError(() => expected));
    const injector = Injector.create({
      providers: [
        { provide: RESPONSE_ERROR_HANDLER, useValue: errorHandlerMock },
      ],
    });
    httpContextMock.has.withArgs(REQUEST_MARKER).and.returnValue(false);

    // Act
    let actual: Error;
    runInInjectionContext(injector, () =>
      RESPONSE_ERROR_HANDLER_INTERCEPTOR(requestMock, nextMock)
    )
      .subscribe({ error: (error) => (actual = error) })
      .unsubscribe();

    // Assert
    expect(actual!).toEqual(expected);
    expect(errorHandlerMock).not.toHaveBeenCalled();
  }));
});
