import { isDevMode } from '@angular/core';

/**
 * @description Random value picker.
 * @usage Picking a random campaign value from a, potentially weighted, list of options.
 */
export function pickOne<Option>(options: ReadonlyArray<Option>): Option;
export function pickOne<Options extends ReadonlyArray<unknown>>(
	options: Options,
	weights?: Readonly<{ [Key in keyof Options]: 0 }>,
): undefined;
export function pickOne<Options extends ReadonlyArray<unknown>>(
	options: Options,
	weights?: Readonly<{ [Key in keyof Options]: number }>,
): Options[number];
export function pickOne(
	options: ReadonlyArray<unknown>,
	weights: ReadonlyArray<number> = options.map(() => 1),
): unknown {
	if (isDevMode()) assertValidWeights(options, weights);
	let thresholds: ReadonlyArray<number> = [];
	const weightsSum = weights.reduce((sum, weight) => {
		const threshold = sum + weight;
		thresholds = [...thresholds, threshold];
		return threshold;
	}, 0);
	const selection = Math.floor(Math.random() * weightsSum);
	return options.find((_, index) => {
		if (weights.at(index) === 0) return false;
		return selection < thresholds.at(index)!;
	});
}

function assertValidWeights(
	options: ReadonlyArray<unknown>,
	weights: ReadonlyArray<number>,
): void {
	assertWeightsLength(options, weights);
	assertFiniteWeights(weights);
}

function assertFiniteWeights(weights: ReadonlyArray<number>): void {
	if (weights.every((weight) => Number.isFinite(weight))) return;
	throw new RangeError('All weights must be finite numbers.');
}

function assertWeightsLength(
	options: ReadonlyArray<unknown>,
	weights: ReadonlyArray<number>,
): void {
	if (options.length === weights.length) return;
	throw new RangeError(
		`'weights' must have the same length as 'options'. Expected: ${options.length}. Actual: ${weights.length}.`,
	);
}
