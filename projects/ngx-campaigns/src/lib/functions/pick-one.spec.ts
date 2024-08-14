import { pickOne } from './pick-one';
import { fakeAsync } from '@angular/core/testing';

describe(pickOne.name, () => {
	it('distribution - 1:1 w/ weights', () => {
		testCampaignDistribution([1, 1]);
	});

	it('distribution - 1:1 w/o weights', () => {
		testCampaignDistribution();
	});

	it('distribution - 9:1', () => {
		testCampaignDistribution([9, 1]);
	});

	it('distribution - 1:9', () => {
		testCampaignDistribution([1, 9]);
	});

	it('distribution - 0:1', () => {
		testCampaignDistribution([0, 1], true);
	});

	it('distribution - 1:0', () => {
		testCampaignDistribution([1, 0], true);
	});

	it("should throw when weights include 'NaN'", fakeAsync(() => {
		// Arrange
		const weights = [5, 100, 12, 8, 1.5, 12.9645748, 0, NaN] as const;
		const options = weights.map((weight) => `option-${weight}`);

		// Act / Assert
		expect(() => pickOne(options, weights)).toThrowError(
			'All weights must be finite numbers.',
		);
	}));

	it("should throw when weights include 'Number.POSITIVE_INFINITY'", fakeAsync(() => {
		// Arrange
		const weights = [
			5,
			100,
			12,
			8,
			1.5,
			12.9645748,
			0,
			Number.POSITIVE_INFINITY,
		] as const;
		const options = weights.map((weight) => `option-${weight}`);

		// Act / Assert
		expect(() => pickOne(options, weights)).toThrowError(
			'All weights must be finite numbers.',
		);
	}));

	it("should throw when weights include 'Number.NEGATIVE_INFINITY'", fakeAsync(() => {
		// Arrange
		const weights = [
			5,
			100,
			12,
			8,
			1.5,
			12.9645748,
			0,
			Number.NEGATIVE_INFINITY,
		] as const;
		const options = weights.map((weight) => `option-${weight}`);

		// Act / Assert
		expect(() => pickOne(options, weights)).toThrowError(
			'All weights must be finite numbers.',
		);
	}));

	it('should throw when weights are not not the same length as options', fakeAsync(() => {
		// Arrange
		const weights = Array.from({ length: 5 }, (_, index) => index + 1);
		const options = Array.from({ length: 8 }, (_, i) => i.toString());

		// Act / Assert
		expect(() => pickOne(options, weights)).toThrowError(
			`'weights' must have the same length as 'options'. Expected: ${options.length}. Actual: ${weights.length}.`,
		);
	}));
});

function testCampaignDistribution(
	weights?: Readonly<[weightA: number, weightB: number]>,
	exact = false,
): void {
	const [weightA = 1, weightB = 1] = weights ?? [];
	const options = ['A', 'B'] as const;
	const results = new Map([
		['A' as const, 0],
		['B' as const, 0],
	]);

	const trials = 100_000;
	for (let i = 0; i < trials; i++) {
		const option = pickOne(options, weights);
		results.set(option, results.get(option)! + 1);
	}

	const percentage = results.get('A')! / trials;
	const expectedPercentage = weightA / (weightA + weightB);
	if (exact) {
		expect(percentage).toBe(expectedPercentage);
	} else {
		expect(percentage).toBeCloseTo(expectedPercentage, 2);
	}
}
