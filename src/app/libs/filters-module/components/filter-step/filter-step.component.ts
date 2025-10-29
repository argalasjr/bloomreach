import {
  Component,
  input,
  output,
  computed,
  signal,
  model,
  ChangeDetectionStrategy,
  linkedSignal,
} from '@angular/core';
import { form, Field } from '@angular/forms/signals';
import { SelectComponent, EditableInputComponent } from '@core/components';
import { SelectOption } from '@core/models';
import { EventProperty, EventType, OPERATOR_TABS } from '../../models';
import { JsonPipe } from '@angular/common';

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
  imports: [JsonPipe, SelectComponent, EditableInputComponent, Field],
  templateUrl: './filter-step.component.html',
  styleUrl: './filter-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterStepComponent {
  // Inputs
  readonly eventTypes = input.required<EventType[]>();
  readonly stepNumber = input<number>(1);
  readonly canRemove = input<boolean>(true);

  // Two-way binding model - kept for backward compatibility
  readonly value = model<FilterStepValue>({
    name: 'Untitled Filter',
    eventType: null,
    attributeFilters: [{ id: 1, property: null, operator: null, type: null, value: null }],
  });

  // Outputs
  readonly remove = output<void>();
  readonly duplicate = output<void>();

  // Signal Forms: linked signal automatically syncs with value model
  readonly formValue = linkedSignal(() => this.value());

  // Signal Forms: create form with linked signal (no validation schema needed for now)
  readonly filterForm = form(this.formValue, () => {
    // No validation rules needed for this form
  });

  // Computed signals from form fields
  readonly selectedEventType = computed(() => this.filterForm.eventType().value());
  readonly attributeFilters = computed(() => this.filterForm.attributeFilters().value());
  readonly name = computed(() => this.filterForm.name().value());

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
   * Get form field for a specific attribute filter's property
   * Returns the Field signal for the property of the attribute at the given index
   */
  getAttributePropertyField(index: number) {
    const arrayField = this.filterForm.attributeFilters();
    // Access the array item field - Signal Forms returns Field signals for array items
    // For nested properties, we need to access via the array item's field
    const itemFields = arrayField.value();
    if (index >= itemFields.length) return null;
    // Return a computed that accesses the property field
    // Note: This might need adjustment based on Signal Forms API for nested arrays
    return computed(() => {
      const items = arrayField.value();
      return items[index]?.property || null;
    });
  }

  /**
   * Get form field for a specific attribute filter's operator
   */
  getAttributeOperatorField(index: number) {
    const arrayField = this.filterForm.attributeFilters();
    return computed(() => {
      const items = arrayField.value();
      return items[index]?.operator || null;
    });
  }

  /**
   * Get attribute filter by ID and return its index
   */
  getAttributeIndex(attributeId: number): number {
    const filters = this.attributeFilters();
    return filters.findIndex((f) => f.id === attributeId);
  }

  /**
   * Update filter step name
   */
  onNameChange(newName: string): void {
    this.filterForm.name().value.set(newName);
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
   * Update value directly via signal (for signal forms compatibility)
   */
  updateValue(attributeId: number, value: string | null): void {
    this.updateAttributeFilters((filters) =>
      filters.map((f: AttributeFilter) => (f.id === attributeId ? { ...f, value } : f)),
    );
  }

  /**
   * Update valueFrom directly via signal (for signal forms compatibility)
   */
  updateValueFrom(attributeId: number, valueFrom: string | null): void {
    this.updateAttributeFilters((filters) =>
      filters.map((f: AttributeFilter) => (f.id === attributeId ? { ...f, valueFrom } : f)),
    );
  }

  /**
   * Update valueTo directly via signal (for signal forms compatibility)
   */
  updateValueTo(attributeId: number, valueTo: string | null): void {
    this.updateAttributeFilters((filters) =>
      filters.map((f: AttributeFilter) => (f.id === attributeId ? { ...f, valueTo } : f)),
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
      this.filterForm.name().value.set(this.filterForm.name().value());
      this.filterForm.eventType().value.set(null);
      this.filterForm
        .attributeFilters()
        .value.set([{ id: 1, property: null, operator: null, type: null, value: null }]);
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
