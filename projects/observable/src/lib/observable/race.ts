import { empty } from './empty';
import { from, type ObservableInput, type ObservedValuesOf } from './from';
import { Observable } from './observable';

export function race<const Inputs extends ReadonlyArray<ObservableInput>>(
	...inputs: Inputs
): Observable<ObservedValuesOf<Inputs>[number]> {
	const { length: inputsLength } = inputs;

	if (inputsLength === 0) return empty;
	if (inputsLength === 1) return from(inputs[0]);

	return new Observable((subscriber) => {
		const controllers = new Map<number, AbortController>();
		for (let inputIndex = 0; shouldContinue(inputIndex); inputIndex++) {
			const controller = new AbortController();
			controllers.set(inputIndex, controller);

			// If the subscriber's signal aborts, abort this controller
			// with the same reason.
			subscriber.signal.addEventListener(
				'abort',
				() => controller.abort(subscriber.signal.reason),
				{ signal: subscriber.signal },
			);

			from(inputs[inputIndex]).subscribe({
				...subscriber,
				signal: controller.signal,
				next: (value: ObservedValuesOf<Inputs>[number]) => {
					if (controllers.size) finish(inputIndex);
					subscriber.next(value);
				},
			});
		}

		function finish(winningIndex: number): void {
			// We're still racing, but we won! So abort
			// all other subscriptions that we have, except this one.
			controllers.forEach((controller, controllerIndex) => {
				if (controllerIndex !== winningIndex) controller.abort();
			});
			controllers.clear();
		}

		function shouldContinue(inputIndex: number): boolean {
			return (
				!!controllers.size &&
				!subscriber.signal.aborted &&
				inputIndex < inputsLength
			);
		}
	});
}
