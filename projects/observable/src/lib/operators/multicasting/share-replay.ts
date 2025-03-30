import { Observable } from '../../observable';
import { UnaryFunction } from '../../pipe';
import { ReplaySubject } from '../../subject';
import { ObservableInput, ObservedValueOf } from '../creation';
import { share } from './share';

export interface ShareReplayConfig {
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
	readonly resetOnRefCountZero: boolean | (() => ObservableInput);
	/**
	 * The size of the buffer used to store the values emitted by the source Observable.
	 */
	readonly bufferSize?: number;
}

export function shareReplay<T extends ObservableInput>(
	config: ShareReplayConfig,
): UnaryFunction<T, Observable<ObservedValueOf<T>>>;
export function shareReplay<T extends ObservableInput>(
	bufferSize?: number,
): UnaryFunction<T, Observable<ObservedValueOf<T>>>;
export function shareReplay<T extends ObservableInput>(
	configOrBufferSize?: ShareReplayConfig | number,
): UnaryFunction<T, Observable<ObservedValueOf<T>>>;
export function shareReplay<T extends ObservableInput>(
	configOrBufferSize?: ShareReplayConfig | number,
): UnaryFunction<T, Observable<ObservedValueOf<T>>> {
	const { bufferSize, resetOnRefCountZero = false } =
		configOrBufferSize && typeof configOrBufferSize === 'object'
			? configOrBufferSize
			: { bufferSize: configOrBufferSize };
	return share({
		connector: () => new ReplaySubject(bufferSize),
		resetOnError: true,
		resetOnComplete: false,
		resetOnRefCountZero,
	});
}
