import {
  Component,
  input,
  output,
  computed,
  signal,
  model,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SelectComponent, EditableInputComponent } from '@core/components';
import { SelectOption } from '@core/models';
import { EventProperty, EventType, OPERATOR_TABS } from '../../models';
import { CommonModule } from '@angular/common';

export interface AttributeFilter {
  id: number;
  property: SelectOption<string> | null;
  operator: SelectOption<string> | null;
  type?: 'string' | 'number' | null; // Property type chosen from tabs
  value: string | null;
  valueFrom?: string | null; // For "between" operator
  valueTo?: string | null; // For "between" operator
}

export interface FilterStepValue {
  name: string;
  eventType: SelectOption<string> | null;
  attributeFilters: AttributeFilter[];
}

@Component({
  selector: 'app-filter-step',
  imports: [CommonModule, SelectComponent, EditableInputComponent],
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
    name: 'Untitled Filter',
    eventType: null,
    attributeFilters: [{ id: 1, property: null, operator: null, type: null, value: null }],
  });

  // Outputs
  readonly remove = output<void>();
  readonly duplicate = output<void>();

  // Internal state - derived from value model
  readonly selectedEventType = computed(() => this.value().eventType);
  readonly attributeFilters = computed(() => this.value().attributeFilters);

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
   * Update attribute filters in model
   */
  private updateAttributeFilters(updater: (filters: AttributeFilter[]) => AttributeFilter[]): void {
    this.value.update((current) => ({
      ...current,
      attributeFilters: updater(current.attributeFilters),
    }));
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
   * Handle event type change
   */
  onEventTypeChange(eventTypeOption: SelectOption<string> | SelectOption<string>[] | null): void {
    const eventTypeValue = Array.isArray(eventTypeOption)
      ? eventTypeOption[0] || null
      : eventTypeOption;
    // Reset all attribute filters when event type changes
    const newId = this.nextAttributeId();
    this.value.set({
      name: eventTypeValue?.label ?? 'Unnamed step',
      eventType: eventTypeValue || null,
      attributeFilters: [{ id: newId, property: null, operator: null, value: null }],
    });
    this.nextAttributeId.update((id) => id + 1);
  }

  /**
   * Update filter step name
   */
  onNameChange(newName: string): void {
    this.value.update((current) => ({
      ...current,
      name: newName,
    }));
  }

  /**
   * Handle property change for specific attribute
   */
  onPropertyChange(attributeId: number): void {
    this.updateAttributeFilters((filters) =>
      filters.map((f) => (f.id === attributeId ? { ...f, operator: null, value: null } : f)),
    );
  }

  /**
   * Handle operator change for specific attribute
   */
  onOperatorChange(attributeId: number): void {
    this.updateAttributeFilters((filters) =>
      filters.map((f: AttributeFilter) =>
        f.id === attributeId ? { ...f, value: null, valueFrom: null, valueTo: null } : f,
      ),
    );
  }

  /**
   * Handle value input change for specific attribute
   */
  onValueChange(attributeId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.updateAttributeFilters((filters) =>
      filters.map((f: AttributeFilter) =>
        f.id === attributeId ? { ...f, value: input.value || null } : f,
      ),
    );
  }

  /**
   * Handle "from" value change for "between" operator
   */
  onValueFromChange(attributeId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.updateAttributeFilters((filters) =>
      filters.map((f: AttributeFilter) =>
        f.id === attributeId ? { ...f, valueFrom: input.value || null } : f,
      ),
    );
  }

  /**
   * Handle "to" value change for "between" operator
   */
  onValueToChange(attributeId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.updateAttributeFilters((filters) =>
      filters.map((f) => (f.id === attributeId ? { ...f, valueTo: input.value || null } : f)),
    );
  }

  /**
   * Update attribute property
   */
  updateAttributeProperty(
    attributeId: number,
    propertyOption: SelectOption<string> | SelectOption<string>[] | null,
  ): void {
    const property = Array.isArray(propertyOption) ? propertyOption[0] || null : propertyOption;

    this.updateAttributeFilters((filters) =>
      filters.map((f: AttributeFilter) =>
        f.id === attributeId
          ? { ...f, property: property || null, operator: null, value: null }
          : f,
      ),
    );
  }

  /**
   * Update attribute operator
   */
  updateAttributeOperator(
    attributeId: number,
    operatorOption: SelectOption<string> | SelectOption<string>[] | null,
  ): void {
    const operator = Array.isArray(operatorOption) ? operatorOption[0] || null : operatorOption;
    this.updateAttributeFilters((filters) =>
      filters.map((f: AttributeFilter) =>
        f.id === attributeId
          ? {
              ...f,
              operator,
              value: null,
              valueFrom: null,
              valueTo: null,
            }
          : f,
      ),
    );
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
      this.value.set({
        name: this.value().name,
        eventType: null,
        attributeFilters: [{ id: 1, property: null, operator: null, type: null, value: null }],
      });
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
