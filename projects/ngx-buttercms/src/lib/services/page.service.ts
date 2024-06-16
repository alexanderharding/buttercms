import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Page,
  PageOptions,
  PageSearchOptions,
  Pages,
  PagesOptions,
  Response,
  PaginatedResponse,
} from '../types';
import { httpParameterCodec as encoder } from '../constants';
import { requestMarker } from '../constants';
import { Params } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PageService {
  private readonly http = inject(HttpClient);

  get<
    Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
      Record<keyof unknown, unknown>
    >,
    Type extends string = string,
    Slug extends string = string
  >(
    type: Type,
    slug: Slug,
    options?: PageOptions
  ): Observable<Response<Page<Fields, Type, Slug>>>;
  get<
    Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
      Record<keyof unknown, unknown>
    >,
    Type extends string = string
  >(
    type: Type,
    options?: PagesOptions<Fields>
  ): Observable<PaginatedResponse<Pages<Fields, Type>>>;
  get(
    type: string,
    slugOrOptions?: string | Params,
    options?: Params
  ): Observable<Response<Page> | PaginatedResponse<Pages>> {
    let url = `/pages/${type}/` as const;
    typeof slugOrOptions === 'string'
      ? (url += `${slugOrOptions}/`)
      : (options = { ...options, ...slugOrOptions });
    return this.http.get<Response<Page> | PaginatedResponse<Pages>>(url, {
      params: new HttpParams({ fromObject: options, encoder }),
      context: new HttpContext().set(requestMarker, void 0),
    });
  }

  search<
    Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
      Record<keyof unknown, unknown>
    >,
    Type extends string = string
  >(
    query: string,
    options?: PageSearchOptions<Type>
  ): Observable<PaginatedResponse<Pages<Fields, Type>>> {
    return this.http.get<PaginatedResponse<Pages<Fields, Type>>>(
      '/pages/search/',
      {
        params: new HttpParams({ fromObject: { ...options, query }, encoder }),
        context: new HttpContext().set(requestMarker, void 0),
      }
    );
  }
}
