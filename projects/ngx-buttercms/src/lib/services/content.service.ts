import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { httpParameterCodec as encoder } from '../constants';
import { requestMarker } from '../constants';
import { Content, ContentOptions, PaginatedResponse } from '../types';

@Injectable({ providedIn: 'root' })
export class ContentService {
	private readonly http = inject(HttpClient);

	get<
		Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
			Record<keyof unknown, unknown>
		>,
		Type extends string = string,
	>(
		type: Type,
		options?: ContentOptions<Fields>,
	): Observable<PaginatedResponse<Content<Fields, Type>>> {
		return this.http.get<PaginatedResponse<Content<Fields, Type>>>(
			'/content/',
			{
				params: new HttpParams({
					fromObject: { ...options, keys: type },
					encoder,
				}),
				context: new HttpContext().set(requestMarker, void 0),
			},
		);
	}
}
