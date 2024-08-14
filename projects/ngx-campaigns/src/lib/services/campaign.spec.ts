import { fakeAsync } from '@angular/core/testing';
import { CampaignService } from './campaign';
import { provide } from 'ngx-dependency-injection-interop';
import { storageKey } from '../injection-tokens';
import { Injector, runInInjectionContext } from '@angular/core';
import { skip, from, InteropObservable, take } from 'rxjs';

describe('CampaignService', () => {
	let localStorageMock: jasmine.SpyObj<Storage>;
	let storageKeyMock: string;
	let localStorageGetterSpy: jasmine.Spy<() => Storage>;
	let injector: Injector;

	beforeEach(() => {
		storageKeyMock = 'test';
		localStorageMock = jasmine.createSpyObj<Storage>('localStorage', [
			'getItem',
			'setItem',
		]);
		localStorageGetterSpy = spyOnProperty(
			globalThis,
			'localStorage',
		).and.returnValue(localStorageMock);
		injector = Injector.create({
			providers: [provide(storageKey).useValue(storageKeyMock)],
		});
	});

	afterEach(() => {
		localStorageGetterSpy.and.callThrough();
		globalThis.localStorage.clear();
	});

	describe('Observable interop', () => {
		it(`should emit again when ${StorageEvent.name} is dispatched on globalThis with the correct context`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageGetterSpy.and.callThrough();

			// Act
			let actual: CampaignService | undefined;
			const subscription = from<InteropObservable<CampaignService>>(service)
				.pipe(skip(1))
				.subscribe((value) => (actual = value));
			globalThis.dispatchEvent(
				new StorageEvent('storage', {
					key: storageKeyMock,
					storageArea: localStorage,
				}),
			);
			subscription.unsubscribe();

			// Assert
			expect(actual).toEqual(service);
		}));

		it(`should not throw error when ${StorageEvent.name} is dispatched on globalThis with the correct context and next is not defined`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageGetterSpy.and.callThrough();

			// Act / Assert
			expect(() => {
				const subscription =
					from<InteropObservable<CampaignService>>(service).subscribe();
				globalThis.dispatchEvent(
					new StorageEvent('storage', {
						key: storageKeyMock,
						storageArea: localStorage,
					}),
				);
				subscription.unsubscribe();
			}).not.toThrow(service);
		}));

		it(`should not emit again when ${StorageEvent.name} is dispatched on globalThis with the correct storageArea by an incorrect key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageGetterSpy.and.callThrough();

			// Act
			let didEmit = false;
			const subscription = from<InteropObservable<CampaignService>>(service)
				.pipe(skip(1))
				.subscribe(() => (didEmit = true));
			globalThis.dispatchEvent(
				new StorageEvent('storage', {
					key: 'key',
					storageArea: localStorage,
				}),
			);
			subscription.unsubscribe();

			// Assert
			expect(didEmit).toBeFalse();
		}));

		it(`should not emit again when ${StorageEvent.name} is dispatched on globalThis with the correct key but an incorrect storageArea`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageGetterSpy.and.callThrough();

			// Act
			let didEmit = false;
			const subscription = from<InteropObservable<CampaignService>>(service)
				.pipe(skip(1))
				.subscribe(() => (didEmit = true));
			globalThis.dispatchEvent(
				new StorageEvent('storage', {
					key: storageKeyMock,
					storageArea: sessionStorage,
				}),
			);
			subscription.unsubscribe();

			// Assert
			expect(didEmit).toBeFalse();
		}));

		it(`should emit again when changes occur synchronously on next (edge-case)`, fakeAsync(() => {
			// Arrange
			const nextSpy =
				jasmine.createSpy<(value: CampaignService) => void>('next');
			const service = createService();
			localStorageGetterSpy.and.callThrough();
			nextSpy.and.callFake((service) => service.set('1', 'a'));

			// Act
			from<InteropObservable<CampaignService>>(service)
				.pipe(take(2))
				.subscribe(nextSpy)
				.unsubscribe();

			// Assert
			expect(nextSpy).toHaveBeenCalledWith(service);
			expect(nextSpy).toHaveBeenCalledTimes(2);
		}));

		it(`should not throw error when changes occur but next is not defined`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageGetterSpy.and.callThrough();

			// Act / Assert
			expect(() => {
				const subscription =
					from<InteropObservable<CampaignService>>(service).subscribe();
				service.set('key', 'value');
				subscription.unsubscribe();
			}).not.toThrow(service);
		}));

		it(`should not emit again when changes occur but unsubscribe has been called`, fakeAsync(() => {
			// Arrange
			const nextSpy = jasmine.createSpy<(value: CampaignService) => void>();
			const service = createService();
			localStorageGetterSpy.and.callThrough();
			nextSpy.and.callFake((service) => service.set('1', 'a'));

			// Act
			from<InteropObservable<CampaignService>>(service)
				.pipe(skip(1))
				.subscribe(nextSpy)
				.unsubscribe();
			service.set('key', 'value');

			// Assert
			expect(nextSpy).not.toHaveBeenCalled();
		}));

		it(`should not emit again when ${StorageEvent.name} is dispatched on globalThis with the correct context but unsubscribe has been called`, fakeAsync(() => {
			// Arrange
			const nextSpy = jasmine.createSpy<(value: CampaignService) => void>();
			const service = createService();
			localStorageGetterSpy.and.callThrough();
			nextSpy.and.callFake((service) => service.set('1', 'a'));

			// Act
			from<InteropObservable<CampaignService>>(service)
				.pipe(skip(1))
				.subscribe(nextSpy)
				.unsubscribe();
			globalThis.dispatchEvent(
				new StorageEvent('storage', {
					key: storageKeyMock,
					storageArea: localStorage,
				}),
			);

			// Assert
			expect(nextSpy).not.toHaveBeenCalled();
		}));

		it(`should emit correct value`, fakeAsync(() => {
			// Arrange
			const service = createService();

			// Act
			let actual: CampaignService | undefined;
			from<InteropObservable<CampaignService>>(service)
				.subscribe((value) => (actual = value))
				.unsubscribe();

			// Assert
			expect(actual).toEqual(service);
		}));

		it(`should emit not throw if next is not defined`, fakeAsync(() => {
			// Arrange
			const service = createService();

			// Act / Assert
			expect(() =>
				from<InteropObservable<CampaignService>>(service)
					.subscribe()
					.unsubscribe(),
			).not.toThrow(service);
		}));
	});

	describe('Symbol.iterator', () => {
		[null, '', '[]'].forEach((itemMock) => {
			it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				const iterableIterator = service[Symbol.iterator]();

				// Assert
				expect(iterableIterator).toEqual(new Map()[Symbol.iterator]());
			}));
		});

		it(`should be set correctly when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			const iterableIterator = service[Symbol.iterator]();

			// Assert
			expect(iterableIterator).toEqual(
				new Map([
					['1', 'a'],
					['2', 'b'],
					['3', 'c'],
				])[Symbol.iterator](),
			);
		}));
	});

	describe('entries', () => {
		[null, '', '[]'].forEach((itemMock) =>
			it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				const iterableIterator = service.entries();

				// Assert
				expect(iterableIterator).toEqual(new Map().entries());
			})),
		);

		it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			const iterableIterator = service.entries();

			// Assert
			expect(iterableIterator).toEqual(
				new Map([
					['1', 'a'],
					['2', 'b'],
					['3', 'c'],
				]).entries(),
			);
		}));
	});

	describe('values', () => {
		[null, '', '[]'].forEach((itemMock) =>
			it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				const iterableIterator = service.values();

				// Assert
				expect(iterableIterator).toEqual(new Map().values());
			})),
		);

		it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			const iterableIterator = service.values();

			// Assert
			expect(iterableIterator).toEqual(
				new Map([
					['1', 'a'],
					['2', 'b'],
					['3', 'c'],
				]).values(),
			);
		}));
	});

	describe('keys', () => {
		[null, '', '[]'].forEach((itemMock) =>
			it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				const iterableIterator = service.keys();

				// Assert
				expect(iterableIterator).toEqual(new Map().keys());
			})),
		);

		it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			const iterableIterator = service.keys();

			// Assert
			expect(iterableIterator).toEqual(
				new Map([
					['1', 'a'],
					['2', 'b'],
					['3', 'c'],
				]).keys(),
			);
		}));
	});

	describe('has', () => {
		[null, '', '[]'].forEach((itemMock) =>
			it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				const has = service.has('key');

				// Assert
				expect(has).toBeFalse();
			})),
		);

		it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns but not with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			const has = service.has('4');

			// Assert
			expect(has).toBeFalse();
		}));

		it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			const has = service.has('1');

			// Assert
			expect(has).toBeTrue();
		}));
	});

	describe('get', () => {
		[null, '', '[]'].forEach((itemMock) =>
			it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				const value = service.get('key');

				// Assert
				expect(value).toBeUndefined();
			})),
		);

		it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns but not with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			const value = service.get('4');

			// Assert
			expect(value).toBeUndefined();
		}));

		it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			const value = service.get('1');

			// Assert
			expect(value).toBe('a');
		}));
	});

	describe('set', () => {
		[null, '', '[]'].forEach((itemMock) => {
			it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				const value = service.set('key', 'value');

				// Assert
				expect(value).toEqual(service);
			}));

			it(`should call ${Storage.prototype.setItem.name} method on ${Storage.name} once with correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const keyMock = 'key';
				const valueMock = 'value';
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				service.set(keyMock, valueMock);

				// Assert
				expect(localStorageMock.setItem).toHaveBeenCalledOnceWith(
					storageKeyMock,
					JSON.stringify(Array.from(new Map().set(keyMock, valueMock))),
				);
			}));

			it(`should cause observable interop to emit again when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const keyMock = 'key';
				const valueMock = 'value';
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				let actual: CampaignService | undefined;
				const subscription = from<InteropObservable<CampaignService>>(service)
					.pipe(skip(1))
					.subscribe((value) => (actual = value));
				service.set(keyMock, valueMock);
				subscription.unsubscribe();

				// Assert
				expect(actual).toEqual(service);
			}));
		});

		it(`should call ${Storage.prototype.setItem.name} method on ${Storage.name} once with correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns but not with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			service.set('4', 'd');

			// Assert
			expect(localStorageMock.setItem).toHaveBeenCalledOnceWith(
				storageKeyMock,
				'[["1","a"],["2","b"],["3","c"],["4","d"]]',
			);
		}));

		it(`should cause observable interop to emit again when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns but not with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			let actual: CampaignService | undefined;
			const subscription = from<InteropObservable<CampaignService>>(service)
				.pipe(skip(1))
				.subscribe((value) => (actual = value));
			service.set('4', 'd');
			subscription.unsubscribe();

			// Assert
			expect(actual).toEqual(service);
		}));

		it(`should cause observable interop to emit again when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns with a matching key but not a matching value`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			let actual: CampaignService | undefined;
			const subscription = from<InteropObservable<CampaignService>>(service)
				.pipe(skip(1))
				.subscribe((value) => (actual = value));
			service.set('1', 'd');
			subscription.unsubscribe();

			// Assert
			expect(actual).toEqual(service);
		}));

		it(`should call ${Storage.prototype.setItem.name} method on ${Storage.name} once with correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns with a matching key but not a matching value`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			service.set('1', 'd');

			// Assert
			expect(localStorageMock.setItem).toHaveBeenCalledOnceWith(
				storageKeyMock,
				'[["1","d"],["2","b"],["3","c"]]',
			);
		}));

		it(`should not cause observable interop to emit when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns with a matching key and value`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			let didEmit = false;
			const subscription = from<InteropObservable<CampaignService>>(service)
				.pipe(skip(1))
				.subscribe(() => (didEmit = true));
			service.set('2', 'b');
			subscription.unsubscribe();

			// Assert
			expect(didEmit).toBeFalse();
		}));

		it(`should not call ${Storage.prototype.setItem.name} method on ${Storage.name} when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns with a matching key and value`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			service.set('2', 'b');

			// Assert
			expect(localStorageMock.setItem).not.toHaveBeenCalled();
		}));

		it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			const value = service.get('1');

			// Assert
			expect(value).toBe('a');
		}));
	});

	describe('delete', () => {
		[null, '', '[]'].forEach((itemMock) => {
			it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				const isDeleted = service.delete('key');

				// Assert
				expect(isDeleted).toBeFalse();
			}));

			it(`should not call ${Storage.prototype.setItem.name} method on ${Storage.name} when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const keyMock = 'key';
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				service.delete(keyMock);

				// Assert
				expect(localStorageMock.setItem).not.toHaveBeenCalled();
			}));

			it(`should not cause observable interop to emit when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const keyMock = 'key';
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				let didEmit = false;
				const subscription = from<InteropObservable<CampaignService>>(service)
					.pipe(skip(1))
					.subscribe(() => (didEmit = true));
				service.delete(keyMock);
				subscription.unsubscribe();

				// Assert
				expect(didEmit).toBeFalse();
			}));
		});

		it(`should not call ${Storage.prototype.setItem.name} method on ${Storage.name} when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns but not with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			service.delete('4');

			// Assert
			expect(localStorageMock.setItem).not.toHaveBeenCalled();
		}));

		it(`should not cause observable interop to emit when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns but not with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			let didEmit = false;
			const subscription = from<InteropObservable<CampaignService>>(service)
				.pipe(skip(1))
				.subscribe(() => (didEmit = true));
			service.delete('4');
			subscription.unsubscribe();

			// Assert
			expect(didEmit).toBeFalse();
		}));

		it(`should call ${Storage.prototype.setItem.name} method on ${Storage.name} once with correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			service.delete('2');

			// Assert
			expect(localStorageMock.setItem).toHaveBeenCalledOnceWith(
				storageKeyMock,
				'[["1","a"],["3","c"]]',
			);
		}));

		it(`should cause observable interop to emit again when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			let actual: CampaignService | undefined;
			const subscription = from<InteropObservable<CampaignService>>(service)
				.pipe(skip(1))
				.subscribe((value) => (actual = value));
			service.delete('2');
			subscription.unsubscribe();

			// Assert
			expect(actual).toEqual(service);
		}));

		it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns with a matching key`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			const deleted = service.delete('1');

			// Assert
			expect(deleted).toBeTrue();
		}));
	});

	describe('clear', () => {
		[null, '', '[]'].forEach((itemMock) => {
			it(`should not call ${Storage.prototype.setItem.name} method on ${Storage.name} when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				service.clear();

				// Assert
				expect(localStorageMock.setItem).not.toHaveBeenCalled();
			}));

			it(`should not cause observable interop to emit when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				let didEmit = false;
				const subscription = from<InteropObservable<CampaignService>>(service)
					.pipe(skip(1))
					.subscribe(() => (didEmit = true));
				service.clear();
				subscription.unsubscribe();

				// Assert
				expect(didEmit).toBeFalse();
			}));
		});

		it(`should call ${Storage.prototype.setItem.name} method on ${Storage.name} once with correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			service.clear();

			// Assert
			expect(localStorageMock.setItem).toHaveBeenCalledOnceWith(
				storageKeyMock,
				'[]',
			);
		}));

		it(`should cause observable interop to emit again when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			let actual: CampaignService | undefined;
			const subscription = from<InteropObservable<CampaignService>>(service)
				.pipe(skip(1))
				.subscribe((value) => (actual = value));
			service.clear();
			subscription.unsubscribe();

			// Assert
			expect(actual).toEqual(service);
		}));
	});

	describe('forEach', () => {
		[null, '', '[]'].forEach((itemMock) => {
			it(`should return correct value when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				const value = service.set('key', 'value');

				// Assert
				expect(value).toEqual(service);
			}));
		});

		it(`should invoke callbackfn for every entry w/o thisArg`, fakeAsync(() => {
			// Arrange
			const callbackfnMock =
				jasmine.createSpy<
					(value: string, key: string, service: CampaignService) => void
				>();
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			service.forEach(callbackfnMock);

			// Assert
			expect(callbackfnMock).toHaveBeenCalledWith('a', '1', service);
			expect(callbackfnMock).toHaveBeenCalledWith('b', '2', service);
			expect(callbackfnMock).toHaveBeenCalledWith('c', '3', service);
			expect(callbackfnMock).toHaveBeenCalledTimes(3);
		}));

		it(`should invoke callbackfn for every entry w/ thisArg`, fakeAsync(() => {
			// Arrange
			const thisArgMock = {};
			const callbackfnMock =
				jasmine.createSpy<
					(value: string, key: string, service: CampaignService) => void
				>();
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			service.forEach(callbackfnMock, thisArgMock);

			// Assert
			expect(callbackfnMock).toHaveBeenCalledWith('a', '1', service);
			expect(callbackfnMock).toHaveBeenCalledWith('b', '2', service);
			expect(callbackfnMock).toHaveBeenCalledWith('c', '3', service);
			expect(callbackfnMock).toHaveBeenCalledTimes(3);
		}));
	});

	describe('size', () => {
		[null, '', '[]'].forEach((itemMock) =>
			it(`should be set correctly when ${Storage.prototype.getItem.name} method on ${Storage.name} returns ${itemMock}`, fakeAsync(() => {
				// Arrange
				const service = createService();
				localStorageMock.getItem.and.returnValue(itemMock);

				// Act
				const { size } = service;

				// Assert
				expect(size).toBe(0);
			})),
		);

		it(`should be set correctly when ${Storage.prototype.getItem.name} method on ${Storage.name} returns campaigns`, fakeAsync(() => {
			// Arrange
			const service = createService();
			localStorageMock.getItem.and.returnValue(
				'[["1","a"],["2","b"],["3","c"]]',
			);

			// Act
			const { size } = service;

			// Assert
			expect(size).toBe(3);
		}));
	});

	function createService(): CampaignService {
		return runInInjectionContext(injector, () => new CampaignService());
	}
});
