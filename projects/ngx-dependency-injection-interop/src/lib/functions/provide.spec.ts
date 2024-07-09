import { InjectionToken } from '@angular/core';
import { provide } from './provide';
import { fakeAsync } from '@angular/core/testing';

describe(provide.name, () => {
	it('should return correct value when no options are passed in', fakeAsync(() => {
		// Arrange
		class TypeMock {
			readonly value = 'test';
		}
		const tokenMock = new InjectionToken<TypeMock>('');
		const existingMock = new InjectionToken<TypeMock>('');
		const valueMock = new TypeMock();
		const factoryMock = () => new TypeMock();

		// Act
		const providerChoice = provide(tokenMock);

		// Assert
		expect(providerChoice.useClass(TypeMock)).toEqual({
			provide: tokenMock,
			useClass: TypeMock,
			multi: false,
		});
		expect(providerChoice.useValue(valueMock)).toEqual({
			provide: tokenMock,
			useValue: valueMock,
			multi: false,
		});
		expect(providerChoice.useExisting(existingMock)).toEqual({
			provide: tokenMock,
			useExisting: existingMock,
			multi: false,
		});
		expect(providerChoice.useFactory(factoryMock)).toEqual({
			provide: tokenMock,
			useFactory: factoryMock,
			multi: false,
		});
	}));

	it('should return correct value when options are passed in with multi as false', fakeAsync(() => {
		// Arrange
		class TypeMock {
			readonly value = 'test';
		}
		const tokenMock = new InjectionToken<TypeMock>('');
		const existingMock = new InjectionToken<TypeMock>('');
		const valueMock = new TypeMock();
		const factoryMock = () => new TypeMock();

		// Act
		const providerChoice = provide(tokenMock, { multi: false });

		// Assert
		expect(providerChoice.useClass(TypeMock)).toEqual({
			provide: tokenMock,
			useClass: TypeMock,
			multi: false,
		});
		expect(providerChoice.useValue(valueMock)).toEqual({
			provide: tokenMock,
			useValue: valueMock,
			multi: false,
		});
		expect(providerChoice.useExisting(existingMock)).toEqual({
			provide: tokenMock,
			useExisting: existingMock,
			multi: false,
		});
		expect(providerChoice.useFactory(factoryMock)).toEqual({
			provide: tokenMock,
			useFactory: factoryMock,
			multi: false,
		});
	}));

	it('should return correct value when options are passed in with multi as true', fakeAsync(() => {
		// Arrange
		class TypeMock {
			readonly value = 'test';
		}
		const tokenMock = new InjectionToken<TypeMock>('');
		const existingMock = new InjectionToken<TypeMock>('');
		const valueMock = new TypeMock();
		const factoryMock = () => new TypeMock();

		// Act
		const providerChoice = provide(tokenMock, { multi: true });

		// Assert
		expect(providerChoice.useClass(TypeMock)).toEqual({
			provide: tokenMock,
			useClass: TypeMock,
			multi: true,
		});
		expect(providerChoice.useValue(valueMock)).toEqual({
			provide: tokenMock,
			useValue: valueMock,
			multi: true,
		});
		expect(providerChoice.useExisting(existingMock)).toEqual({
			provide: tokenMock,
			useExisting: existingMock,
			multi: true,
		});
		expect(providerChoice.useFactory(factoryMock)).toEqual({
			provide: tokenMock,
			useFactory: factoryMock,
			multi: true,
		});
	}));
});
