import { Directive, input, output, signal, computed } from '@angular/core';
import { SelectTab } from '@core/models';

@Directive({
  selector: '[appSelectTabs]',
  standalone: true,
})
export class SelectTabsDirective<T = any> {
  /**
   * Tabs configuration
   */
  readonly tabs = input.required<SelectTab<T>[]>({ alias: 'appSelectTabs' });

  /**
   * Active tab index
   */
  readonly activeTabIndex = signal<number>(0);

  /**
   * Computed active tab
   */
  readonly activeTab = computed(() => {
    const index = this.activeTabIndex();
    const tabsList = this.tabs();
    return tabsList[index] || null;
  });

  /**
   * Computed filtered items based on active tab
   */
  readonly filteredItems = computed(() => {
    const tab = this.activeTab();
    return tab ? tab.items : [];
  });

  /**
   * Tab change event
   */
  readonly tabChange = output<SelectTab<T>>();

  /**
   * Switch to a specific tab
   */
  switchTab(index: number): void {
    const tabsList = this.tabs();
    if (index >= 0 && index < tabsList.length) {
      this.activeTabIndex.set(index);
      this.tabChange.emit(tabsList[index]);
    }
  }

  /**
   * Get tab by value
   */
  getTabByValue(value: string): SelectTab<T> | null {
    return this.tabs().find((tab) => tab.value === value) || null;
  }

  /**
   * Find which tab contains a specific item value
   */
  findTabContainingValue(itemValue: any): SelectTab<T> | null {
    for (const tab of this.tabs()) {
      const found = tab.items.find((item) => item.value === itemValue);
      if (found) {
        return tab;
      }
    }
    return null;
  }

  /**
   * Set active tab based on item value
   */
  setActiveTabByItemValue(itemValue: any): void {
    const tab = this.findTabContainingValue(itemValue);
    if (tab) {
      const index = this.tabs().indexOf(tab);
      this.activeTabIndex.set(index);
    }
  }
}
