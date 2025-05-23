import { UnaryFunction } from '../pipe';
import { ConsumerObserver } from './consumer-observer';
import { Observable } from './observable';
import { ProducerObserver } from './producer-observer';

describe(Observable.name, () => {
	describe(Observable.prototype.subscribe.name, () => {
		it('should create a new producer observer correctly when subscribe is called with a next function', () => {
			// Arrange
			const next = jasmine.createSpy<(value: number) => unknown>('next');
			const subscribeSpy =
				jasmine.createSpy<UnaryFunction<ProducerObserver<number>>>('subscribe');
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
				jasmine.createSpy<UnaryFunction<ProducerObserver<number>>>('subscribe');
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
				jasmine.createSpy<UnaryFunction<ProducerObserver<number>>>('subscribe');
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

	// describe(Observable.prototype.pipe.name, () => {
	// 	it('should return this observable when called with no arguments', () => {
	// 		// Arrange
	// 		const observable = new Observable();

	// 		// Act
	// 		const result = observable.pipe();

	// 		// Assert
	// 		expect(result).toBe(observable);
	// 	});

	// 	it('should be pipeable', () => {
	// 		// Arrange
	// 		const symbol1 = Symbol('symbol');
	// 		const symbol2 = Symbol('symbol');
	// 		const op1Spy =
	// 			jasmine.createSpy<UnaryFunction<Observable, typeof symbol1>>('op1');
	// 		const op2Spy =
	// 			jasmine.createSpy<UnaryFunction<typeof symbol1, typeof symbol2>>('op2');
	// 		const observable = new Observable();
	// 		op1Spy.and.returnValue(symbol1);
	// 		op2Spy.and.returnValue(symbol2);

	// 		// Act
	// 		const piped = observable.pipe(op1Spy, op2Spy);

	// 		// Assert
	// 		expect(op1Spy).toHaveBeenCalledOnceWith(observable);
	// 		expect(op2Spy).toHaveBeenCalledOnceWith(symbol1);
	// 		expect(piped).toBe(symbol2);
	// 	});
	// });
});
