import { AbstractBuilder } from '@shared/testing';
import { Response } from '../types/response';

export class ResponseBuilder<
	T extends Readonly<Record<keyof unknown, unknown>>,
> extends AbstractBuilder<Response<T>> {
	constructor(dataBuilderType: new () => AbstractBuilder<T>) {
		super({
			data: new dataBuilderType().build(),
		});
	}
}
