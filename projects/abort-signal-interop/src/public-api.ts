/**
 * @returns an {@linkcode AbortSignal} that will abort if any of the given signals abort or are already aborted.
 */
export function any(...signals: ReadonlyArray<AbortSignal>): AbortSignal {
	const controller = new AbortController();
	for (const signal of signals) {
		if (signal.aborted) {
			controller.abort(signal.reason);
			break;
		} else {
			signal.addEventListener('abort', () => controller.abort(signal.reason), {
				signal: controller.signal,
			});
		}
	}
	return controller.signal;
}

export function multiplex(
	controllers: ReadonlyArray<AbortController>,
): AbortController {
	const controller = new AbortController();
	for (const controller of controllers) {
		if (controller.signal.aborted) {
			controller.abort(controller.signal.reason);
			break;
		} else {
			controller.signal.addEventListener(
				'abort',
				() => controller.abort(controller.signal.reason),
				{ signal: controller.signal },
			);
		}
	}
	return controller;
}

export function abortController(parent: AbortController): AbortController {
	const controller = new AbortController();
	parent.signal.addEventListener(
		'abort',
		() => controller.abort(parent.signal.reason),
		{ signal: controller.signal },
	);
	if (parent.signal.aborted) controller.abort(parent.signal.reason);
	return controller;
}

export function abort(reason?: unknown): AbortSignal {
	const controller = new AbortController();
	controller.abort(reason);
	return controller.signal;
}

export function finalize(signal: AbortSignal, handler: () => void): void {
	signal.addEventListener('abort', handler, { signal });
}

/**
 * Returns an {@linkcode AbortSignal} that will abort if all of the given signals abort.
 * @param signals The signals to wait for.
 */
export function all(...signals: ReadonlyArray<AbortSignal>): AbortSignal {
	const controller = new AbortController();
	const abortables = new Set<AbortSignal>();
	signals.forEach((signal) => {
		if (signal.aborted) return;
		abortables.add(signal);
		signal.addEventListener('abort', () => onAbort(signal), {
			once: true,
		});
		return false;
	});
	if (abortables.size === 0) controller.abort();
	return controller.signal;

	function onAbort(signal: AbortSignal): void {
		abortables.delete(signal);
		if (abortables.size === 0) controller.abort();
	}
}

/**
 * Returns an {@linkcode AbortSignal} that will abort after the given number of milliseconds.
 * @param ms The number of milliseconds to wait before aborting.
 */
export function timeout(ms: number): AbortSignal {
	const controller = new AbortController();
	const timeout = globalThis.setTimeout(() => controller.abort(), ms);
	controller.signal.addEventListener('abort', () => clearTimeout(timeout), {
		signal: controller.signal,
	});
	return controller.signal;
}
