import { InteropObservable, observable } from '../interop';
import { ConsumerObserver } from './consumer-observer';
import { Observable } from './observable';
import { ProducerObserver } from './producer-observer';
import { Subscribable } from './subscribable';

describe(Observable.name, () => {
	it('should be an InteropObservable that can be past to Observable.from', () => {
		// Arrange
		const source = new Observable();

		// Act
		const observable = Observable.from(source);

		// Assert
		expect(observable).toBeInstanceOf(Observable);
		expect(observable).toBe(source);
	});

	describe('Observable.from', () => {
		it('should return a new Observable wrapping a subscribable', () => {
			// Arrange
			const observer = jasmine.createSpyObj('observer', ['next', 'complete']);
			const subscribable = jasmine.createSpyObj<Subscribable<number>>(
				'subscribable',
				['subscribe'],
			);
			subscribable.subscribe.and.callFake((observerOrNext) => {
				const observable = new Observable((observer) => {
					observer.next(1);
					observer.complete();
				});
				observable.subscribe(observerOrNext);
			});

			// Act
			const observable = Observable.from(subscribable);
			observable.subscribe(observer);

			// Assert
			expect(observable).toBeInstanceOf(Observable);
			expect(observer.next).toHaveBeenCalledOnceWith(1);
			expect(observer.complete).toHaveBeenCalledOnceWith();
			expect(subscribable.subscribe).toHaveBeenCalledOnceWith(
				jasmine.any(ProducerObserver),
			);
		});

		it('should return a new Observable wrapping an interop observable', () => {
			// Arrange
			const observer = jasmine.createSpyObj('observer', ['next', 'complete']);
			const observableSpy =
				jasmine.createSpy<() => Subscribable<number>>('observable');
			const subscribeSpy =
				jasmine.createSpy<
					(
						observerOrNext?:
							| Partial<ConsumerObserver<number>>
							| ((value: number) => unknown)
							| null,
					) => unknown
				>('subscribe');
			const interop: InteropObservable<number> & Subscribable<number> = {
				[observable]: observableSpy,
				subscribe: subscribeSpy,
			};
			observableSpy.and.returnValue(
				new Observable((observer) => {
					observer.next(1);
					observer.complete();
				}),
			);

			// Act
			const source = Observable.from(interop);
			source.subscribe(observer);

			// Assert
			expect(source).toBeInstanceOf(Observable);
			expect(observableSpy).toHaveBeenCalledOnceWith();
			expect(subscribeSpy).not.toHaveBeenCalled();
			expect(observer.next).toHaveBeenCalledOnceWith(1);
			expect(observer.complete).toHaveBeenCalledOnceWith();
		});

		it('should return the same Observable if input is already an Observable', () => {
			// Arrange
			const source = new Observable();

			// Act
			const result = Observable.from(source);

			// Assert
			expect(result).toBe(source);
		});

		it('should error if input is not an object', () => {
			// Arrange
			const observer = jasmine.createSpyObj('observer', ['error']);

			// Act
			const observable = Observable.from(1 as any);
			observable.subscribe(observer);

			// Assert
			expect(observer.error).toHaveBeenCalledOnceWith(
				new TypeError('Observable.from called on non-object'),
			);
		});

		it('should error if input is null', () => {
			// Arrange
			const observer = jasmine.createSpyObj('observer', ['error']);

			// Act
			const observable = Observable.from(null as any);
			observable.subscribe(observer);

			// Assert
			expect(observer.error).toHaveBeenCalledOnceWith(
				new TypeError('Observable.from called on non-object'),
			);
		});

		it('should error if interop observable throws', () => {
			// Arrange
			const error = new Error('Interop error');
			const observer = jasmine.createSpyObj('observer', ['error']);
			const interop: InteropObservable = {
				[observable]() {
					throw error;
				},
			};

			// Act
			const source = Observable.from(interop);
			source.subscribe(observer);

			// Assert
			expect(observer.error).toHaveBeenCalledOnceWith(error);
		});
	});

	describe(Observable.prototype.subscribe.name, () => {
		it('should create a new producer observer correctly when subscribe is called with a next function', () => {
			// Arrange
			const next = jasmine.createSpy<(value: number) => unknown>('next');
			const subscribeSpy =
				jasmine.createSpy<(observer: ProducerObserver<number>) => void>(
					'subscribe',
				);
			const observable = new Observable(subscribeSpy);

			// Act
			observable.subscribe(next);
			const producerObserver = subscribeSpy.calls.argsFor(0)[0];
			producerObserver.next(1);

			// Assert
			expect(producerObserver).toBeInstanceOf(ProducerObserver);
			expect(producerObserver.signal.aborted).toBeFalse();
			expect(next).toHaveBeenCalledOnceWith(1);
		});

		it('should create a new producer observer correctly when subscribe is called with a partial consumer observer', () => {
			// Arrange
			const consumerObserver = jasmine.createSpyObj<
				Partial<ConsumerObserver<number>>
			>('observer', ['next', 'error', 'complete', 'finally']);
			const subscribeSpy =
				jasmine.createSpy<(observer: ProducerObserver<number>) => void>(
					'subscribe',
				);
			const observable = new Observable(subscribeSpy);

			// Act
			observable.subscribe(consumerObserver);
			const producerObserver = subscribeSpy.calls.argsFor(0)[0];
			producerObserver.next(1);
			producerObserver.complete();

			// Assert
			expect(producerObserver).toBeInstanceOf(ProducerObserver);
			expect(producerObserver.signal.aborted).toBeTrue();
			expect(consumerObserver.next).toHaveBeenCalledOnceWith(1);
			expect(consumerObserver.complete).toHaveBeenCalledOnceWith();
			expect(consumerObserver.finally).toHaveBeenCalledOnceWith();
			expect(consumerObserver.error).not.toHaveBeenCalled();
		});

		it('should create a new producer observer correctly when subscribe is called with a full consumer observer', () => {
			// Arrange
			const controller = new AbortController();
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver<number>>(
				'observer',
				['next', 'error', 'complete', 'finally'],
				{ signal: controller.signal },
			);
			const subscribeSpy =
				jasmine.createSpy<(observer: ProducerObserver<number>) => void>(
					'subscribe',
				);
			const observable = new Observable(subscribeSpy);

			// Act
			observable.subscribe(consumerObserver);
			const producerObserver = subscribeSpy.calls.argsFor(0)[0];
			producerObserver.next(1);
			producerObserver.complete();

			// Assert
			expect(producerObserver).toBeInstanceOf(ProducerObserver);
			expect(producerObserver.signal.aborted).toBeTrue();
			expect(consumerObserver.signal.aborted).toBeFalse();
			expect(consumerObserver.next).toHaveBeenCalledOnceWith(1);
			expect(consumerObserver.error).not.toHaveBeenCalled();
			expect(consumerObserver.complete).toHaveBeenCalledOnceWith();
			expect(consumerObserver.finally).toHaveBeenCalledOnceWith();
		});

		it('should not create a new producer observer when subscribe is called with an existing producer observer', () => {
			// Arrange
			const observer = new ProducerObserver({});
			const subscribeSpy =
				jasmine.createSpy<(observer: ProducerObserver) => unknown>('subscribe');
			const observable = new Observable(subscribeSpy);

			// Act
			observable.subscribe(observer);

			// Assert
			expect(subscribeSpy.calls.argsFor(0)[0]).toBe(observer);
		});

		it('should not throw when internal subscribe throws', () => {
			// Arrange
			const subscribeSpy =
				jasmine.createSpy<(observer: ProducerObserver) => unknown>('subscribe');
			const observable = new Observable(subscribeSpy);
			subscribeSpy.and.throwError(new Error('this should be handled'));

			// Act / Assert
			expect(() => observable.subscribe()).not.toThrow();
		});

		it('should call error method on consumer observer when internal subscribe throws', () => {
			// Arrange
			const error = new Error('this should be handled');
			const subscribeSpy =
				jasmine.createSpy<(observer: ProducerObserver) => unknown>('subscribe');
			const observable = new Observable(subscribeSpy);
			subscribeSpy.and.throwError(error);
			const observer = jasmine.createSpyObj<ConsumerObserver>('observer', [
				'error',
			]);

			// Act
			observable.subscribe(observer);

			// Assert
			expect(observer.error).toHaveBeenCalledOnceWith(error);
		});

		it('should not throw when internal subscribe is not provided', () => {
			// Arrange
			const observable = new Observable();

			// Act / Assert
			expect(() => observable.subscribe()).not.toThrow();
		});

		it('should not call error method on consumer observer when internal subscribe is not provided', () => {
			// Arrange;
			const observable = new Observable();
			const observer = jasmine.createSpyObj<ConsumerObserver>('observer', [
				'error',
			]);

			// Act
			observable.subscribe(observer);

			// Assert
			expect(observer.error).not.toHaveBeenCalled();
		});

		it('should call internal subscribe again on resubscribe', () => {
			// Arrange;
			const subscribeSpy =
				jasmine.createSpy<(observer: ProducerObserver) => unknown>('subscribe');
			const observable = new Observable(subscribeSpy);

			// Act
			observable.subscribe();
			observable.subscribe();

			// Assert
			expect(subscribeSpy).toHaveBeenCalledTimes(2);
		});
	});
});
