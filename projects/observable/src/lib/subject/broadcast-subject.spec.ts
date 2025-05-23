import { ConsumerObserver, Observable } from '../observable';
import { of } from '../operators/creation';
import { BroadcastSubject } from './broadcast-subject';

describe(BroadcastSubject.name, () => {
	let postMessageSpy: jasmine.Spy<(message: unknown) => void>;
	let channelCloseSpy: jasmine.Spy<() => void>;

	beforeEach(() => {
		postMessageSpy = spyOn(
			globalThis.BroadcastChannel.prototype,
			'postMessage',
		);
		channelCloseSpy = spyOn(globalThis.BroadcastChannel.prototype, 'close');
	});

	afterEach(() => {
		postMessageSpy.and.callThrough();
		channelCloseSpy.and.callThrough();
	});

	it('should receive messages from other subjects with same name', (done) => {
		// Arrange
		const value = Math.random().toString();
		const subject = new BroadcastSubject<string>('test');
		const otherSubject = new BroadcastSubject<string>('test');
		postMessageSpy.and.callThrough();
		subject.subscribe((v) => {
			// Assert
			expect(v).toBe(value);
			done();
		});

		// Act
		otherSubject.next(value);
	});

	describe('next', () => {
		it('should call postMessage method on BroadcastChannel', () => {
			// Arrange
			const subject = new BroadcastSubject<string>('test');

			// Act
			subject.next('foo');

			// Assert
			expect(postMessageSpy).toHaveBeenCalledOnceWith('foo');
		});

		it('should not abort signal', () => {
			// Arrange
			const subject = new BroadcastSubject<string>('test');

			// Act
			subject.next('foo');

			// Assert
			expect(subject.signal.aborted).toBeFalse();
		});

		it('should not close channel', () => {
			// Arrange
			const subject = new BroadcastSubject<string>('test');

			// Act
			subject.next('foo');

			// Assert
			expect(channelCloseSpy).not.toHaveBeenCalled();
		});

		it('should not pass through this subject', () => {
			// Arrange
			const subject = new BroadcastSubject<string>('test');
			const observer = jasmine.createSpyObj<ConsumerObserver<string>>(
				'observer',
				['next', 'error', 'complete', 'finally'],
			);
			subject.subscribe(observer);

			// Act
			subject.next('foo');

			// Assert
			expect(observer.next).not.toHaveBeenCalled();
			expect(observer.error).not.toHaveBeenCalled();
			expect(observer.complete).not.toHaveBeenCalled();
			expect(observer.finally).not.toHaveBeenCalled();
		});

		it('should not call postMessage method on BroadcastChannel when signal is aborted', () => {
			// Arrange
			const subject = new BroadcastSubject<string>('test');
			spyOnProperty(subject, 'signal', 'get').and.returnValue({
				aborted: true,
				addEventListener: () => {},
				dispatchEvent: () => false,
				removeEventListener: () => {},
				reason: null,
				throwIfAborted: () => {},
				onabort: () => {},
			});

			// Act
			subject.next('foo');

			// Assert
			expect(postMessageSpy).not.toHaveBeenCalled();
		});

		it('should be an Observer which can be given to Observable.subscribe', () => {
			// Arrange
			const source = of(1, 2, 3, 4, 5);
			const subject = new BroadcastSubject<number>('test');
			const observer = jasmine.createSpyObj<ConsumerObserver<number>>(
				'observer',
				['complete', 'error', 'finally', 'next'],
			);

			// Act
			subject.subscribe(observer);
			source.subscribe(subject);

			// Assert
			expect(postMessageSpy.calls.allArgs()).toEqual([[1], [2], [3], [4], [5]]);
			expect(observer.complete).toHaveBeenCalledOnceWith();
			expect(observer.error).not.toHaveBeenCalled();
			expect(observer.finally).toHaveBeenCalledOnceWith();
		});

		it('should emit error when postMessage method on BroadcastChannel throws an error', () => {
			// Arrange
			const error = new Error('test error');
			const subject = new BroadcastSubject<string>('test');
			const errorSpy = spyOn(subject, 'error');
			postMessageSpy.and.throwError(error);

			// Act
			subject.next('foo');

			// Assert
			expect(errorSpy).toHaveBeenCalledOnceWith(error);
		});
	});

	describe('error', () => {
		it('should pass through this subject', () => {
			// Arrange
			const error = new Error('test error');
			const subject = new BroadcastSubject<string>('test');
			const observer = jasmine.createSpyObj<ConsumerObserver<string>>(
				'observer',
				['error', 'complete', 'finally', 'next'],
			);
			subject.subscribe(observer);

			// Act
			subject.error(error);

			// Assert
			expect(observer.error).toHaveBeenCalledOnceWith(error);
		});

		it('should close channel', () => {
			// Arrange
			const error = new Error('test error');
			const subject = new BroadcastSubject<string>('test');

			// Act
			subject.error(error);

			// Assert
			expect(channelCloseSpy).toHaveBeenCalledOnceWith();
		});

		it('should abort signal', () => {
			// Arrange
			const error = new Error('test error');
			const subject = new BroadcastSubject<string>('test');

			// Act
			subject.error(error);

			// Assert
			expect(subject.signal.aborted).toBeTrue();
		});

		it('should abort signal before notifying subscribers', () => {
			// Arrange
			const abortHandlerSpy = jasmine.createSpy<(event: Event) => void>();
			const error = new Error('test error');
			const subject = new BroadcastSubject<string>('test');
			const observer = jasmine.createSpyObj<ConsumerObserver<string>>(
				'observer',
				['error'],
			);
			subject.signal.addEventListener('abort', abortHandlerSpy);
			subject.subscribe(observer);

			// Act
			subject.error(error);

			// Assert
			expect(abortHandlerSpy).toHaveBeenCalledOnceWith(jasmine.any(Event));
			expect(abortHandlerSpy).toHaveBeenCalledBefore(observer.error);
			expect(observer.error).toHaveBeenCalledOnceWith(error);
		});
	});

	describe('complete', () => {
		it('should notify subscribers', () => {
			// Arrange
			const subject = new BroadcastSubject<string>('test');
			const observer = jasmine.createSpyObj<ConsumerObserver<string>>(
				'observer',
				['complete'],
			);
			subject.subscribe(observer);

			// Act
			subject.complete();

			// Assert
			expect(observer.complete).toHaveBeenCalledOnceWith();
		});

		it('should close channel', () => {
			// Arrange
			const subject = new BroadcastSubject<string>('test');

			// Act
			subject.complete();

			// Assert
			expect(channelCloseSpy).toHaveBeenCalledOnceWith();
		});

		it('should abort signal', () => {
			// Arrange
			const subject = new BroadcastSubject<string>('test');

			// Act
			subject.complete();

			// Assert
			expect(subject.signal.aborted).toBeTrue();
		});

		it('should abort signal before notifying subscribers', () => {
			// Arrange
			const abortHandlerSpy = jasmine.createSpy<(event: Event) => void>();
			const subject = new BroadcastSubject<string>('test');
			const observer = jasmine.createSpyObj<ConsumerObserver<string>>(
				'observer',
				['complete'],
			);
			subject.signal.addEventListener('abort', abortHandlerSpy);
			subject.subscribe(observer);

			// Act
			subject.complete();

			// Assert
			expect(abortHandlerSpy).toHaveBeenCalledOnceWith(jasmine.any(Event));
			expect(abortHandlerSpy).toHaveBeenCalledBefore(observer.complete);
			expect(observer.complete).toHaveBeenCalledOnceWith();
		});
	});

	describe('asObservable', () => {
		it('should hide subject', () => {
			// Arrange
			const subject = new BroadcastSubject('test');

			// Act
			const observable = subject.asObservable();

			// Assert
			expect(observable instanceof Observable).toBeTrue();
			expect(observable instanceof BroadcastSubject).toBeFalse();
		});

		it('should not create a new observable multiple times for the same subject', () => {
			// Arrange
			const subject = new BroadcastSubject('test');

			// Act
			const observable1 = subject.asObservable();
			const observable2 = subject.asObservable();

			// Assert
			expect(observable1).toBe(observable2);
		});

		it('should create a new observable multiple times for different subjects', () => {
			// Arrange
			const subject1 = new BroadcastSubject('test1');
			const subject2 = new BroadcastSubject('test2');

			// Act
			const observable1 = subject1.asObservable();
			const observable2 = subject2.asObservable();

			// Assert
			expect(observable1).not.toBe(observable2);
		});
	});
});
