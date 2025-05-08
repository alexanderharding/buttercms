import { Observable, Observer } from '../observable';
import { delay, of } from '../operators';
import { noop } from '../noop';
import { BroadcastSubject } from './broadcast-subject';

describe(BroadcastSubject.name, () => {
	it('should allow next with undefined when created with no type', (done: DoneFn) => {
		const subject = new BroadcastSubject('test');
		subject.subscribe({
			next: (x) => expect(x).toBeUndefined(),
			complete: done,
		});

		subject.next(undefined);
		subject.complete();
	});

	it('should allow empty next when created with no type', (done: DoneFn) => {
		const subject = new BroadcastSubject('test');
		subject.subscribe({
			next: (x) => expect(x).toBeUndefined(),
			complete: done,
		});

		subject.next();
		subject.complete();
	});

	it('should pump values right on through itself', (done: DoneFn) => {
		const subject = new BroadcastSubject<string>('test');
		const expected = ['foo', 'bar'];

		subject.subscribe({
			next: (x) => expect(x).toEqual(expected.shift()!),
			complete: done,
		});

		subject.next('foo');
		subject.next('bar');
		subject.complete();
	});

	it('should push values to multiple dispatchers', (done: DoneFn) => {
		const subject = new BroadcastSubject<string>('test');
		const expected = ['foo', 'bar'];

		let i = 0;
		let j = 0;

		subject.subscribe((x) => expect(x).toEqual(expected[i++]));

		subject.subscribe({
			next: (x) => expect(x).toEqual(expected[j++]),
			complete: done,
		});

		subject.next('foo');
		subject.next('bar');
		expect(i).toBe(2);
		expect(j).toBe(2);
		subject.complete();
	});

	it('should handle dispatchers that arrive and leave at different times but subject does not complete', () => {
		const subject = new BroadcastSubject<number>('test');
		const results1: Array<string | number> = [];
		const results2: Array<string | number> = [];
		const results3: Array<string | number> = [];

		subject.next(1);
		subject.next(2);
		subject.next(3);
		subject.next(4);

		const controller1 = new AbortController();
		subject.subscribe({
			signal: controller1.signal,
			next: (x) => results1.push(x),
			error: () => results1.push('E'),
			complete: () => results1.push('C'),
			finally: () => results1.push('F'),
		});

		subject.next(5);

		const controller2 = new AbortController();
		subject.subscribe({
			signal: controller2.signal,
			next: (x) => results2.push(x),
			error: () => results2.push('E'),
			complete: () => results2.push('C'),
			finally: () => results2.push('F'),
		});

		subject.next(6);
		subject.next(7);

		controller1.abort();

		subject.next(8);

		controller2.abort();

		subject.next(9);
		subject.next(10);

		const controller3 = new AbortController();
		subject.subscribe({
			signal: controller3.signal,
			next: (x) => results3.push(x),
			error: () => results3.push('E'),
			complete: () => results3.push('C'),
			finally: () => results3.push('F'),
		});

		subject.next(11);

		controller3.abort();

		expect(results1).toEqual([5, 6, 7, 'F']);
		expect(results2).toEqual([6, 7, 8, 'F']);
		expect(results3).toEqual([11, 'F']);
	});

	it('should handle dispatchers that arrive and leave at different times, subject completes', () => {
		const subject = new BroadcastSubject<number>('test');
		const results1: Array<string | number> = [];
		const results2: Array<string | number> = [];
		const results3: Array<string | number> = [];

		subject.next(1);
		subject.next(2);
		subject.next(3);
		subject.next(4);

		const controller1 = new AbortController();
		subject.subscribe({
			signal: controller1.signal,
			next: (x) => results1.push(x),
			error: () => results1.push('E'),
			complete: () => results1.push('C'),
			finally: () => results1.push('F'),
		});

		subject.next(5);

		const controller2 = new AbortController();
		subject.subscribe({
			signal: controller2.signal,
			next: (x) => results2.push(x),
			error: () => results2.push('E'),
			complete: () => results2.push('C'),
			finally: () => results2.push('F'),
		});

		subject.next(6);
		subject.next(7);

		controller1.abort();

		subject.complete();

		controller2.abort();

		const controller3 = new AbortController();
		subject.subscribe({
			signal: controller3.signal,
			next: (x) => results3.push(x),
			error: () => results3.push('E'),
			complete: () => results3.push('C'),
			finally: () => results3.push('F'),
		});

		controller3.abort();

		expect(results1).toEqual([5, 6, 7, 'F']);
		expect(results2).toEqual([6, 7, 'C', 'F']);
		expect(results3).toEqual(['C', 'F']);
	});

	it('should handle dispatchers that arrive and leave at different times, subject terminates with an error', () => {
		const subject = new BroadcastSubject<number>('test');
		const results1: Array<string | number> = [];
		const results2: Array<string | number> = [];
		const results3: Array<string | number> = [];

		subject.next(1);
		subject.next(2);
		subject.next(3);
		subject.next(4);

		const controller1 = new AbortController();
		subject.subscribe({
			signal: controller1.signal,
			next: (x) => results1.push(x),
			error: () => results1.push('E'),
			complete: () => results1.push('C'),
			finally: () => results1.push('F'),
		});

		subject.next(5);

		const controller2 = new AbortController();
		subject.subscribe({
			signal: controller2.signal,
			next: (x) => results2.push(x),
			error: () => results2.push('E'),
			complete: () => results2.push('C'),
			finally: () => results2.push('F'),
		});

		subject.next(6);
		subject.next(7);

		controller1.abort();

		subject.error(new Error('err'));

		controller2.abort();

		const controller3 = new AbortController();
		subject.subscribe({
			signal: controller3.signal,
			next: (x) => results3.push(x),
			error: () => results3.push('E'),
			complete: () => results3.push('C'),
			finally: () => results3.push('F'),
		});

		controller3.abort();

		expect(results1).toEqual([5, 6, 7, 'F']);
		expect(results2).toEqual([6, 7, 'E', 'F']);
		expect(results3).toEqual(['E', 'F']);
	});

	it('should handle dispatchers that arrive and leave at different times, subject completes before nexting any value', () => {
		const subject = new BroadcastSubject<number>('test');
		const results1: Array<string | number> = [];
		const results2: Array<string | number> = [];
		const results3: Array<string | number> = [];

		const controller1 = new AbortController();
		subject.subscribe({
			signal: controller1.signal,
			next: (x) => results1.push(x),
			error: () => results1.push('E'),
			complete: () => results1.push('C'),
			finally: () => results1.push('F'),
		});

		const controller2 = new AbortController();
		subject.subscribe({
			signal: controller2.signal,
			next: (x) => results2.push(x),
			error: () => results2.push('E'),
			complete: () => results2.push('C'),
			finally: () => results2.push('F'),
		});

		controller1.abort();

		subject.complete();

		controller2.abort();

		const controller3 = new AbortController();
		subject.subscribe({
			signal: controller3.signal,
			next: (x) => results3.push(x),
			error: () => results3.push('E'),
			complete: () => results3.push('C'),
			finally: () => results3.push('F'),
		});

		controller3.abort();

		expect(results1).toEqual(['F']);
		expect(results2).toEqual(['C', 'F']);
		expect(results3).toEqual(['C', 'F']);
	});

	it('should disallow new dispatcher once subject has been completed', () => {
		const subject = new BroadcastSubject<number>('test');
		const results1: Array<string | number> = [];
		const results2: Array<string | number> = [];
		const results3: Array<string | number> = [];

		const controller1 = new AbortController();
		subject.subscribe({
			signal: controller1.signal,
			next: (x) => results1.push(x),
			error: () => results1.push('E'),
			complete: () => results1.push('C'),
			finally: () => results1.push('F'),
		});

		subject.next(1);
		subject.next(2);

		const controller2 = new AbortController();
		subject.subscribe({
			signal: controller2.signal,
			next: (x) => results2.push(x),
			error: () => results2.push('E'),
			complete: () => results2.push('C'),
			finally: () => results2.push('F'),
		});

		subject.next(3);
		subject.next(4);
		subject.next(5);

		controller1.abort();
		controller2.abort();
		subject.complete();

		subject.subscribe({
			next: (x) => results3.push(x),
			error: () => results3.push('E'),
			complete: () => results3.push('C'),
			finally: () => results3.push('F'),
		});

		expect(subject.signal.aborted).toBeTrue();

		expect(results1).toEqual([1, 2, 3, 4, 5, 'F']);
		expect(results2).toEqual([3, 4, 5, 'F']);
		expect(results3).toEqual(['C', 'F']);
	});

	it('should be an Observer which can be given to Observable.subscribe', (done: DoneFn) => {
		const source = of(1, 2, 3, 4, 5);
		const subject = new BroadcastSubject<number>('test');
		const expected = [1, 2, 3, 4, 5];

		subject.subscribe({
			next: (x) => expect(x).toEqual(expected.shift()!),
			error: () => done.fail(new Error('should not be called')),
			complete: done,
		});

		source.subscribe(subject);
	});

	xit('should be usable as an Observer of a finite delayed Observable', (done: DoneFn) => {
		const source = of(1, 2, 3).pipe(delay(50));
		const subject = new BroadcastSubject<number>('test');

		const expected = [1, 2, 3];

		subject.subscribe({
			next: (x) => expect(x).toEqual(expected.shift()!),
			error: () => done.fail(new Error('should not be called')),
			complete: done,
		});

		source.subscribe(subject);
	});

	it('should be aborted after error', () => {
		const subject = new BroadcastSubject<string>('test');
		subject.error('bad');
		expect(subject.signal.aborted).toBeTrue();
	});

	it('should be aborted after complete', () => {
		const subject = new BroadcastSubject<string>('test');
		subject.complete();
		expect(subject.signal.aborted).toBeTrue();
	});

	it('should not next after completed', () => {
		const subject = new BroadcastSubject<string>('test');
		const results: Array<string> = [];
		subject.subscribe({
			next: (x) => results.push(x),
			complete: () => results.push('C'),
		});
		subject.next('a');
		subject.complete();
		subject.next('b');
		expect(results).toEqual(['a', 'C']);
	});

	it('should not next after error', () => {
		const error = new Error('wut?');
		const subject = new BroadcastSubject<string>('test');
		const results: Array<unknown> = [];
		subject.subscribe({
			next: (x) => results.push(x),
			error: (err) => results.push(err),
		});
		subject.next('a');
		subject.error(error);
		subject.next('b');
		expect(results).toEqual(['a', error]);
	});

	describe('asObservable', () => {
		it('should hide subject', () => {
			const subject = new BroadcastSubject('test');
			const observable = subject.asObservable();

			expect(observable instanceof Observable).toBeTrue();
			expect(observable instanceof BroadcastSubject).toBeFalse();
		});

		it('should not create a new observable multiple times for the same subject', () => {
			const subject = new BroadcastSubject('test');
			expect(subject.asObservable()).toBe(subject.asObservable());
		});

		it('should create a new observable multiple times for different subjects', () => {
			const subject1 = new BroadcastSubject('test');
			const subject2 = new BroadcastSubject('test');
			expect(subject1.asObservable()).not.toBe(subject2.asObservable());
		});
	});

	describe(BroadcastSubject.prototype.error.name, () => {
		it('should multicast an error to all observers', () => {
			// Arrange
			const error = new Error('test');
			const observer1 = jasmine.createSpyObj<Observer>('Observer', [
				'error',
				'complete',
				'next',
			]);
			const observer2 = jasmine.createSpyObj<Observer>('Observer', [
				'error',
				'complete',
				'next',
			]);
			const subject = new BroadcastSubject('test');

			// Act
			subject.error(error);

			// Assert
			expect(observer1.error).toHaveBeenCalledOnceWith(error);
			expect(observer1.error).toHaveBeenCalledBefore(observer2.error);
			expect(observer2.error).toHaveBeenCalledOnceWith(error);
			expect(observer1.complete).not.toHaveBeenCalled();
			expect(observer2.complete).not.toHaveBeenCalled();
			expect(observer1.next).not.toHaveBeenCalled();
			expect(observer2.next).not.toHaveBeenCalled();
		});

		it('should abort this subject before notifying observers', () => {
			// Arrange
			const abortSpy = jasmine.createSpy('abort');
			const error = new Error('test');
			const observer1 = jasmine.createSpyObj<Observer>('Observer', [
				'error',
				'complete',
				'next',
			]);
			const observer2 = jasmine.createSpyObj<Observer>('Observer', [
				'error',
				'complete',
				'next',
			]);
			const subject = new BroadcastSubject('test');
			subject.signal.addEventListener('abort', abortSpy, { once: true });

			// Act
			subject.error(error);

			// Assert
			expect(subject.signal.aborted).toBeTrue();
			expect(abortSpy).toHaveBeenCalledBefore(observer1.error);
			expect(abortSpy).toHaveBeenCalledBefore(observer2.error);
		});
	});

	describe(BroadcastSubject.prototype.complete.name, () => {
		it('should multicast a complete notification to all observers', () => {
			// Arrange
			const observer1 = jasmine.createSpyObj<Observer>('Observer', [
				'error',
				'complete',
				'next',
			]);
			const observer2 = jasmine.createSpyObj<Observer>('Observer', [
				'error',
				'complete',
				'next',
			]);
			const subject = new BroadcastSubject('test');

			// Act
			subject.complete();

			// Assert
			expect(observer1.complete).toHaveBeenCalledOnceWith();
			expect(observer1.complete).toHaveBeenCalledBefore(observer2.complete);
			expect(observer2.complete).toHaveBeenCalledOnceWith();
			expect(observer1.error).not.toHaveBeenCalled();
			expect(observer2.error).not.toHaveBeenCalled();
			expect(observer1.next).not.toHaveBeenCalled();
			expect(observer2.next).not.toHaveBeenCalled();
		});

		it('should abort this subject before notifying observers', () => {
			// Arrange
			const abortSpy = jasmine.createSpy('abort');
			const observer1 = jasmine.createSpyObj<Observer>('Observer', [
				'error',
				'complete',
				'next',
			]);
			const observer2 = jasmine.createSpyObj<Observer>('Observer', [
				'error',
				'complete',
				'next',
			]);
			const subject = new BroadcastSubject('test');
			subject.signal.addEventListener('abort', abortSpy, { once: true });

			// Act
			subject.complete();

			// Assert
			expect(subject.signal.aborted).toBeTrue();
			expect(abortSpy).toHaveBeenCalledBefore(observer1.complete);
			expect(abortSpy).toHaveBeenCalledBefore(observer2.complete);
		});
	});

	describe('error thrown scenario', () => {
		it('should not synchronously error when nexted into', (done: DoneFn) => {
			window.onerror = (err) => {
				if (typeof err === 'string') {
					expect(err).toBe('Uncaught Error: unhandledError');
					done();
					return;
				}
				done.fail('Expected an error');
			};

			const source = new BroadcastSubject<number>('test');
			source.subscribe(noop);
			source.subscribe(() => {
				throw new Error('Boom!');
			});
			source.subscribe(noop);
			expect(() => source.next(42)).not.toThrow();
		});
	});

	describe('many dispatchers', () => {
		it('should be able to subscribe and abort huge amounts of dispatchers', () => {
			let numResultsReceived = 0;
			const controller = new AbortController();
			const source = new BroadcastSubject<number>('test');
			const numDispatchers = 100_000;
			for (let index = 0; index !== numDispatchers; ++index) {
				source.subscribe({
					signal: controller.signal,
					// eslint-disable-next-line @typescript-eslint/no-loop-func
					next: () => ++numResultsReceived,
				});
			}
			expect(numResultsReceived).toEqual(0);
			source.next(42);
			expect(numResultsReceived).toEqual(numDispatchers);
			controller.abort();
			expect(numResultsReceived).toEqual(numDispatchers);
			source.next(42);
			expect(numResultsReceived).toEqual(numDispatchers);
		});
	});

	describe('reentrant dispatchers', () => {
		it('should handle reentrant dispatchers', () => {
			const seenValues: Array<number> = [];
			const source = new BroadcastSubject<number>('test');
			source.subscribe((value) => {
				seenValues.push(value);
				source.subscribe((nestedValue) => {
					seenValues.push(nestedValue);
				});
			});
			source.next(1);
			source.next(2);
			source.next(3);
			expect(seenValues).toEqual([1, 2, 2, 3, 3, 3]);
		});
	});
});
