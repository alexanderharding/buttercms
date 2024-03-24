import { fakeAsync } from '@angular/core/testing';
import { REQUEST_HYDRATION_INTERCEPTOR } from './request-hydration-interceptor';
import {
  HttpContext,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { of } from 'rxjs';
import { Injector, runInInjectionContext } from '@angular/core';
import {
  AUTH_TOKEN,
  BASE_URL,
  PREVIEW,
  Preview,
  REQUEST_MARKER,
} from '../../../shared';

describe(REQUEST_HYDRATION_INTERCEPTOR.name, () => {
  it('should skip formatting when REQUEST_MARKER does not exist', fakeAsync(() => {
    // Arrange
    const httpContextMock = jasmine.createSpyObj<HttpContext>(
      HttpContext.name,
      ['has']
    );
    const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
      HttpRequest.name,
      ['clone'],
      { context: httpContextMock }
    );
    const expected = of(new HttpResponse());
    const nextMock = jasmine
      .createSpy<HttpHandlerFn>()
      .and.returnValue(expected);
    httpContextMock.has.withArgs(REQUEST_MARKER).and.returnValue(false);

    // Act
    const actual = REQUEST_HYDRATION_INTERCEPTOR(requestMock, nextMock);

    // Assert
    expect(actual).toEqual(expected);
    expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
    expect(requestMock.clone).not.toHaveBeenCalled();
  }));

  it('should format request when REQUEST_MARKER exists', fakeAsync(() => {
    // Arrange
    const authTokenMock = 'authTokenMock';
    const baseUrlMock = 'baseUrlMock';
    const previewMock = Preview.Off;
    const injector = Injector.create({
      providers: [
        { provide: AUTH_TOKEN, useValue: authTokenMock },
        { provide: BASE_URL, useValue: baseUrlMock },
        { provide: PREVIEW, useValue: previewMock },
      ],
    });
    const httpContextMock = jasmine.createSpyObj<HttpContext>(
      HttpContext.name,
      ['has']
    );
    const clonedRequestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
      HttpRequest.name,
      ['clone']
    );
    const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
      HttpRequest.name,
      { clone: clonedRequestMock },
      { context: httpContextMock, url: 'urlMock' }
    );
    const expected = of(new HttpResponse());
    const nextMock = jasmine
      .createSpy<HttpHandlerFn>()
      .and.returnValue(expected);
    requestMock.clone;
    httpContextMock.has.withArgs(REQUEST_MARKER).and.returnValue(true);

    // Act
    const actual = runInInjectionContext(injector, () =>
      REQUEST_HYDRATION_INTERCEPTOR(requestMock, nextMock)
    );

    // Assert
    expect(actual).toEqual(expected);
    expect(nextMock).toHaveBeenCalledOnceWith(clonedRequestMock);
    expect(requestMock.clone).toHaveBeenCalledOnceWith({
      url: `${baseUrlMock}${requestMock.url}`,
      setParams: { preview: previewMock.toString(), auth_token: authTokenMock },
    });
  }));
});
