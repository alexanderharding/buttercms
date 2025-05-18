export interface Notifiable<Value> {
	/**
	 * [Glossary](https://jsr.io/@xander/observable#next)
	 */
	next(value: Value): void;
	/**
	 * [Glossary](https://jsr.io/@xander/observable#error)
	 */
	error(error: unknown): void;
	/**
	 * [Glossary](https://jsr.io/@xander/observable#complete)
	 */
	complete(): void;
	/**
	 * [Glossary](https://jsr.io/@xander/observable#finally)
	 */
	finally(): void;
}
