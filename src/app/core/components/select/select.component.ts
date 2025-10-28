import { Component, input, output, model, signal, computed, TemplateRef } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  [key: string]: any;
}

export type SelectAppearance = 'outline' | 'underline';
export type SelectPosition = 'auto' | 'top' | 'bottom';

@Component({
  selector: 'app-select',
  imports: [NgSelectModule, FormsModule, CommonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent<T = any> {
  // Inputs
  readonly items = input<SelectOption<T>[]>([]);
  readonly headerTemplate = input<TemplateRef<any> | null>(null);
  readonly placeholder = input<string>('Select option');
  readonly multiple = input<boolean>(false);
  readonly searchable = input<boolean>(true);
  readonly clearable = input<boolean>(true);
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly bindLabel = input<string>('label');
  readonly bindValue = input<string>('value');
  readonly notFoundText = input<string>('No items found');
  readonly addTagText = input<string>('Add item');
  readonly loadingText = input<string>('Loading...');
  readonly closeOnSelect = input<boolean>(true);
  readonly hideSelected = input<boolean>(false);
  readonly maxSelectedItems = input<number | undefined>(undefined);
  readonly groupBy = input<string | ((value: any) => any)>();
  readonly selectOnTab = input<boolean>(false);
  readonly appearance = input<SelectAppearance>('outline');
  readonly dropdownPosition = input<SelectPosition>('auto');
  readonly virtualScroll = input<boolean>(false);
  readonly addTag = input<boolean | ((term: string) => any)>(false);
  readonly minTermLength = input<number>(0);
  readonly typeToSearchText = input<string>('Type to search');

  // Two-way binding for selected value(s)
  readonly value = model<T | T[] | null>(null);

  // Outputs
  readonly valueChange = output<T | T[] | null>();
  readonly searchChange = output<{ term: string; items: SelectOption<T>[] }>();
  readonly selectOpen = output<void>();
  readonly selectClose = output<void>();
  readonly selectClear = output<void>();
  readonly addItem = output<T>();
  readonly removeItem = output<T>();

  // Internal state
  readonly isOpen = signal<boolean>(false);
  readonly searchTerm = signal<string>('');

  // Computed
  readonly cssClass = computed(() => {
    const classes = ['app-select'];
    if (this.appearance() === 'underline') {
      classes.push('app-select--underline');
    }
    if (this.disabled()) {
      classes.push('app-select--disabled');
    }
    if (this.isOpen()) {
      classes.push('app-select--open');
    }
    return classes.join(' ');
  });

  /**
   * Handle value change event
   */
  onChange(value: T | T[] | null): void {
    this.valueChange.emit(value);
  }

  /**
   * Handle select open event
   */
  onOpen(): void {
    this.isOpen.set(true);
    this.selectOpen.emit();
  }

  /**
   * Handle select close event
   */
  onClose(): void {
    this.isOpen.set(false);
    this.selectClose.emit();
  }

  /**
   * Handle clear event
   */
  onClear(): void {
    this.value.set(null);
    this.selectClear.emit();
  }

  /**
   * Handle search event
   */
  onSearch(event: { term: string; items: any[] }): void {
    this.searchTerm.set(event.term);
    this.searchChange.emit(event);
  }

  /**
   * Handle add event
   */
  onAdd(item: T): void {
    this.addItem.emit(item);
  }

  /**
   * Handle remove event
   */
  onRemove(item: T): void {
    this.removeItem.emit(item);
  }

  /**
   * Custom search function
   */
  customSearchFn(term: string, item: SelectOption<T>): boolean {
    const searchTerm = term.toLowerCase();
    return item.label.toLowerCase().includes(searchTerm);
  }

  /**
   * Custom comparison function
   */
  compareWith(item1: any, item2: any): boolean {
    return item1 === item2;
  }
}
