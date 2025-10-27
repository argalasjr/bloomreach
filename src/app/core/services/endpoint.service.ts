import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HttpOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?:
    | HttpParams
    | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  context?: HttpContext;
  observe?: 'body';
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EndpointService {
  private readonly http = inject(HttpClient);

  /**
   * Performs a GET request
   * @param url - The endpoint URL
   * @param options - Optional HTTP options
   * @returns Observable of the response
   */
  get<T>(url: string, options?: HttpOptions): Observable<T> {
    return this.http.get<T>(url, options);
  }

  /**
   * Performs a POST request
   * @param url - The endpoint URL
   * @param body - The request body
   * @param options - Optional HTTP options
   * @returns Observable of the response
   */
  post<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    return this.http.post<T>(url, body, options);
  }

  /**
   * Performs a PUT request
   * @param url - The endpoint URL
   * @param body - The request body
   * @param options - Optional HTTP options
   * @returns Observable of the response
   */
  put<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    return this.http.put<T>(url, body, options);
  }

  /**
   * Performs a DELETE request
   * @param url - The endpoint URL
   * @param options - Optional HTTP options
   * @returns Observable of the response
   */
  delete<T>(url: string, options?: HttpOptions): Observable<T> {
    return this.http.delete<T>(url, options);
  }

  /**
   * Performs a PATCH request
   * @param url - The endpoint URL
   * @param body - The request body
   * @param options - Optional HTTP options
   * @returns Observable of the response
   */
  patch<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    return this.http.patch<T>(url, body, options);
  }
}
