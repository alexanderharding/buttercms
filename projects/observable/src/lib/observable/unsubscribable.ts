export interface Unsubscribable {
	/**
	 * [Glossary](https://jsr.io/@xander/observable#unsubscription)
	 */
	readonly signal: AbortSignal;
}
