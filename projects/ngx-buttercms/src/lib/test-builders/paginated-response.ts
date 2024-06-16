import { AbstractBuilder } from '@shared/testing';
import { PaginatedResponse } from '../types';
import { PaginationMetaBuilder } from './pagination-meta';

export class PaginatedResponseBuilder<
	T extends Readonly<Record<keyof unknown, unknown>>,
> extends AbstractBuilder<PaginatedResponse> {
	constructor(dataBuilderType: new () => AbstractBuilder<T>) {
		super({
			data: new dataBuilderType().build(),
			meta: new PaginationMetaBuilder().build(),
		});
	}
}
