import {
  Component,
  input,
  output,
  computed,
  signal,
  model,
  ChangeDetectionStrategy,
} from '@angular/core';
import { form, Field } from '@angular/forms/signals';
import { SelectComponent, EditableInputComponent } from '@core/components';
import { SelectOption } from '@core/models';
import { EventProperty, EventType, OPERATOR_TABS } from '../../models';

export interface AttributeFilter {
  id: number;
  property: SelectOption<string> | null;
  operator: SelectOption<string> | null;
  type?: 'string' | 'number' | null; // Property type chosen from tabs
  value: string | null;
  valueFrom: string | null; // For "between" operator - always defined
  valueTo: string | null; // For "between" operator - always defined
}

export interface FilterStepValue {
  name: string;
  eventType: SelectOption<string> | null;
  attributeFilters: AttributeFilter[];
}

@Component({
  selector: 'app-filter-step',
  imports: [SelectComponent, EditableInputComponent, Field],
  templateUrl: './filter-step.component.html',
  styleUrl: './filter-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterStepComponent {
  // Inputs
  readonly eventTypes = input.required<EventType[]>();
  readonly stepNumber = input<number>(1);
  readonly canRemove = input<boolean>(true);

  // Two-way binding model
  readonly value = model<FilterStepValue>({
    name: 'Unnamed filter',
    eventType: null,
    attributeFilters: [
      {
        id: 1,
        property: null,
        operator: null,
        type: null,
        value: null,
        valueFrom: null,
        valueTo: null,
      },
    ],
  });

  // Outputs
  readonly remove = output<void>();
  readonly duplicate = output<void>();

  // Signal Forms: pass model signal directly - form() automatically syncs changes back to the model
  // form() uses the model as the source of truth and updates it when field values change
  readonly filterForm = form(this.value, () => {
    // No validation rules needed for this form
  });

  // Computed signals from form fields
  readonly selectedEventType = computed(() => this.filterForm.eventType().value());
  readonly attributeFilters = computed(() => this.filterForm.attributeFilters().value());
  readonly name = computed(() =>
    this.filterForm.name().value().includes('Unnamed')
      ? this.filterForm.eventType().value()?.label || this.filterForm.name().value()
      : this.filterForm.name().value(),
  );

  /**
   * Check if the step is complete (has all required values)
   */
  readonly isComplete = computed(() => {
    const eventType = this.selectedEventType();
    if (!eventType) return false;

    return this.attributeFilters().some((attr) => {
      if (!attr.property || !attr.operator) return false;
      // For "between" operator, check valueFrom and valueTo
      if (attr.operator?.value === 'between') {
        return !!(attr.valueFrom && attr.valueTo);
      }
      // For other operators, check value
      return !!attr.value;
    });
  });

  private nextAttributeId = signal(2);

  // Computed options
  readonly eventTypeOptions = computed<SelectOption<string>[]>(() => {
    return this.eventTypes().map((event) => ({
      label: this.formatEventTypeName(event.type),
      value: event.type,
    }));
  });

  readonly showAttributeFilters = computed(() => !!this.selectedEventType());

  /**
   * Computed property options based on selected event type
   */
  readonly propertyOptions = computed<SelectOption<string>[]>(() => {
    const eventType = this.selectedEventType();
    if (!eventType) return [];

    const event = this.eventTypes().find((event: EventType) => event.type === eventType.value);
    if (!event) return [];

    return event.properties.map(
      (property: EventProperty) =>
        ({
          label: this.formatPropertyName(property.property),
          value: property.property,
          type: property.type,
        }) as SelectOption<string>,
    );
  });

  /**
   * Computed map of property types for each attribute
   */
  readonly propertyTypeMap = computed<Map<number, string>>(() => {
    const eventType = this.selectedEventType();
    if (!eventType) return new Map();

    const event = this.eventTypes().find((e) => e.type === eventType.value);
    if (!event) return new Map();

    const typeMap = new Map<number, string>();

    this.attributeFilters().forEach((attribute) => {
      if (!attribute.property) {
        typeMap.set(attribute.id, 'string');
        return;
      }

      const prop = event.properties.find((p) => p.property === attribute.property?.value);
      typeMap.set(attribute.id, prop?.type === 'number' ? 'number' : 'string');
    });

    return typeMap;
  });

  /**
   * Operator tabs - same for all attributes
   */
  readonly operatorTabs = OPERATOR_TABS;

  /**
   * Update attribute filters in form
   */
  private updateAttributeFilters(updater: (filters: AttributeFilter[]) => AttributeFilter[]): void {
    const currentFilters = this.filterForm.attributeFilters().value();
    const updatedFilters = updater(currentFilters);
    this.filterForm.attributeFilters().value.set(updatedFilters);
  }

  /**
   * Format event type name for display
   */
  private formatEventTypeName(type: string): string {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format property name for display
   */
  private formatPropertyName(property: string): string {
    return property
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Update filter step name
   */
  onNameChange(newName: string): void {
    this.filterForm.name().value.set(newName);
  }

  /**
   * Add new attribute filter
   */
  addAttributeFilter(): void {
    const newFilter: AttributeFilter = {
      id: this.nextAttributeId(),
      property: null,
      operator: null,
      type: null,
      value: null,
      valueFrom: null,
      valueTo: null,
    };
    this.updateAttributeFilters((filters) => [...filters, newFilter]);
    this.nextAttributeId.update((id) => id + 1);
  }

  /**
   * Remove attribute filter
   */
  removeAttributeFilter(attributeId: number): void {
    this.updateAttributeFilters((filters) => filters.filter((f) => f.id !== attributeId));
    if (this.attributeFilters().length === 0) {
      this.filterForm.name().value.set(this.filterForm.name().value());
      this.filterForm.eventType().value.set(null);
      this.filterForm.attributeFilters().value.set([
        {
          id: 1,
          property: null,
          operator: null,
          type: null,
          value: null,
          valueFrom: null,
          valueTo: null,
        },
      ]);
    }
    this.nextAttributeId.set(1);
  }

  /**
   * Handle remove button click
   */
  onRemove(): void {
    this.remove.emit();
  }

  /**
   * Handle duplicate button click
   */
  onDuplicate(): void {
    this.duplicate.emit();
  }
}
