import { Observable, Subscriber } from '../../observable';
import { UnaryFunction } from '../../pipe';
import { Subject } from '../../subject';
import { from, ObservableInput, ObservedValueOf } from '../creation';

export interface ShareConfig<Value = unknown> {
	/**
	 * The factory used to create the subject that will connect the source observable to
	 * multicast consumers.
	 */
	connector?: () => Subject<Value>;
	/**
	 * If `true`, the resulting observable will reset internal state on error from source and return to a "cold" state. This
	 * allows the resulting observable to be "retried" in the event of an error.
	 * If `false`, when an error comes from the source it will push the error into the connecting subject, and the subject
	 * will remain the connecting subject, meaning the resulting observable will not go "cold" again, and subsequent retries
	 * or resubscriptions will resubscribe to that same subject. In all cases, RxJS subjects will emit the same error again, however
	 * {@link ReplaySubject} will also push its buffered values before pushing the error.
	 * It is also possible to pass a notifier factory returning an `ObservableInput` instead which grants more fine-grained
	 * control over how and when the reset should happen. This allows behaviors like conditional or delayed resets.
	 */
	readonly resetOnError?: boolean | ((error: unknown) => ObservableInput);
	/**
	 * If `true`, the resulting observable will reset internal state on completion from source and return to a "cold" state. This
	 * allows the resulting observable to be "repeated" after it is done.
	 * If `false`, when the source completes, it will push the completion through the connecting subject, and the subject
	 * will remain the connecting subject, meaning the resulting observable will not go "cold" again, and subsequent repeats
	 * or resubscriptions will resubscribe to that same subject.
	 * It is also possible to pass a notifier factory returning an `ObservableInput` instead which grants more fine-grained
	 * control over how and when the reset should happen. This allows behaviors like conditional or delayed resets.
	 */
	readonly resetOnComplete?: boolean | (() => ObservableInput);
	/**
	 * If `true`, when the number of subscribers to the resulting observable reaches zero due to those subscribers unsubscribing, the
	 * internal state will be reset and the resulting observable will return to a "cold" state. This means that the next
	 * time the resulting observable is subscribed to, a new subject will be created and the source will be subscribed to
	 * again.
	 * If `false`, when the number of subscribers to the resulting observable reaches zero due to unsubscription, the subject
	 * will remain connected to the source, and new subscriptions to the result will be connected through that same subject.
	 * It is also possible to pass a notifier factory returning an `ObservableInput` instead which grants more fine-grained
	 * control over how and when the reset should happen. This allows behaviors like conditional or delayed resets.
	 */
	readonly resetOnRefCountZero?: boolean | (() => ObservableInput);
}

export function share<Input extends ObservableInput>(
	options?: ShareConfig<ObservedValueOf<Input>>,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>>;
export function share<Input extends ObservableInput>({
	connector = () => new Subject(),
	resetOnError = true,
	resetOnComplete = true,
	resetOnRefCountZero = true,
}: ShareConfig<ObservedValueOf<Input>> = {}): UnaryFunction<
	Input,
	Observable<ObservedValueOf<Input>>
> {
	return (source) => {
		let refCount = 0;
		let subject: Subject<ObservedValueOf<Input>> | undefined;
		let hasCompleted = false;
		let hasErrored = false;
		let controller: AbortController | undefined;
		let resetController: AbortController | undefined;

		return new Observable((subscriber) => {
			refCount++;

			if (!hasErrored && !hasCompleted) cancelReset();

			// Create the subject if we don't have one yet. Grab a local reference to
			// it as well, which avoids non-null assertions when using it and, if we
			// connect to it now, then error/complete need a reference after it was
			// reset.
			const destination = (subject = subject ?? connector());

			new Subscriber({
				signal: subscriber.signal,
				finally() {
					// If we're resetting on refCount === 0, and it's 0, we only want to do
					// that on "unsubscribe", really. Resetting on error or completion is a different
					// configuration.
					if (--refCount !== 0 || hasErrored || hasCompleted) return;
					resetController = handleReset(
						resetAndUnsubscribe,
						resetOnRefCountZero,
					);
				},
			});

			destination.subscribe(subscriber);

			// Check this share is still active - it can be reset to 0
			// and be "unsubscribed" _before_ it actually subscribes.
			// If we were to subscribe then, it'd leak and get stuck.
			if (controller || refCount <= 0) return;
			from(source).subscribe({
				...destination,
				signal: (controller = new AbortController()).signal,
				error(error) {
					hasErrored = true;
					cancelReset();
					resetController = handleReset(reset, resetOnError, error);
					destination.error(error);
				},
				complete() {
					hasCompleted = true;
					cancelReset();
					resetController = handleReset(reset, resetOnComplete);
					destination.complete();
				},
			});
		});

		function reset(): void {
			cancelReset();
			controller = subject = undefined;
			hasCompleted = hasErrored = false;
		}

		function resetAndUnsubscribe(): void {
			// We need to capture the controller before
			// we reset (if we need to reset).
			const controllerRef = controller;
			reset();
			controllerRef?.abort();
		}

		function cancelReset(): void {
			resetController?.abort();
			resetController = undefined;
		}
	};
}

function handleReset<T extends Array<unknown> = Array<never>>(
	reset: () => void,
	on: boolean | ((...args: T) => ObservableInput),
	...args: T
): AbortController | undefined {
	if (on === true) {
		reset();
		return;
	}

	if (on === false) return;

	const controller = new AbortController();

	from(on(...args)).subscribe({
		signal: controller.signal,
		next() {
			controller.abort();
			reset();
		},
	});

	return controller;
}
