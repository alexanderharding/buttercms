import { UnhandledErrorConstructor } from './unhandled-error-constructor';

/**
 * An error that is not handled by the implementation of the library.
 */
export type UnhandledError = Error;

// Note: the main reason this JSDoc exists, is to satisfy the JSR score. In reality,
// the JSDoc on the above type is enough for the DX on both symbols.
/**
 * @class
 */
export const UnhandledError: UnhandledErrorConstructor = class extends Error {
	constructor(options: ErrorOptions) {
		super('unhandledError', options);
	}
};
