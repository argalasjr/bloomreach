import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FiltersFacadeService } from './services/filters-facade.service';
import { FilterStepComponent } from './components';
import type { FilterStepValue } from './components';

interface FilterStep {
  id: number;
  value: FilterStepValue;
}

@Component({
  selector: 'app-filters-module',
  imports: [FilterStepComponent],
  templateUrl: './filters-module.html',
  styleUrl: './filters-module.scss',
})
export class FiltersModuleComponent {
  private readonly filtersFacade = inject(FiltersFacadeService);

  /**
   * Signal-based customer events data
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
   * Filter steps
   */
  readonly filterSteps = signal<FilterStep[]>([{ id: 1, value: this.getEmptyFilterValue() }]);

  /**
   * Next filter step ID
   */
  private nextId = signal(2);

  /**
   * Computed event types from loaded data
   */
  readonly eventTypes = computed(() => {
    const events = this.eventsData();
    return events?.events || [];
  });

  /**
   * Computed active filters
   */
  readonly activeFilters = computed(() => {
    return this.filterSteps().filter((step) => {
      if (!step.value.eventType) return false;
      return step.value.attributeFilters.some(
        (attr) => attr.property && attr.operator && attr.value,
      );
    });
  });

  /**
   * Computed filter summary
   */
  readonly filterSummary = computed(() => {
    const active = this.activeFilters();
    if (active.length === 0) return 'No active filters';
    return `${active.length} active filter${active.length > 1 ? 's' : ''}`;
  });

  /**
   * Get empty filter value
   */
  private getEmptyFilterValue(): FilterStepValue {
    return {
      eventType: null,
      attributeFilters: [{ id: 1, property: null, operator: null, value: null }],
    };
  }

  /**
   * Add a new filter step
   */
  addFilterStep(): void {
    const newStep: FilterStep = {
      id: this.nextId(),
      value: this.getEmptyFilterValue(),
    };
    this.filterSteps.update((steps) => [...steps, newStep]);
    this.nextId.update((id) => id + 1);
  }

  /**
   * Remove a filter step
   */
  removeFilterStep(id: number): void {
    this.filterSteps.update((steps) => steps.filter((step) => step.id !== id));
  }

  /**
   * Handle filter step value change
   */
  onFilterStepChange(id: number, value: FilterStepValue): void {
    this.filterSteps.update((steps) =>
      steps.map((step) => (step.id === id ? { ...step, value } : step)),
    );
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    const active = this.activeFilters();
    console.log('Applying filters:', active);
    // TODO: Implement filter application logic
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): void {
    this.filterSteps.set([{ id: 1, value: this.getEmptyFilterValue() }]);
    this.nextId.set(2);
  }

  /**
   * Refresh the events data
   */
  refreshEvents(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.filtersFacade.refreshEvents().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.message || 'Failed to load events');
      },
    });
  }
}
