import { UnaryFunction } from '../pipe';
import { Observable } from './observable';
import { Observer, Subscriber } from './subscriber';

describe(Observable.name, () => {
	describe(Observable.prototype.subscribe.name, () => {
		it('should create a new subscriber correctly when subscribe is called with a next function', () => {
			// Arrange
			const next = jasmine.createSpy<UnaryFunction<number>>('next');
			const subscribeSpy =
				jasmine.createSpy<UnaryFunction<Subscriber<number>>>('subscribe');
			const observable = new Observable(subscribeSpy);

			// Act
			observable.subscribe(next);
			const subscriber = subscribeSpy.calls.argsFor(0)[0];
			subscriber.next(1);

			// Assert
			expect(subscriber).toBeInstanceOf(Subscriber);
			expect(subscriber.signal.aborted).toBeFalse();
			expect(next).toHaveBeenCalledOnceWith(1);
		});

		it('should create a new subscriber correctly when subscribe is called with a partial observer', () => {
			// Arrange
			const observer = jasmine.createSpyObj<Partial<Observer<number>>>(
				'observer',
				['next', 'error'],
			);
			const subscribeSpy =
				jasmine.createSpy<UnaryFunction<Subscriber<number>>>('subscribe');
			const observable = new Observable(subscribeSpy);

			// Act
			observable.subscribe(observer);
			const subscriber = subscribeSpy.calls.argsFor(0)[0];
			subscriber.next(1);
			subscriber.complete();

			// Assert
			expect(subscriber).toBeInstanceOf(Subscriber);
			expect(subscriber.signal.aborted).toBeFalse();
			expect(observer.next).toHaveBeenCalledOnceWith(1);
			expect(observer.complete).toHaveBeenCalledOnceWith();
		});

		it('should create a new subscriber correctly when subscribe is called with a full observer', () => {
			// Arrange
			const error = new Error('this should be handled');
			const abortReason = Symbol('abort reason');
			const controller = new AbortController();
			const observer = jasmine.createSpyObj<Observer<number>>(
				'observer',
				['next', 'error', 'complete', 'finally'],
				{ signal: controller.signal },
			);
			const subscribeSpy =
				jasmine.createSpy<UnaryFunction<Subscriber<number>>>('subscribe');
			const observable = new Observable(subscribeSpy);

			// Act
			observable.subscribe(observer);
			const subscriber = subscribeSpy.calls.argsFor(0)[0];
			controller.abort(abortReason);
			subscriber.next(1);
			subscriber.error(error);
			subscriber.complete();

			// Assert
			expect(subscriber).toBeInstanceOf(Subscriber);
			expect(subscriber.signal.aborted).toBeTrue();
			expect(subscriber.signal.reason).toBe(abortReason);
			expect(observer.next).toHaveBeenCalledOnceWith(1);
			expect(observer.error).toHaveBeenCalledOnceWith(error);
			expect(observer.complete).toHaveBeenCalledOnceWith();
			expect(observer.finally).toHaveBeenCalledOnceWith();
		});

		it('should not create a new subscriber when subscribe is called with an existing open subscriber', () => {
			// Arrange
			const subscriber = new Subscriber({});
			const subscribeSpy =
				jasmine.createSpy<UnaryFunction<Subscriber>>('subscribe');
			const observable = new Observable(subscribeSpy);

			// Act
			observable.subscribe(subscriber);

			// Assert
			expect(subscribeSpy.calls.argsFor(0)[0]).toBe(subscriber);
		});

		it('should not create a new subscriber when subscribe is called with an existing open subscriber', () => {
			// Arrange
			const controller = new AbortController();
			const subscriber = new Subscriber({ signal: controller.signal });
			const subscribeSpy =
				jasmine.createSpy<UnaryFunction<Subscriber>>('subscribe');
			const observable = new Observable(subscribeSpy);
			controller.abort();

			// Act
			observable.subscribe(subscriber);

			// Assert
			expect(subscribeSpy.calls.argsFor(0)[0]).toBe(subscriber);
		});

		it('should not throw when internal subscribe throws', () => {
			// Arrange
			const subscribeSpy =
				jasmine.createSpy<UnaryFunction<Subscriber>>('subscribe');
			const observable = new Observable(subscribeSpy);
			subscribeSpy.and.throwError(new Error('this should be handled'));
			const observer = jasmine.createSpyObj<Observer>('observer', ['error']);

			// Act / Assert
			expect(observable.subscribe(observer)).not.toThrow();
		});

		it('should call error method on observer when error is thrown in subscribe', () => {
			// Arrange
			const error = new Error('this should be handled');
			const subscribeSpy =
				jasmine.createSpy<UnaryFunction<Subscriber>>('subscribe');
			const observable = new Observable(subscribeSpy);
			subscribeSpy.and.throwError(error);
			const observer = jasmine.createSpyObj<Observer>('observer', ['error']);

			// Act
			observable.subscribe(observer);

			// Assert
			expect(observer.error).toHaveBeenCalledWith(error);
		});

		it('should not throw when internal subscribe is not provided', () => {
			// Arrange
			const observable = new Observable();
			const observer = jasmine.createSpyObj<Observer>('observer', ['error']);

			// Act / Assert
			expect(observable.subscribe(observer)).not.toThrow();
		});

		it('should not call error method on observer when internal subscribe is not provided', () => {
			// Arrange;
			const observable = new Observable();
			const observer = jasmine.createSpyObj<Observer>('observer', ['error']);

			// Act
			observable.subscribe(observer);

			// Assert
			expect(observer.error).not.toHaveBeenCalled();
		});

		it('should call internal subscribe again on resubscribe', () => {
			// Arrange;
			const subscribeSpy =
				jasmine.createSpy<UnaryFunction<Subscriber>>('subscribe');
			const observable = new Observable(subscribeSpy);

			// Act
			observable.subscribe();
			observable.subscribe();

			// Assert
			expect(subscribeSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe(Observable.prototype.pipe.name, () => {
		it('should return this observable when called with no arguments', () => {
			// Arrange
			const observable = new Observable();

			// Act
			const result = observable.pipe();

			// Assert
			expect(result).toBe(observable);
		});

		it('should be pipeable', () => {
			// Arrange
			const symbol1 = Symbol('symbol');
			const symbol2 = Symbol('symbol');
			const op1Spy =
				jasmine.createSpy<UnaryFunction<Observable, typeof symbol1>>('op1');
			const op2Spy =
				jasmine.createSpy<UnaryFunction<typeof symbol1, typeof symbol2>>('op2');
			const observable = new Observable();
			op1Spy.and.returnValue(symbol1);
			op2Spy.and.returnValue(symbol2);

			// Act
			const piped = observable.pipe(op1Spy, op2Spy);

			// Assert
			expect(op1Spy).toHaveBeenCalledOnceWith(observable);
			expect(op2Spy).toHaveBeenCalledOnceWith(symbol1);
			expect(piped).toBe(symbol2);
		});
	});
});
