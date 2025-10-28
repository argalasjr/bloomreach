import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FiltersEventsInputSourceService } from './services/filters-events-input-source.service';
import { FilterStepComponent } from './components';
import type { AttributeFilter, FilterStepValue } from './components';
import { CommonModule } from '@angular/common';
import { SelectOption } from '@core/models';

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
  private readonly filtersFacade = inject(FiltersEventsInputSourceService);

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
   * Stores cleaned data without internal IDs, ready for backend
   */
  readonly appliedFilters = signal<
    {
      name: string;
      eventType: SelectOption<string> | null;
      attributeFilters: {
        property: SelectOption<string> | null;
        operator: SelectOption<string> | null;
        type?: 'string' | 'number' | null;
        value: string | null;
        valueFrom?: string | null;
        valueTo?: string | null;
      }[];
    }[]
  >([]);

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
   * Get active filters from current filterSteps state (without internal IDs)
   * This is a method, not a computed, so it reads fresh data when called
   * Returns data ready for backend submission
   */
  getActiveFilters() {
    return this.filterSteps()
      .filter((step: FilterStep) => {
        if (!step.value.eventType) return false;
        return step.value.attributeFilters.some((attr: AttributeFilter) => {
          if (!attr.property || !attr.operator) return false;
          // For "between" operator, check valueFrom and valueTo
          if (attr.operator?.value === 'between') {
            return !!(attr.valueFrom && attr.valueTo);
          }
          // For other operators, check value
          return !!attr.value;
        });
      })
      .map((step: FilterStep) => ({
        name: step.value.name,
        eventType: step.value.eventType,
        attributeFilters: step.value.attributeFilters
          .filter((attr: AttributeFilter) => {
            if (!attr.property || !attr.operator) return false;
            if (attr.operator?.value === 'between') {
              return !!(attr.valueFrom && attr.valueTo);
            }
            return !!attr.value;
          })
          .map((attr: AttributeFilter) => ({
            property: attr.property,
            operator: attr.operator,
            type: attr.type,
            value: attr.value,
            valueFrom: attr.valueFrom,
            valueTo: attr.valueTo,
          })),
      }));
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
  private getEmptyFilterValue(customName?: string): FilterStepValue {
    const defaultName = customName || `Unnamed step`;
    return {
      name: defaultName,
      eventType: null,
      attributeFilters: [{ id: 1, property: null, operator: null, type: null, value: null }],
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

    // Get current nextId for the step
    const stepId = this.nextId();
    let currentId = stepId + 1;

    const newStep: FilterStep = {
      id: stepId,
      value: {
        name: `${stepToDuplicate.value.name} (copy)`,
        eventType: stepToDuplicate.value.eventType,
        attributeFilters: stepToDuplicate.value.attributeFilters.map((attr) => {
          const newAttr = {
            ...attr,
            id: currentId,
          };
          currentId = currentId + 1;
          return newAttr;
        }),
      },
    };

    // Find the index of the step to duplicate and insert after it
    const index = this.filterSteps().findIndex((step) => step.id === id);
    this.filterSteps.update((steps) => [
      ...steps.slice(0, index + 1),
      newStep,
      ...steps.slice(index + 1),
    ]);

    // Update nextId to account for step ID + all attribute filter IDs
    this.nextId.set(currentId);
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
   * Remove an applied filter by index
   */
  removeAppliedFilter(index: number): void {
    this.appliedFilters.update((filters) => filters.filter((_, i) => i !== index));
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
