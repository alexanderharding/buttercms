import { UnhandledErrorConstructor } from './unhandled-error-constructor';

/**
 * An error that is not handled by the implementation of the library.
 */
export type UnhandledError = Error;

export const UnhandledError: UnhandledErrorConstructor = class extends Error {
	constructor(options: ErrorOptions) {
		super('unhandledError', options);
	}
};
