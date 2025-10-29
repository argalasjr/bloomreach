import {
  Component,
  input,
  output,
  model,
  signal,
  computed,
  TemplateRef,
  viewChild,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectTab, SelectOption, SelectAppearance, SelectPosition } from '@core/models';

@Component({
  selector: 'app-select',
  imports: [NgSelectModule, FormsModule, CommonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent<T = any> {
  // View children
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // Inputs
  readonly items = input<SelectOption<T>[]>([]);
  readonly tabs = input<SelectTab<T>[]>([]);
  readonly exclusiveOption = input<SelectOption<T> | null>(null);
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
  readonly value = model<SelectOption<T> | SelectOption<T>[] | null>(null);

  // Outputs
  readonly valueChange = output<SelectOption<T> | SelectOption<T>[] | null>();
  readonly searchChange = output<{ term: string; items: SelectOption<T>[] }>();
  readonly selectOpen = output<void>();
  readonly selectClose = output<void>();
  readonly selectClear = output<void>();
  readonly addItem = output<T>();
  readonly removeItem = output<T>();

  // Internal state
  readonly isOpen = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  readonly activeTabIndex = signal<number>(0);

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
   * Check if tabs are enabled
   */
  readonly hasTabs = computed(() => this.tabs().length > 0);

  /**
   * Get active tab
   */
  readonly activeTab = computed(() => {
    const tabsList = this.tabs();
    const index = this.activeTabIndex();
    return tabsList[index] || null;
  });

  /**
   * Get the items to display - either from active tab or from items input
   */
  readonly displayItems = computed(() => {
    if (this.hasTabs()) {
      const tab = this.activeTab();
      return tab ? tab.items : [];
    }
    return this.items();
  });

  /**
   * Get filtered items based on search term
   */
  readonly filteredItems = computed(() => {
    const items = this.displayItems();
    const term = this.searchTerm().toLowerCase().trim();

    if (!term || !this.searchable()) {
      return items;
    }

    return items.filter((item) => {
      const label = item[this.bindLabel()];
      return label && label.toString().toLowerCase().includes(term);
    });
  });

  /**
   * Handle value change event from ngModelChange
   */
  onValueChange(value: SelectOption<T> | SelectOption<T>[] | null): void {
    // Filter out Event objects (from input elements)
    if (value instanceof Event) {
      return;
    }

    this.value.set(value);
    this.valueChange.emit(value);
  }

  /**
   * Switch to a specific tab
   */
  switchTab(index: number): void {
    const tabsList = this.tabs();
    if (index >= 0 && index < tabsList.length) {
      this.activeTabIndex.set(index);
    }
  }

  /**
   * Handle select open event
   */
  onOpen(): void {
    this.isOpen.set(true);
    this.searchTerm.set('');
    this.selectOpen.emit();

    // Focus search input if searchable
    if (this.searchable()) {
      setTimeout(() => {
        this.searchInput()?.nativeElement?.focus();
      }, 0);
    }
  }

  /**
   * Handle select close event
   */
  onClose(): void {
    this.isOpen.set(false);
    this.searchTerm.set('');
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

  /**
   * Handle search input event
   */
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  /**
   * Clear search term
   */
  clearSearch(): void {
    this.searchTerm.set('');
  }
}
