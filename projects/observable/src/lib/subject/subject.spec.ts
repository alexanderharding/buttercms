import { Subject } from './subject';
import { ConsumerObserver, Observable } from '../observable';

describe(Subject.name, () => {
	it('should allow next with undefined when created with no type', () => {
		// Arrange
		const subject = new Subject();
		const observer = jasmine.createSpyObj('observer', ['next', 'complete']);

		// Act
		subject.subscribe(observer);
		subject.next(undefined);
		subject.complete();

		// Assert
		expect(observer.next).toHaveBeenCalledOnceWith(undefined);
		expect(observer.complete).toHaveBeenCalledOnceWith();
	});

	it('should allow empty next when created with no type', () => {
		// Arrange
		const subject = new Subject();
		const observer = jasmine.createSpyObj('observer', ['next', 'complete']);

		// Act
		subject.subscribe(observer);
		subject.next();
		subject.complete();

		// Assert
		expect(observer.next).toHaveBeenCalledOnceWith(undefined);
		expect(observer.complete).toHaveBeenCalledOnceWith();
	});

	it('should pump values right on through itself', () => {
		// Arrange
		const subject = new Subject<string>();
		const observer = jasmine.createSpyObj('observer', ['next', 'complete']);

		// Act
		subject.subscribe(observer);
		subject.next('foo');
		subject.next('bar');
		subject.complete();

		// Assert
		expect(observer.next).toHaveBeenCalledTimes(2);
		expect(observer.next.calls.argsFor(0)[0]).toBe('foo');
		expect(observer.next.calls.argsFor(1)[0]).toBe('bar');
		expect(observer.complete).toHaveBeenCalledOnceWith();
	});

	it('should push values to multiple subscribers', () => {
		// Arrange
		const subject = new Subject<string>();
		const observer1 = jasmine.createSpyObj('observer1', ['next']);
		const observer2 = jasmine.createSpyObj('observer2', ['next', 'complete']);

		// Act
		subject.subscribe(observer1);
		subject.subscribe(observer2);
		subject.next('foo');
		subject.next('bar');
		subject.complete();

		// Assert
		expect(observer1.next).toHaveBeenCalledTimes(2);
		expect(observer1.next.calls.argsFor(0)[0]).toBe('foo');
		expect(observer1.next.calls.argsFor(1)[0]).toBe('bar');

		expect(observer2.next).toHaveBeenCalledTimes(2);
		expect(observer2.next.calls.argsFor(0)[0]).toBe('foo');
		expect(observer2.next.calls.argsFor(1)[0]).toBe('bar');
		expect(observer2.complete).toHaveBeenCalledOnceWith();
	});

	it('should handle subscribers that arrive and leave at different times but subject does not complete', () => {
		// Arrange
		const subject = new Subject<number>();
		const observer1 = jasmine.createSpyObj('observer1', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const observer2 = jasmine.createSpyObj('observer2', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const observer3 = jasmine.createSpyObj('observer3', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const controller1 = new AbortController();
		const controller2 = new AbortController();
		const controller3 = new AbortController();

		// Act - Initial values before any subscribers
		subject.next(1);
		subject.next(2);
		subject.next(3);
		subject.next(4);

		// First subscriber joins
		subject.subscribe({ ...observer1, signal: controller1.signal });
		subject.next(5);

		// Second subscriber joins
		subject.subscribe({ ...observer2, signal: controller2.signal });
		subject.next(6);
		subject.next(7);

		// First subscriber leaves
		controller1.abort();
		subject.next(8);

		// Second subscriber leaves
		controller2.abort();
		subject.next(9);
		subject.next(10);

		// Third subscriber joins and leaves
		subject.subscribe({ ...observer3, signal: controller3.signal });
		subject.next(11);
		controller3.abort();

		// Assert
		expect(observer1.next.calls.allArgs()).toEqual([[5], [6], [7]]);
		expect(observer1.finally).toHaveBeenCalledOnceWith();
		expect(observer1.error).not.toHaveBeenCalled();
		expect(observer1.complete).not.toHaveBeenCalled();

		expect(observer2.next.calls.allArgs()).toEqual([[6], [7], [8]]);
		expect(observer2.finally).toHaveBeenCalledOnceWith();
		expect(observer2.error).not.toHaveBeenCalled();
		expect(observer2.complete).not.toHaveBeenCalled();

		expect(observer3.next.calls.allArgs()).toEqual([[11]]);
		expect(observer3.finally).toHaveBeenCalledOnceWith();
		expect(observer3.error).not.toHaveBeenCalled();
		expect(observer3.complete).not.toHaveBeenCalled();
	});

	it('should handle subscribers that arrive and leave at different times, subject completes', () => {
		// Arrange
		const subject = new Subject<number>();
		const observer1 = jasmine.createSpyObj('observer1', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const observer2 = jasmine.createSpyObj('observer2', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const observer3 = jasmine.createSpyObj('observer3', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const controller1 = new AbortController();
		const controller2 = new AbortController();
		const controller3 = new AbortController();

		// Act - Initial values before any subscribers
		subject.next(1);
		subject.next(2);
		subject.next(3);
		subject.next(4);

		// First subscriber joins
		subject.subscribe({ ...observer1, signal: controller1.signal });
		subject.next(5);

		// Second subscriber joins
		subject.subscribe({ ...observer2, signal: controller2.signal });
		subject.next(6);
		subject.next(7);

		// First subscriber leaves
		controller1.abort();

		// Subject completes
		subject.complete();

		// Second subscriber leaves
		controller2.abort();

		// Third subscriber joins and leaves after completion
		subject.subscribe({ ...observer3, signal: controller3.signal });
		controller3.abort();

		// Assert
		expect(observer1.next.calls.allArgs()).toEqual([[5], [6], [7]]);
		expect(observer1.finally).toHaveBeenCalledOnceWith();
		expect(observer1.error).not.toHaveBeenCalled();
		expect(observer1.complete).not.toHaveBeenCalled();

		expect(observer2.next.calls.allArgs()).toEqual([[6], [7]]);
		expect(observer2.complete).toHaveBeenCalledOnceWith();
		expect(observer2.finally).toHaveBeenCalledOnceWith();
		expect(observer2.error).not.toHaveBeenCalled();

		expect(observer3.complete).toHaveBeenCalledOnceWith();
		expect(observer3.finally).toHaveBeenCalledOnceWith();
		expect(observer3.next).not.toHaveBeenCalled();
		expect(observer3.error).not.toHaveBeenCalled();
	});

	it('should handle subscribers that arrive and leave at different times, subject terminates with an error', () => {
		// Arrange
		const subject = new Subject<number>();
		const observer1 = jasmine.createSpyObj('observer1', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const observer2 = jasmine.createSpyObj('observer2', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const observer3 = jasmine.createSpyObj('observer3', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const controller1 = new AbortController();
		const controller2 = new AbortController();
		const controller3 = new AbortController();
		const testError = new Error('err');

		// Act - Initial values before any subscribers
		subject.next(1);
		subject.next(2);
		subject.next(3);
		subject.next(4);

		// First subscriber joins
		subject.subscribe({ ...observer1, signal: controller1.signal });
		subject.next(5);

		// Second subscriber joins
		subject.subscribe({ ...observer2, signal: controller2.signal });
		subject.next(6);
		subject.next(7);

		// First subscriber leaves
		controller1.abort();

		// Subject errors
		subject.error(testError);

		// Second subscriber leaves
		controller2.abort();

		// Third subscriber joins and leaves after error
		subject.subscribe({ ...observer3, signal: controller3.signal });
		controller3.abort();

		// Assert
		expect(observer1.next.calls.allArgs()).toEqual([[5], [6], [7]]);
		expect(observer1.finally).toHaveBeenCalledOnceWith();
		expect(observer1.error).not.toHaveBeenCalled();
		expect(observer1.complete).not.toHaveBeenCalled();

		expect(observer2.next.calls.allArgs()).toEqual([[6], [7]]);
		expect(observer2.error).toHaveBeenCalledOnceWith(testError);
		expect(observer2.finally).toHaveBeenCalledOnceWith();
		expect(observer2.complete).not.toHaveBeenCalled();

		expect(observer3.error).toHaveBeenCalledOnceWith(testError);
		expect(observer3.finally).toHaveBeenCalledOnceWith();
		expect(observer3.next).not.toHaveBeenCalled();
		expect(observer3.complete).not.toHaveBeenCalled();
	});

	it('should handle subscribers that arrive and leave at different times, subject completes before nexting any value', () => {
		// Arrange
		const subject = new Subject<number>();
		const observer1 = jasmine.createSpyObj('observer1', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const observer2 = jasmine.createSpyObj('observer2', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const observer3 = jasmine.createSpyObj('observer3', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const controller1 = new AbortController();
		const controller2 = new AbortController();
		const controller3 = new AbortController();

		// Act
		subject.subscribe({ ...observer1, signal: controller1.signal });
		subject.subscribe({ ...observer2, signal: controller2.signal });

		controller1.abort();
		subject.complete();
		controller2.abort();

		subject.subscribe({ ...observer3, signal: controller3.signal });
		controller3.abort();

		// Assert
		expect(observer1.finally).toHaveBeenCalledOnceWith();
		expect(observer1.next).not.toHaveBeenCalled();
		expect(observer1.error).not.toHaveBeenCalled();
		expect(observer1.complete).not.toHaveBeenCalled();

		expect(observer2.complete).toHaveBeenCalledOnceWith();
		expect(observer2.finally).toHaveBeenCalledOnceWith();
		expect(observer2.next).not.toHaveBeenCalled();
		expect(observer2.error).not.toHaveBeenCalled();

		expect(observer3.complete).toHaveBeenCalledOnceWith();
		expect(observer3.finally).toHaveBeenCalledOnceWith();
		expect(observer3.next).not.toHaveBeenCalled();
		expect(observer3.error).not.toHaveBeenCalled();
	});

	it('should disallow new subscriber once subject has been completed', () => {
		// Arrange
		const subject = new Subject<number>();
		const observer1 = jasmine.createSpyObj('observer1', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const observer2 = jasmine.createSpyObj('observer2', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const observer3 = jasmine.createSpyObj('observer3', [
			'next',
			'error',
			'complete',
			'finally',
		]);
		const controller1 = new AbortController();
		const controller2 = new AbortController();

		// Act
		subject.subscribe({ ...observer1, signal: controller1.signal });
		subject.next(1);
		subject.next(2);

		subject.subscribe({ ...observer2, signal: controller2.signal });
		subject.next(3);
		subject.next(4);
		subject.next(5);

		controller1.abort();
		controller2.abort();
		subject.complete();

		subject.subscribe(observer3);

		// Assert
		expect(subject.signal.aborted).toBeTrue();

		expect(observer1.next.calls.allArgs()).toEqual([[1], [2], [3], [4], [5]]);
		expect(observer1.finally).toHaveBeenCalledOnceWith();
		expect(observer1.error).not.toHaveBeenCalled();
		expect(observer1.complete).not.toHaveBeenCalled();

		expect(observer2.next.calls.allArgs()).toEqual([[3], [4], [5]]);
		expect(observer2.finally).toHaveBeenCalledOnceWith();
		expect(observer2.error).not.toHaveBeenCalled();
		expect(observer2.complete).not.toHaveBeenCalled();

		expect(observer3.complete).toHaveBeenCalledOnceWith();
		expect(observer3.finally).toHaveBeenCalledOnceWith();
		expect(observer3.next).not.toHaveBeenCalled();
		expect(observer3.error).not.toHaveBeenCalled();
	});

	it('should be an ConsumerObserver which can be given to Observable.subscribe', () => {
		// Arrange
		const source = new Observable((observer) => {
			[1, 2, 3, 4, 5].forEach((value) => observer.next(value));
			observer.complete();
		});
		const subject = new Subject<number>();
		const observer = jasmine.createSpyObj('observer', [
			'next',
			'error',
			'complete',
		]);

		// Act
		subject.subscribe(observer);
		source.subscribe(subject);

		// Assert
		expect(observer.next.calls.allArgs()).toEqual([[1], [2], [3], [4], [5]]);
		expect(observer.complete).toHaveBeenCalledOnceWith();
		expect(observer.error).not.toHaveBeenCalled();
	});

	it('should be an InteropObservable that can be past to Observable.from', () => {
		// Arrange
		const observer = jasmine.createSpyObj<ConsumerObserver<number>>(
			'observer',
			['next', 'complete', 'error', 'finally'],
		);
		const subject = new Subject<number>();

		// Act
		const observable = Observable.from(subject);
		observable.subscribe(observer);
		subject.next(1);
		subject.next(2);
		subject.next(3);
		subject.complete();

		// Assert
		expect(observable).toBeInstanceOf(Observable);
		expect(observable).not.toBeInstanceOf(Subject);
		expect(observer.next.calls.allArgs()).toEqual([[1], [2], [3]]);
		expect(observer.complete).toHaveBeenCalledOnceWith();
		expect(observer.error).not.toHaveBeenCalled();
		expect(observer.finally).toHaveBeenCalledOnceWith();
	});

	it('should be aborted after error', () => {
		// Arrange
		const subject = new Subject<string>();

		// Act
		subject.error('bad');

		// Assert
		expect(subject.signal.aborted).toBeTrue();
	});

	it('should be aborted after complete', () => {
		// Arrange
		const subject = new Subject<string>();

		// Act
		subject.complete();

		// Assert
		expect(subject.signal.aborted).toBeTrue();
	});

	it('should not next after completed', () => {
		// Arrange
		const subject = new Subject<string>();
		const observer = jasmine.createSpyObj('observer', ['next', 'complete']);

		// Act
		subject.subscribe(observer);
		subject.next('a');
		subject.complete();
		subject.next('b');

		// Assert
		expect(observer.next).toHaveBeenCalledOnceWith('a');
		expect(observer.complete).toHaveBeenCalledOnceWith();
	});

	it('should not next after error', () => {
		// Arrange
		const error = new Error('wut?');
		const subject = new Subject<string>();
		const observer = jasmine.createSpyObj('observer', ['next', 'error']);

		// Act
		subject.subscribe(observer);
		subject.next('a');
		subject.error(error);
		subject.next('b');

		// Assert
		expect(observer.next).toHaveBeenCalledOnceWith('a');
		expect(observer.error).toHaveBeenCalledOnceWith(error);
	});

	describe('Observable.from', () => {
		it('should not create a new observable multiple times for the same subject', () => {
			// Arrange
			const subject = new Subject();

			// Act
			const observable1 = Observable.from(subject);
			const observable2 = Observable.from(subject);

			// Assert
			expect(observable1).toBe(observable2);
		});

		it('should create a new observable multiple times for different subjects', () => {
			// Arrange
			const subject1 = new Subject();
			const subject2 = new Subject();

			// Act
			const observable1 = Observable.from(subject1);
			const observable2 = Observable.from(subject2);

			// Assert
			expect(observable1).not.toBe(observable2);
		});
	});

	describe('error thrown scenario', () => {
		it('should not synchronously error when nexted into', () => {
			// Arrange
			const source = new Subject<number>();
			const nextSpy = jasmine.createSpy<(value: number) => unknown>('next');
			nextSpy.and.throwError(new Error('Boom!'));

			// Act
			source.subscribe(nextSpy);

			// Assert
			expect(() => source.next(42)).not.toThrow();
		});
	});

	describe('many subscribers', () => {
		it('should be able to subscribe and abort huge amounts of subscribers', () => {
			// Arrange
			let numResultsReceived = 0;
			const controller = new AbortController();
			const source = new Subject<number>();
			const numSubscribers = 25_000;

			// Act
			for (let index = 0; index !== numSubscribers; ++index) {
				source.subscribe({
					signal: controller.signal,
					next: () => ++numResultsReceived,
				});
			}

			// Assert
			expect(numResultsReceived).toEqual(0);
			source.next(42);
			expect(numResultsReceived).toEqual(numSubscribers);
			controller.abort();
			expect(numResultsReceived).toEqual(numSubscribers);
			source.next(42);
			expect(numResultsReceived).toEqual(numSubscribers);
		});
	});

	describe('reentrant subscribers', () => {
		it('should handle reentrant subscribers', () => {
			// Arrange
			const seenValues: Array<number> = [];
			const source = new Subject<number>();

			// Act
			source.subscribe((value) => {
				seenValues.push(value);
				source.subscribe((nestedValue) => {
					seenValues.push(nestedValue);
				});
			});

			source.next(1);
			source.next(2);
			source.next(3);

			// Assert
			expect(seenValues).toEqual([1, 2, 2, 3, 3, 3]);
		});
	});
});
