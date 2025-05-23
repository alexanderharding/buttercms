/**
 * [Glossary](https://jsr.io/@xander/observable#next)
 */
export interface Nextable<Value = unknown> {
	/**
	 * [Glossary](https://jsr.io/@xander/observable#next)
	 */
	next(value: Value): void;
}
