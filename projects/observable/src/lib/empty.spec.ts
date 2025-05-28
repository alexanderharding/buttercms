import { Observer } from './observer/observer';
import { empty } from './empty';

describe('empty', () => {
	it('should complete immediately when subscribed to without a signal', () => {
		// Arrange
		const observer = jasmine.createSpyObj<Observer<never>>('observer', [
			'next',
			'error',
			'complete',
			'finally',
		]);

		// Act
		empty.subscribe(observer);

		// Assert
		expect(observer.next).not.toHaveBeenCalled();
		expect(observer.error).not.toHaveBeenCalled();
		expect(observer.complete).toHaveBeenCalledOnceWith();
		expect(observer.finally).toHaveBeenCalledOnceWith();
	});

	it('should not complete when subscribed to with an aborted signal', () => {
		// Arrange
		const controller = new AbortController();
		controller.abort();
		const observer = jasmine.createSpyObj<Observer<never>>(
			'observer',
			['next', 'error', 'complete', 'finally'],
			{ signal: controller.signal },
		);

		// Act
		empty.subscribe(observer);

		// Assert
		expect(observer.next).not.toHaveBeenCalled();
		expect(observer.error).not.toHaveBeenCalled();
		expect(observer.complete).not.toHaveBeenCalled();
		expect(observer.finally).toHaveBeenCalledOnceWith();
	});

	it('should complete when subscribed to with a non-aborted signal', () => {
		// Arrange
		const controller = new AbortController();
		const observer = jasmine.createSpyObj<Observer<never>>(
			'observer',
			['next', 'error', 'complete', 'finally'],
			{ signal: controller.signal },
		);

		// Act
		empty.subscribe(observer);

		// Assert
		expect(observer.next).not.toHaveBeenCalled();
		expect(observer.error).not.toHaveBeenCalled();
		expect(observer.complete).toHaveBeenCalledOnceWith();
		expect(observer.finally).toHaveBeenCalledOnceWith();
	});
});
