import { UnhandledError } from '../errors';
import { ConsumerObserver } from './consumer-observer';
import { ProducerObserver } from './producer-observer';

describe(ProducerObserver.name, () => {
	describe('constructor', () => {
		it('should create with next function', () => {
			// Arrange
			const next = jasmine.createSpy<(value: number) => unknown>('next');

			// Act
			const observer = new ProducerObserver(next);

			// Assert
			expect(observer.signal.aborted).toBeFalse();
			observer.next(1);
			expect(next).toHaveBeenCalledOnceWith(1);
		});

		it('should create with partial consumer observer', () => {
			// Arrange
			const consumerObserver = jasmine.createSpyObj<
				Partial<ConsumerObserver<number>>
			>('observer', ['next', 'error']);

			// Act
			const observer = new ProducerObserver(consumerObserver);

			// Assert
			expect(observer.signal.aborted).toBeFalse();
			observer.next(1);
			expect(consumerObserver.next).toHaveBeenCalledOnceWith(1);
		});

		it('should create with full consumer observer', () => {
			// Arrange
			const controller = new AbortController();
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver<number>>(
				'observer',
				['next', 'error', 'complete', 'finally'],
				{ signal: controller.signal },
			);

			// Act
			const observer = new ProducerObserver(consumerObserver);

			// Assert
			expect(observer.signal.aborted).toBeFalse();
			observer.next(1);
			observer.complete();
			expect(consumerObserver.next).toHaveBeenCalledOnceWith(1);
			expect(consumerObserver.complete).toHaveBeenCalledOnceWith();
			expect(consumerObserver.finally).toHaveBeenCalledOnceWith();
		});

		it('should abort when consumer signal is aborted', () => {
			// Arrange
			const reason = Symbol('reason');
			const controller = new AbortController();
			controller.abort(reason);
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver<number>>(
				'observer',
				['next', 'error', 'complete', 'finally'],
				{ signal: controller.signal },
			);

			// Act
			const observer = new ProducerObserver(consumerObserver);

			// Assert
			expect(observer.signal.aborted).toBeTrue();
			expect(observer.signal.reason).toEqual(jasmine.any(DOMException));
			expect(consumerObserver.finally).toHaveBeenCalledOnceWith();
			expect(consumerObserver.next).not.toHaveBeenCalled();
			expect(consumerObserver.error).not.toHaveBeenCalled();
			expect(consumerObserver.complete).not.toHaveBeenCalled();
		});

		it('should report unhandled error when finally handler throws', () => {
			// Arrange
			const throwError = new Error('finally handler threw');
			const queueMicrotaskSpy = spyOn(globalThis, 'queueMicrotask');
			const controller = new AbortController();
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver<number>>(
				'observer',
				['next', 'error', 'complete', 'finally'],
				{ signal: controller.signal },
			);
			consumerObserver.finally.and.throwError(throwError);
			controller.abort();

			// Act
			new ProducerObserver(consumerObserver);

			// Assert
			expect(queueMicrotaskSpy).toHaveBeenCalledTimes(1);
			const throwFn = queueMicrotaskSpy.calls.argsFor(0)[0] as () => void;
			expect(throwFn).toThrow(new UnhandledError({ cause: throwError }));
		});
	});

	describe('next', () => {
		it('should not emit when aborted', () => {
			// Arrange
			const controller = new AbortController();
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver<number>>(
				'observer',
				['error', 'finally', 'complete', 'next'],
				{ signal: controller.signal },
			);
			const observer = new ProducerObserver(consumerObserver);
			controller.abort();

			// Act
			observer.next(1);

			// Assert
			expect(consumerObserver.next).not.toHaveBeenCalled();
			expect(consumerObserver.error).not.toHaveBeenCalled();
			expect(consumerObserver.complete).not.toHaveBeenCalled();
			expect(consumerObserver.finally).toHaveBeenCalledOnceWith();
		});

		it('should call error when next throws', () => {
			// Arrange
			const error = new Error('test error');
			const nextSpy = jasmine.createSpy<(value: number) => unknown>('next');
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver<number>>(
				'observer',
				['error'],
			);
			const observer = new ProducerObserver({
				next: nextSpy,
				error: consumerObserver.error,
			});
			const errorSpy = spyOn(observer, 'error');
			nextSpy.and.throwError(error);

			// Act
			observer.next(1);

			// Assert
			expect(errorSpy).toHaveBeenCalledOnceWith(error);
		});
	});

	describe('error', () => {
		it('should be a noop when aborted', () => {
			// Arrange
			const controller = new AbortController();
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver>(
				'observer',
				['error', 'finally', 'complete', 'next'],
				{ signal: controller.signal },
			);
			const observer = new ProducerObserver(consumerObserver);
			controller.abort();
			consumerObserver.finally.calls.reset();

			// Act
			observer.error(new Error('test'));

			// Assert
			expect(consumerObserver.error).not.toHaveBeenCalled();
			expect(consumerObserver.finally).not.toHaveBeenCalled();
			expect(consumerObserver.complete).not.toHaveBeenCalled();
			expect(consumerObserver.next).not.toHaveBeenCalled();
		});

		it('should call handlers correctly when producer observer is not aborted', () => {
			// Arrange
			const error = new Error('test');
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver>(
				'observer',
				['error', 'finally', 'complete', 'next'],
			);
			const abortSpy = jasmine.createSpy<() => void>('abort');
			const producerObserver = new ProducerObserver(consumerObserver);
			producerObserver.signal.addEventListener('abort', abortSpy);

			// Act
			producerObserver.error(error);

			// Assert
			expect(abortSpy).toHaveBeenCalledTimes(1);
			expect(abortSpy).toHaveBeenCalledBefore(consumerObserver.error);
			expect(consumerObserver.error).toHaveBeenCalledOnceWith(error);
			expect(consumerObserver.error).toHaveBeenCalledBefore(
				consumerObserver.finally,
			);
			expect(consumerObserver.finally).toHaveBeenCalledOnceWith();
			expect(consumerObserver.complete).not.toHaveBeenCalled();
			expect(consumerObserver.next).not.toHaveBeenCalled();
		});

		it('should report unhandled error when error handler throws', () => {
			// Arrange
			const error = new Error('test');
			const throwError = new Error('error handler threw');
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver>(
				'observer',
				['error', 'finally'],
			);
			consumerObserver.error.and.throwError(throwError);
			const producerObserver = new ProducerObserver(consumerObserver);
			const queueMicrotaskSpy = spyOn(globalThis, 'queueMicrotask');

			// Act
			producerObserver.error(error);

			// Assert
			expect(queueMicrotaskSpy).toHaveBeenCalledTimes(1);
			const throwFn = queueMicrotaskSpy.calls.argsFor(0)[0];
			expect(throwFn).toThrow(new UnhandledError({ cause: throwError }));
		});

		it('should report unhandled error when finally handler throws', () => {
			// Arrange
			const error = new Error('test');
			const throwError = new Error('finally handler threw');
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver>(
				'observer',
				['error', 'finally'],
			);
			consumerObserver.finally.and.throwError(throwError);
			const producerObserver = new ProducerObserver(consumerObserver);
			const queueMicrotaskSpy = spyOn(globalThis, 'queueMicrotask');

			// Act
			producerObserver.error(error);

			// Assert
			expect(queueMicrotaskSpy).toHaveBeenCalledTimes(1);
			const throwFn = queueMicrotaskSpy.calls.argsFor(0)[0];
			expect(throwFn).toThrow(new UnhandledError({ cause: throwError }));
		});
	});

	describe('complete', () => {
		it('should be a noop when aborted', () => {
			// Arrange
			const controller = new AbortController();
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver>(
				'observer',
				['error', 'finally', 'complete', 'next'],
				{ signal: controller.signal },
			);
			const observer = new ProducerObserver(consumerObserver);
			controller.abort();
			consumerObserver.finally.calls.reset();

			// Act
			observer.complete();

			// Assert
			expect(consumerObserver.error).not.toHaveBeenCalled();
			expect(consumerObserver.finally).not.toHaveBeenCalled();
			expect(consumerObserver.complete).not.toHaveBeenCalled();
			expect(consumerObserver.next).not.toHaveBeenCalled();
		});

		it('should call handlers correctly when producer observer is not aborted', () => {
			// Arrange
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver>(
				'observer',
				['error', 'finally', 'complete', 'next'],
			);
			const abortSpy = jasmine.createSpy<() => void>('abort');
			const producerObserver = new ProducerObserver(consumerObserver);
			producerObserver.signal.addEventListener('abort', abortSpy);

			// Act
			producerObserver.complete();

			// Assert
			expect(abortSpy).toHaveBeenCalledTimes(1);
			expect(abortSpy).toHaveBeenCalledBefore(consumerObserver.complete);
			expect(consumerObserver.complete).toHaveBeenCalledOnceWith();
			expect(consumerObserver.complete).toHaveBeenCalledBefore(
				consumerObserver.finally,
			);
			expect(consumerObserver.finally).toHaveBeenCalledOnceWith();
			expect(consumerObserver.error).not.toHaveBeenCalled();
			expect(consumerObserver.next).not.toHaveBeenCalled();
		});

		it('should report unhandled error when complete handler throws', () => {
			// Arrange
			const throwError = new Error('complete handler threw');
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver>(
				'observer',
				['complete', 'finally'],
			);
			consumerObserver.complete.and.throwError(throwError);
			const producerObserver = new ProducerObserver(consumerObserver);
			const queueMicrotaskSpy = spyOn(globalThis, 'queueMicrotask');

			// Act
			producerObserver.complete();

			// Assert
			expect(queueMicrotaskSpy).toHaveBeenCalledTimes(1);
			const throwFn = queueMicrotaskSpy.calls.argsFor(0)[0] as () => void;
			expect(throwFn).toThrow(new UnhandledError({ cause: throwError }));
		});

		it('should report unhandled error when finally handler throws', () => {
			// Arrange
			const throwError = new Error('finally handler threw');
			const consumerObserver = jasmine.createSpyObj<ConsumerObserver>(
				'observer',
				['complete', 'finally'],
			);
			consumerObserver.finally.and.throwError(throwError);
			const producerObserver = new ProducerObserver(consumerObserver);
			const queueMicrotaskSpy = spyOn(globalThis, 'queueMicrotask');

			// Act
			producerObserver.complete();

			// Assert
			expect(queueMicrotaskSpy).toHaveBeenCalledTimes(1);
			const throwFn = queueMicrotaskSpy.calls.argsFor(0)[0] as () => void;
			expect(throwFn).toThrow(new UnhandledError({ cause: throwError }));
		});
	});
});
