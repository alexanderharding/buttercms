import { ConsumerObserver } from './consumer-observer';
import { never } from './never';

describe('never', () => {
	it('should not emit when subscribed to without a signal', () => {
		// Arrange
		const observer = jasmine.createSpyObj<ConsumerObserver<never>>('observer', [
			'next',
			'error',
			'complete',
			'finally',
		]);

		// Act
		never.subscribe(observer);

		// Assert
		expect(observer.next).not.toHaveBeenCalled();
		expect(observer.error).not.toHaveBeenCalled();
		expect(observer.complete).not.toHaveBeenCalled();
		expect(observer.finally).not.toHaveBeenCalled();
	});

	it('should not emit when subscribed to with an aborted signal', () => {
		// Arrange
		const controller = new AbortController();
		controller.abort();
		const observer = jasmine.createSpyObj<ConsumerObserver<never>>(
			'observer',
			['next', 'error', 'complete', 'finally'],
			{ signal: controller.signal },
		);

		// Act
		never.subscribe(observer);

		// Assert
		expect(observer.next).not.toHaveBeenCalled();
		expect(observer.error).not.toHaveBeenCalled();
		expect(observer.complete).not.toHaveBeenCalled();
		expect(observer.finally).toHaveBeenCalledOnceWith();
	});

	it('should not emit when subscribed to with a non-aborted signal', () => {
		// Arrange
		const controller = new AbortController();
		const observer = jasmine.createSpyObj<ConsumerObserver<never>>(
			'observer',
			['next', 'error', 'complete', 'finally'],
			{ signal: controller.signal },
		);

		// Act
		never.subscribe(observer);

		// Assert
		expect(observer.next).not.toHaveBeenCalled();
		expect(observer.error).not.toHaveBeenCalled();
		expect(observer.complete).not.toHaveBeenCalled();
		expect(observer.finally).not.toHaveBeenCalled();
	});
});
