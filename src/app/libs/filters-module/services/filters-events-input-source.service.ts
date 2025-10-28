import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EndpointService, HttpCacheService } from '@core/services';
import { withCache } from '@core/interceptors';
import { EventsResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class FiltersEventsInputSourceService {
  private readonly endpointService = inject(EndpointService);
  private readonly cacheService = inject(HttpCacheService);

  private readonly EVENTS_API_URL =
    'https://br-fe-assignment.github.io/customer-events/events.json';

  private readonly EVENTS_CACHE_KEY = 'customer-events';
  private readonly CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetches customer events from the API
   * Automatically cached via HTTP interceptor with 5-minute expiration
   * @returns Observable of EventsResponse
   */
  getEvents(): Observable<EventsResponse> {
    return this.endpointService.get<EventsResponse>(this.EVENTS_API_URL, {
      context: withCache({ maxAge: this.CACHE_MAX_AGE }, this.EVENTS_CACHE_KEY),
    });
  }

  /**
   * Refreshes the events data by clearing the cache and fetching new data
   * @returns Observable of EventsResponse
   */
  refreshEvents(): Observable<EventsResponse> {
    this.cacheService.invalidate(this.EVENTS_CACHE_KEY);
    return this.getEvents();
  }

  /**
   * Clears all cached events data
   */
  clearCache(): void {
    this.cacheService.invalidate(this.EVENTS_CACHE_KEY);
  }

  /**
   * Checks if events data is cached
   * @returns true if events are cached
   */
  isCached(): boolean {
    return this.cacheService.has(this.EVENTS_CACHE_KEY);
  }
}
