import { BroadcastChannelSubject } from './broadcast-channel-subject';
import { retry } from 'rxjs';

describe(BroadcastChannelSubject.name, () => {
	let name: string;
	let subject: BroadcastChannelSubject;

	beforeEach(() => {
		name = crypto.randomUUID();
		subject = new BroadcastChannelSubject(name);
	});

	afterEach(() => {
		subject.complete();
	});

	describe('closed', () => {
		it('should be set to false initially', () => {
			expect(subject.closed).toBeFalse();
		});
	});

	describe(BroadcastChannelSubject.prototype.complete.name, () => {
		it('should close the channel and subject', () => {
			// Arrange
			const sender = new BroadcastChannel(name);

			// Act
			subject.complete();

			// Assert
			let didEmit = false;
			let didComplete = false;
			const subscription = subject.subscribe({
				next: () => (didEmit = true),
				complete: () => (didComplete = true),
			});
			sender.postMessage(undefined);
			subscription.unsubscribe();
			expect(subject.closed).toBeTrue();
			expect(didComplete).toBeTrue();
			expect(didEmit).toBeFalse();
			sender.close(); // cleanup
		});

		it('should not throw when called twice', () => {
			// Arrange
			subject.complete();

			// Act / Assert
			expect(() => subject.complete()).not.toThrow();
		});

		it('should not emit an error when called twice', () => {
			// Arrange
			subject.complete();

			// Act
			let didError = false;
			const subscription = subject.subscribe({
				error: () => (didError = true),
			});
			subject.complete();
			subscription.unsubscribe();

			// Assert
			expect(didError).toBeFalse();
		});
	});

	describe(BroadcastChannelSubject.prototype.next.name, () => {
		it('should post message', async () => {
			// Arrange
			const onMessageSpy = jasmine.createSpy();
			const onMessageErrorSpy = jasmine.createSpy();
			const receiver = new BroadcastChannel(name);
			const promise = new Promise((resolve) => {
				onMessageSpy.and.callFake(resolve);
				onMessageErrorSpy.and.callFake(resolve);
			});
			receiver.onmessage = onMessageSpy;
			receiver.onmessageerror = onMessageErrorSpy;

			// Act
			subject.next();
			await promise;

			// Assert
			expect(receiver.onmessage).toHaveBeenCalledOnceWith(
				jasmine.any(MessageEvent),
			);
			expect(onMessageErrorSpy).not.toHaveBeenCalled();
			receiver.close(); // cleanup
		});
	});

	describe(BroadcastChannelSubject.prototype.error.name, () => {
		it('should pass error to the notifier without created a new one if closed', () => {
			// Arrange
			const errorMock = new Error('test');
			const value = subject.pipe(retry(1)); // If retry fails, it is because a new notifier was not created.
			spyOnProperty(subject, 'closed', 'get').and.returnValue(true);

			// Act
			let error: unknown;
			const subscription = value.subscribe({
				error: (e: unknown) => (error = e),
			});
			subject.error(errorMock);
			subscription.unsubscribe();

			// Assert
			expect(error).toEqual(errorMock);
		});

		it('should pass error to the current notifier if open', () => {
			// Arrange
			const errorMock = new Error('test');
			spyOnProperty(subject, 'closed', 'get').and.returnValue(true);

			// Act
			let error: unknown;
			const subscription = subject.subscribe({
				error: (e: unknown) => (error = e),
			});
			subject.error(errorMock);
			subscription.unsubscribe();

			// Assert
			expect(error).toEqual(errorMock);
		});

		it('should created a new notifier if open', () => {
			// Arrange
			const errorMock = new Error('test');
			const value = subject.pipe(retry(1)); // If retry fails, it is because a new notifier was not created.
			spyOnProperty(subject, 'closed', 'get').and.returnValue(false);

			// Act
			let didError = false;
			const subscription = value.subscribe({
				error: () => (didError = true),
			});
			subject.error(errorMock);
			subscription.unsubscribe();

			// Assert
			expect(didError).toBeFalse();
		});
	});
});
