import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FiltersFacadeService } from './services/filters-facade.service';
import { FilterStepComponent } from './components';
import type { FilterStepValue } from './components';
import { CommonModule } from '@angular/common';

interface FilterStep {
  id: number;
  value: FilterStepValue;
}

@Component({
  selector: 'app-filters-module',
  imports: [CommonModule, FilterStepComponent],
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
   * Applied filters (only updates when user clicks "Apply Filters")
   */
  readonly appliedFilters = signal<FilterStep[]>([]);

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
   * Get active filters from current filterSteps state
   * This is a method, not a computed, so it reads fresh data when called
   */
  getActiveFilters(): FilterStep[] {
    return this.filterSteps().filter((step) => {
      if (!step.value.eventType) return false;
      return step.value.attributeFilters.some((attr) => {
        if (!attr.property || !attr.operator) return false;
        // For "between" operator, check valueFrom and valueTo
        if (attr.operator === 'between') {
          return !!(attr.valueFrom && attr.valueTo);
        }
        // For other operators, check value
        return !!attr.value;
      });
    });
  }

  /**
   * Computed filter summary (based on applied filters)
   */
  readonly filterSummary = computed(() => {
    const applied = this.appliedFilters();
    if (applied.length === 0) return 'No active filters';
    return `${applied.length} active filter${applied.length > 1 ? 's' : ''}`;
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
   * Duplicate a filter step
   */
  duplicateFilterStep(id: number): void {
    const stepToDuplicate = this.filterSteps().find((step) => step.id === id);
    if (!stepToDuplicate) return;

    const newStep: FilterStep = {
      id: this.nextId(),
      value: {
        eventType: stepToDuplicate.value.eventType,
        attributeFilters: stepToDuplicate.value.attributeFilters.map((attr) => ({
          ...attr,
          id: Math.random(), // Generate new IDs for duplicated filters
        })),
      },
    };

    // Find the index of the step to duplicate and insert after it
    const index = this.filterSteps().findIndex((step) => step.id === id);
    this.filterSteps.update((steps) => [
      ...steps.slice(0, index + 1),
      newStep,
      ...steps.slice(index + 1),
    ]);
    this.nextId.update((id) => id + 1);
  }

  /**
   * Apply filters - computes active filters from current state and stores them
   */
  applyFilters(): void {
    const active = this.getActiveFilters();
    // Update applied filters - this will trigger display
    this.appliedFilters.set(active);
    console.log('Applying filters:', active);
    // TODO: Implement filter application logic
  }

  /**
   * Remove an applied filter
   */
  removeAppliedFilter(id: number): void {
    this.appliedFilters.update((filters) => filters.filter((filter) => filter.id !== id));
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): void {
    this.filterSteps.set([{ id: 1, value: this.getEmptyFilterValue() }]);
    this.appliedFilters.set([]);
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
