import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FiltersFacadeService } from './services/filters-facade.service';

@Component({
  selector: 'app-filters-module',
  imports: [],
  templateUrl: './filters-module.html',
  styleUrl: './filters-module.scss',
})
export class FiltersModuleComponent {
  private readonly filtersFacade = inject(FiltersFacadeService);

  /**
   * Trigger signal to reload data
   */
  private readonly reloadTrigger = signal(0);

  /**
   * Signal-based customer events data
   * Automatically updates when reloadTrigger changes
   */
  readonly eventsData = toSignal(this.filtersFacade.getEvents());

  /**
   * Loading state signal
   */
  readonly isLoading = signal(false);

  /**
   * Error state signal
   */
  readonly error = signal<string | null>(null);

  /**
   * Computed signal for events resource API compatibility
   */
  readonly eventsResource = computed(() => ({
    value: this.eventsData,
    isLoading: this.isLoading,
    error: this.error,
    reload: () => this.refreshEvents(),
  }));

  /**
   * Refresh the events data
   */
  refreshEvents(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.filtersFacade.refreshEvents().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.reloadTrigger.update((v) => v + 1);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.message || 'Failed to load events');
      },
    });
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.filtersFacade.clearCache();
  }
}
