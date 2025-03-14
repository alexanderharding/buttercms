import { Observable } from '../observable/observable';
import { Subject } from '../subject/subject';
import { from, ObservableInput, ObservedValueOf } from '../observable/from';
import { UnaryFunction } from '../pipe/unary-function';
import { of } from '../observable/of';
import { ReplaySubject } from '../subject/replay-subject';
import { catchError } from './catch-error';
import { pipe } from '../pipe/pipe';
import { Subscriber } from 'subscriber';

export function connect<Input extends ObservableInput>(
	connector?: (
		source: Observable<ObservedValueOf<Input>>,
	) => Subject<ObservedValueOf<Input>>,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (input) => connectable(input, connector);
}

export function connectable<Input extends ObservableInput>(
	input: Input,
	connector: (
		source: Observable<ObservedValueOf<Input>>,
	) => Subject<ObservedValueOf<Input>> = () => new Subject(),
): Observable<ObservedValueOf<Input>> {
	return new Observable((subscriber) => {
		if (subscriber.signal.aborted) return;
		const source = from(input);
		const subject = connector(source);
		subject.subscribe(subscriber);
		source.subscribe(subject);
	});
}

export interface ShareConfig<T> {
	/**
	 * The factory used to create the subject that will connect the source observable to
	 * multicast consumers.
	 */
	connector?: () => Subject<T>;
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
	resetOnError?: boolean | ((error: any) => ObservableInput<any>);
	/**
	 * If `true`, the resulting observable will reset internal state on completion from source and return to a "cold" state. This
	 * allows the resulting observable to be "repeated" after it is done.
	 * If `false`, when the source completes, it will push the completion through the connecting subject, and the subject
	 * will remain the connecting subject, meaning the resulting observable will not go "cold" again, and subsequent repeats
	 * or resubscriptions will resubscribe to that same subject.
	 * It is also possible to pass a notifier factory returning an `ObservableInput` instead which grants more fine-grained
	 * control over how and when the reset should happen. This allows behaviors like conditional or delayed resets.
	 */
	resetOnComplete?: boolean | (() => ObservableInput<any>);
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
	resetOnRefCountZero?: boolean | (() => ObservableInput<any>);
}

export function share<Input extends ObservableInput>(
	connector: () => Subject<ObservedValueOf<Input>>,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (input) => {
		let active = 0;
		let subject: Subject<ObservedValueOf<Input>> | undefined;
		let controller: AbortController | null;
		let hasCompleted = false;
		let hasErrored = false;
		let connection: Subscriber<ObservedValueOf<Input>> | undefined;
		let resetController: AbortController | undefined;

		const source = connectable(from(input), connector);
		return new Observable((subscriber) => {
			if (subscriber.signal.aborted) return;

			active++;

			if (!hasErrored && !hasCompleted) cancelReset();

			// Create the subject if we don't have one yet. Grab a local reference to
			// it as well, which avoids non-null assertions when using it and, if we
			// connect to it now, then error/complete need a reference after it was
			// reset.
			const dest = (subject = subject ?? connector());

			new Subscriber({
				signal: subscriber.signal,
				finalize: () => {
					active--;

					// If we're resetting on refCount === 0, and it's 0, we only want to do
					// that on "unsubscribe", really. Resetting on error or completion is a different
					// configuration.
					if (active === 0 && !hasErrored && !hasCompleted) {
						resetController = handleReset(resetAndUnsubscribe, true);
					}
				},
			});

			dest.subscribe(subscriber);

			if (
				!connection &&
				// Check this shareReplay is still activate - it can be reset to 0
				// and be "unsubscribed" _before_ it actually subscribes.
				// If we were to subscribe then, it'd leak and get stuck.
				active > 0
			) {
				// We need to create a subscriber here - rather than pass an observer and
				// assign the returned subscription to connection - because it's possible
				// for reentrant subscriptions to the shared observable to occur and in
				// those situations we want connection to be already-assigned so that we
				// don't create another connection to the source.
				connection = new Subscriber({
					signal: setController(new AbortController()).signal,
					next: (value) => dest.next(value),
					error: (err) => {
						hasErrored = true;
						cancelReset();
						resetController = handleReset(reset, true, err);
						dest.error(err);
					},
					complete: () => {
						hasCompleted = true;
						cancelReset();
						resetController = handleReset(reset, true);
						dest.complete();
					},
				});
				from(source).subscribe(connection);
			}
		});

		function setController<Value extends AbortController | null>(
			value: Value,
		): Value {
			controller?.abort();
			controller = value;
			return value;
		}

		function reset(): void {
			cancelReset();
			connection = subject = undefined;
			hasCompleted = hasErrored = false;
		}

		function resetAndUnsubscribe(): void {
			// We need to capture the connection before
			// we reset (if we need to reset).
			const conn = connection;
			reset();
			conn?.complete();
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
) {
	if (on === true) {
		reset();
		return;
	}

	if (on === false) {
		return;
	}

	const controller = new AbortController();
	const onSubscriber = new Subscriber({
		signal: controller.signal,
		next: () => {
			controller.abort();
			reset();
		},
	});

	from(on(...args)).subscribe(onSubscriber);

	return controller;
}

export function shareReplay<Input extends ObservableInput>(
	count?: number,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return pipe(
		share(() => new ReplaySubject(count)),
		keepAlive(),
	);
}

export function keepAlive<Input extends ObservableInput>(): UnaryFunction<
	Input,
	Observable<ObservedValueOf<Input>>
> {
	return (input) =>
		new Observable((subscriber) =>
			from(input).subscribe({ ...subscriber, signal: undefined }),
		);
}

export function retry<Input extends ObservableInput>(): UnaryFunction<
	Input,
	Observable<ObservedValueOf<Input>>
> {
	return catchError((_, caught) => caught);
}

export function repeat<Input extends ObservableInput>(): UnaryFunction<
	Input,
	Observable<ObservedValueOf<Input>>
> {
	return (input) =>
		new Observable((subscriber) => {
			init();

			function init(): void {
				if (subscriber.signal.aborted) return;
				from(input).subscribe({ ...subscriber, complete: init });
			}
		});
}

export function refCount(): UnaryFunction<ObservableInput, Observable<number>> {
	return (input) =>
		new Observable((subscriber) => {
			const source = from(input);
			const subject = connectable(source);
			source.subscribe(subject);
			subject.subscribe(subscriber);
		});
}
