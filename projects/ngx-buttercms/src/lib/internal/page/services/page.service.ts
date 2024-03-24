import { Injectable, inject } from '@angular/core';
import { Params } from '@angular/router';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Page,
  PageParams,
  PageSearchParams,
  Pages,
  PagesParams,
} from '../models';
import {
  HTTP_PARAMETER_CODEC as encoder,
  WrappedData,
  WrappedMeta,
  PaginationMeta,
  REQUEST_MARKER,
} from '../../shared';

/**
 * A lightweight service for querying CMS page content.
 */
@Injectable({ providedIn: 'root' })
export class PageService {
  private readonly http = inject(HttpClient);

  /**
   * Get a single {@link Page|page}.
   * @param type `Required` {@link Page.page_type|page type} to query.
   * @param slug `Required` {@link Page.slug|page slug}.
   * @param params `Optional` {@link PageParams|parameters} to manipulate the query.
   */
  public get<
    Fields extends Readonly<Record<keyof unknown & string, unknown>> = Readonly<
      Record<keyof unknown & string, unknown>
    >,
    Type extends string = string,
    Slug extends string = string
  >(
    type: Type,
    slug: Slug,
    params?: PageParams
  ): Observable<WrappedData<Page<Fields, Type, Slug>>>;
  /**
   * Get multiple {@link Page|pages} of the same type.
   * @param type `Required` {@link Page.page_type|page type} to query.
   * @param params `Optional` {@link PagesParams|parameters} to manipulate the query.
   */
  public get<
    Fields extends Readonly<Record<keyof unknown & string, unknown>> = Readonly<
      Record<keyof unknown & string, unknown>
    >,
    Type extends string = string
  >(
    type: Type,
    params?: PagesParams<Fields>
  ): Observable<WrappedData<Pages<Fields, Type>> & WrappedMeta<PaginationMeta>>;
  public get(type: string, slugOrParams?: string | Params, params?: Params) {
    let url = `/pages/${type}/` as const;
    typeof slugOrParams === 'string'
      ? (url += `${slugOrParams}/`)
      : (params = { ...params, ...slugOrParams });
    return this.http.get<WrappedData<Page | Pages>>(url, {
      params: new HttpParams({ fromObject: params, encoder }),
      context: new HttpContext().set(REQUEST_MARKER, void 0),
    });
  }

  /**
   * Search {@link Page|pages} based on a query.
   * @param query `Required` {@link Page|page} query.
   * @param params `Optional` {@link PageSearchParams|parameters} to manipulate the query.
   */
  public search<
    Fields extends Readonly<Record<keyof unknown & string, unknown>> = Readonly<
      Record<keyof unknown & string, unknown>
    >,
    Type extends string = string
  >(
    query: string,
    params?: PageSearchParams<Type>
  ): Observable<WrappedData<Pages<Fields, Type>> & WrappedMeta<PaginationMeta>>;
  public search(query: string, params?: Params) {
    return this.http.get<WrappedData<Pages>>('/pages/search/', {
      params: new HttpParams({ fromObject: { ...params, query }, encoder }),
      context: new HttpContext().set(REQUEST_MARKER, void 0),
    });
  }
}
