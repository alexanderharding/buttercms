import { AbstractBuilder } from '@shared/testing';
import { PaginationMeta } from '../types';

export class PaginationMetaBuilder extends AbstractBuilder<PaginationMeta> {
	constructor() {
		const totalPageCount = chance.integer({ min: 5, max: 100 });
		const nextPage = chance.integer({
			min: 8,
			max: totalPageCount,
		});
		super({
			count: totalPageCount,
			next_page: nextPage,
			previous_page: nextPage - 2,
		});
	}
}
