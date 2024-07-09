import { fakeAsync } from '@angular/core/testing';
import { assertInjectInInjectionContext } from './assert-inject-in-injection-context';
import { InjectionToken, Injector, runInInjectionContext } from '@angular/core';
import { provide } from './provide';
import { noop } from 'rxjs';

describe(assertInjectInInjectionContext.name, () => {
	it('should return correct value when in an injection context and no options are provided', fakeAsync(() => {
		// Arrange
		const tokenMock = new InjectionToken<number>('tokenMock');
		const expected = 123456;
		const injectorMock = Injector.create({
			providers: [provide(tokenMock).useValue(expected)],
		});

		// Act
		const actual = runInInjectionContext(injectorMock, () =>
			assertInjectInInjectionContext(noop, tokenMock),
		);

		// Assert
		expect(actual).toBe(expected);
	}));

	it('should allow InjectOptions', fakeAsync(() => {
		// Arrange
		const tokenMock = new InjectionToken<number>('tokenMock');
		const injectorMock = Injector.create({ providers: [] });

		// Act
		const actual = runInInjectionContext(injectorMock, () =>
			assertInjectInInjectionContext(noop, tokenMock, { optional: true }),
		);

		// Assert
		expect(actual).toBeNull();
	}));

	it('should throw an error including correct value when no arguments are passed outside of an injection context', fakeAsync(() => {
		// Arrange
		const tokenMock = new InjectionToken<number>('tokenMock');
		const debugFn: () => number = () =>
			assertInjectInInjectionContext(debugFn, tokenMock);

		// Act	// Assert
		expect(debugFn).toThrowError(new RegExp(debugFn.name));
	}));
});
