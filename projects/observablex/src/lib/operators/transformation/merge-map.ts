import { Observable } from '../../observable';
import { from, ObservableInput, ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';

export function mergeMap<T extends ObservableInput<ObservableInput>>(
	concurrent?: number,
): UnaryFunction<T, Observable<ObservedValueOf<ObservedValueOf<T>>>>;
export function mergeMap<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	project: (value: ObservedValueOf<In>, index: number) => Out,
	concurrent?: number,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>>;
export function mergeMap<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	projectOrConcurrent?:
		| ((value: ObservedValueOf<In>, index: number) => Out)
		| number,
	concurrent = typeof projectOrConcurrent === 'number'
		? projectOrConcurrent
		: Infinity,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>> {
	return (source) =>
		new Observable((observer) => {
			// The number of active inner subscriptions.
			let active = 0;
			// An index to pass to our accumulator function
			let index = 0;
			// Whether or not the outer source has completed.
			let isOuterComplete = false;

			const project = ensureProject(projectOrConcurrent);
			const buffer: Array<ObservedValueOf<In>> = [];
			concurrent = Math.max(concurrent, 1);

			from(source).subscribe({
				...observer,
				next: outerNext,
				complete: outerComplete,
				finally: outerFinally,
			});

			function doInnerSub(value: ObservedValueOf<In>): void {
				// Increment the number of active subscriptions so we can track it
				// against our concurrency limit later.
				active++;

				// A flag used to show that the inner observable completed.
				// This is checked during finalization to see if we should
				// move to the next item in the buffer, if there is one.
				let isInnerComplete = false;

				from(project(value, index++)).subscribe({
					...observer,
					complete: innerComplete,
					finally: innerFinally,
				});

				function innerComplete(): void {
					// Flag that we have completed, so we know to check the buffer
					// during finalization.
					isInnerComplete = true;
				}

				function innerFinally(): void {
					// During finalization, if the inner completed (it wasn't errored or
					// cancelled), then we want to try the next item in the buffer if
					// there is one.
					if (!isInnerComplete) return;
					// We have to wrap this in a try/catch because it happens during
					// finalization, possibly asynchronously, and we want to pass
					// any errors that happen (like in a projection function) to
					// the outer ProducerObserver.
					try {
						// Decrement the active count to ensure that the next time
						// we try to call `doInnerSub`, the number is accurate.
						active--;
						// If we have more values in the buffer, try to process those
						// Note that this call will increment `active` ahead of the
						// next conditional, if there were any more inner subscriptions
						// to start.
						checkBuffer();
						// Check to see if we can complete, and complete if so.
						checkComplete();
					} catch (err) {
						observer.error(err);
					}
				}
			}

			function outerNext(value: ObservedValueOf<In>): void {
				active < concurrent ? doInnerSub(value) : buffer.push(value);
			}

			function outerComplete(): void {
				isOuterComplete = true;
				checkComplete();
			}

			function outerFinally(): void {
				if (!isOuterComplete) buffer.length = 0;
			}

			function checkComplete(): void {
				if (isOuterComplete && !buffer.length && !active) observer.complete();
			}

			function checkBuffer(): void {
				while (buffer.length && active < concurrent) {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
					outerNext(buffer.shift()!);
				}
			}
		});
}

/** @internal */
function ensureProject<In extends ObservableInput, Out extends ObservableInput>(
	mapFnOrConcurrent?:
		| ((value: ObservedValueOf<In>, index: number) => Out)
		| number,
): (value: ObservedValueOf<In>, index: number) => Out;
function ensureProject(
	mapFnOrConcurrent?:
		| ((value: ObservableInput, index: number) => ObservableInput)
		| number,
): (value: ObservableInput, index: number) => unknown {
	return typeof mapFnOrConcurrent === 'function'
		? mapFnOrConcurrent
		: (value) => value;
}
