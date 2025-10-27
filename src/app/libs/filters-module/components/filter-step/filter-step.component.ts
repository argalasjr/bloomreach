import { Component, input, output, computed, signal, model } from '@angular/core';
import { SelectComponent, SelectOption } from '@core/components';
import { EventType } from '../../models';

export interface AttributeFilter {
  id: number;
  property: string | null;
  operator: string | null;
  value: string | null;
}

export interface FilterStepValue {
  eventType: string | null;
  attributeFilters: AttributeFilter[];
}

@Component({
  selector: 'app-filter-step',
  imports: [SelectComponent],
  templateUrl: './filter-step.component.html',
  styleUrl: './filter-step.component.scss',
})
export class FilterStepComponent {
  // Inputs
  readonly eventTypes = input.required<EventType[]>();
  readonly stepNumber = input<number>(1);
  readonly canRemove = input<boolean>(true);

  // Two-way binding model
  readonly value = model<FilterStepValue>({
    eventType: null,
    attributeFilters: [{ id: 1, property: null, operator: null, value: null }],
  });

  // Outputs
  readonly remove = output<void>();

  // Internal state - derived from value model
  readonly selectedEventType = computed(() => this.value().eventType);
  readonly attributeFilters = computed(() => this.value().attributeFilters);

  private nextAttributeId = signal(2);

  // Computed options
  readonly eventTypeOptions = computed<SelectOption[]>(() => {
    return this.eventTypes().map((event) => ({
      label: this.formatEventTypeName(event.type),
      value: event.type,
    }));
  });

  readonly showAttributeFilters = computed(() => !!this.selectedEventType());

  /**
   * Computed property options based on selected event type
   */
  readonly propertyOptions = computed<SelectOption[]>(() => {
    const eventType = this.selectedEventType();
    if (!eventType) return [];

    console.log('eventTypes', this.eventTypes());
    console.log('eventType', eventType);

    const event = this.eventTypes().find((event: EventType) => event.type === eventType);
    if (!event) return [];
    console.log('event', event);

    return event.properties.map((property) => ({
      label: this.formatPropertyName(property.property),
      value: property.property,
      metadata: property.type,
    }));
  });

  /**
   * Computed operator options for each attribute
   */
  readonly operatorOptionsMap = computed<Map<number, SelectOption[]>>(() => {
    const eventType = this.selectedEventType();
    if (!eventType) return new Map();

    const event = this.eventTypes().find((e) => e.type === eventType);
    if (!event) return new Map();

    const optionsMap = new Map<number, SelectOption[]>();

    this.attributeFilters().forEach((attribute) => {
      if (!attribute.property) {
        optionsMap.set(attribute.id, []);
        return;
      }

      const prop = event.properties.find((p) => p.property === attribute.property);
      if (!prop) {
        optionsMap.set(attribute.id, []);
        return;
      }

      if (prop.type === 'string') {
        optionsMap.set(attribute.id, [
          { label: 'Equals', value: 'equals' },
          { label: 'Contains', value: 'contains' },
          { label: 'Starts with', value: 'starts_with' },
          { label: 'Ends with', value: 'ends_with' },
          { label: 'Not equals', value: 'not_equals' },
        ]);
      } else if (prop.type === 'number') {
        optionsMap.set(attribute.id, [
          { label: 'Equals', value: 'equals' },
          { label: 'Greater than', value: 'greater_than' },
          { label: 'Less than', value: 'less_than' },
          { label: 'Between', value: 'between' },
          { label: 'Not equals', value: 'not_equals' },
        ]);
      } else {
        optionsMap.set(attribute.id, []);
      }
    });

    return optionsMap;
  });

  /**
   * Update event type in model
   */
  private updateEventType(eventType: string | null): void {
    this.value.update((current) => ({
      ...current,
      eventType,
    }));
  }

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
  onEventTypeChange(eventType: SelectOption<string> | null): void {
    // Reset all attribute filters when event type changes
    const newId = this.nextAttributeId();
    this.value.set({
      eventType: eventType?.value || null,
      attributeFilters: [{ id: newId, property: null, operator: null, value: null }],
    });
    this.nextAttributeId.update((id) => id + 1);
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
      filters.map((f) => (f.id === attributeId ? { ...f, value: null } : f)),
    );
  }

  /**
   * Handle value input change for specific attribute
   */
  onValueChange(attributeId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.updateAttributeFilters((filters) =>
      filters.map((f) => (f.id === attributeId ? { ...f, value: input.value || null } : f)),
    );
  }

  /**
   * Update attribute property
   */
  updateAttributeProperty(attributeId: number, property: SelectOption<string> | null): void {
    this.updateAttributeFilters((filters) =>
      filters.map((f) =>
        f.id === attributeId ? { ...f, property: property?.value || null, operator: null, value: null } : f,
      ),
    );
  }

  /**
   * Update attribute operator
   */
  updateAttributeOperator(attributeId: number, operator: string | null): void {
    this.updateAttributeFilters((filters) =>
      filters.map((f) => (f.id === attributeId ? { ...f, operator, value: null } : f)),
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
  }

  /**
   * Get attribute filter by id
   */
  getAttributeFilter(attributeId: number): AttributeFilter | undefined {
    return this.attributeFilters().find((f) => f.id === attributeId);
  }

  /**
   * Get attribute property value
   */
  getAttributeProperty(attributeId: number): string | null {
    return this.getAttributeFilter(attributeId)?.property || null;
  }

  /**
   * Get attribute operator value
   */
  getAttributeOperator(attributeId: number): string | null {
    return this.getAttributeFilter(attributeId)?.operator || null;
  }

  /**
   * Get attribute value
   */
  getAttributeValue(attributeId: number): string | null {
    return this.getAttributeFilter(attributeId)?.value || null;
  }

  /**
   * Handle remove button click
   */
  onRemove(): void {
    this.remove.emit();
  }
}
