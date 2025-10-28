# SelectComponent Usage Guide

A reusable, signal-based select/multiselect component built with ng-select.

## Features

- ✅ Single & Multi-select
- ✅ Full-text search
- ✅ Signal-based (Angular 21+)
- ✅ Two-way binding with signals
- ✅ **ControlValueAccessor** for Angular Forms (Reactive & Template-driven)
- ✅ Custom header templates
- ✅ Virtual scrolling
- ✅ Grouping support
- ✅ Add custom tags
- ✅ Fully typed with TypeScript generics

## Basic Usage

### Single Select

```typescript
import { Component, signal } from '@angular/core';
import { SelectComponent, SelectOption } from '@core/components';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  template: `
    <app-select
      [items]="cities()"
      [(value)]="selectedCity"
      placeholder="Select a city"
      (valueChange)="onCityChange($event)">
    </app-select>
  `
})
export class ExampleComponent {
  cities = signal<SelectOption[]>([
    { label: 'New York', value: 1 },
    { label: 'Los Angeles', value: 2 },
    { label: 'Chicago', value: 3 }
  ]);

  selectedCity = signal<number | null>(null);

  onCityChange(city: number | null) {
    console.log('Selected city:', city);
  }
}
```

### Multi-select

```typescript
@Component({
  template: `
    <app-select
      [items]="fruits()"
      [multiple]="true"
      [(value)]="selectedFruits"
      placeholder="Select fruits">
    </app-select>
  `
})
export class ExampleComponent {
  fruits = signal<SelectOption[]>([
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Orange', value: 'orange' }
  ]);

  selectedFruits = signal<string[]>([]);
}
```

### With Search

```typescript
@Component({
  template: `
    <app-select
      [items]="products()"
      [searchable]="true"
      [minTermLength]="2"
      placeholder="Search products..."
      (searchChange)="onSearch($event)">
    </app-select>
  `
})
export class ExampleComponent {
  products = signal<SelectOption[]>([...]);

  onSearch(event: { term: string; items: SelectOption[] }) {
    console.log('Search term:', event.term);
    console.log('Filtered items:', event.items);
  }
}
```

### With Grouping

```typescript
@Component({
  template: `
    <app-select
      [items]="cities()"
      [groupBy]="'country'"
      placeholder="Select a city">
    </app-select>
  `
})
export class ExampleComponent {
  cities = signal<SelectOption[]>([
    { label: 'New York', value: 1, country: 'USA' },
    { label: 'London', value: 2, country: 'UK' },
    { label: 'Los Angeles', value: 3, country: 'USA' },
    { label: 'Manchester', value: 4, country: 'UK' }
  ]);
}
```

### Custom Appearance

```typescript
@Component({
  template: `
    <!-- Outline (default) -->
    <app-select
      [items]="items()"
      [appearance]="'outline'">
    </app-select>

    <!-- Underline -->
    <app-select
      [items]="items()"
      [appearance]="'underline'">
    </app-select>
  `
})
```

### Add Custom Tags

```typescript
@Component({
  template: `
    <app-select
      [items]="tags()"
      [multiple]="true"
      [addTag]="true"
      addTagText="Create new tag"
      (addItem)="onAddTag($event)">
    </app-select>
  `
})
export class ExampleComponent {
  tags = signal<SelectOption[]>([
    { label: 'Angular', value: 'angular' },
    { label: 'React', value: 'react' }
  ]);

  onAddTag(tag: string) {
    console.log('New tag:', tag);
    this.tags.update(current => [
      ...current,
      { label: tag, value: tag.toLowerCase() }
    ]);
  }
}
```

### With Virtual Scroll

```typescript
@Component({
  template: `
    <app-select
      [items]="largeDataset()"
      [virtualScroll]="true"
      placeholder="Select from 10,000 items">
    </app-select>
  `
})
export class ExampleComponent {
  largeDataset = signal<SelectOption[]>(
    Array.from({ length: 10000 }, (_, i) => ({
      label: `Item ${i + 1}`,
      value: i + 1
    }))
  );
}
```

### Disabled State

```typescript
@Component({
  template: `
    <app-select
      [items]="items()"
      [disabled]="true"
      placeholder="This is disabled">
    </app-select>

    <!-- Specific items disabled -->
    <app-select
      [items]="itemsWithDisabled()">
    </app-select>
  `
})
export class ExampleComponent {
  itemsWithDisabled = signal<SelectOption[]>([
    { label: 'Available', value: 1, disabled: false },
    { label: 'Unavailable', value: 2, disabled: true },
    { label: 'Available', value: 3, disabled: false }
  ]);
}
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `items` | `SelectOption[]` | `[]` | Array of options to display |
| `placeholder` | `string` | `'Select option'` | Placeholder text |
| `multiple` | `boolean` | `false` | Enable multi-select |
| `searchable` | `boolean` | `true` | Enable search |
| `clearable` | `boolean` | `true` | Show clear button |
| `disabled` | `boolean` | `false` | Disable the select |
| `loading` | `boolean` | `false` | Show loading spinner |
| `bindLabel` | `string` | `'label'` | Property to use for display |
| `bindValue` | `string` | `'value'` | Property to use for value |
| `notFoundText` | `string` | `'No items found'` | Text when no items match |
| `addTagText` | `string` | `'Add item'` | Text for add tag option |
| `loadingText` | `string` | `'Loading...'` | Loading text |
| `closeOnSelect` | `boolean` | `true` | Close dropdown on select |
| `hideSelected` | `boolean` | `false` | Hide selected items from list |
| `maxSelectedItems` | `number \| undefined` | `undefined` | Max items in multi-select |
| `groupBy` | `string \| undefined` | `undefined` | Property to group by |
| `selectOnTab` | `boolean` | `false` | Select on tab key |
| `appearance` | `'outline' \| 'underline'` | `'outline'` | Visual style |
| `dropdownPosition` | `'auto' \| 'top' \| 'bottom'` | `'auto'` | Dropdown position |
| `virtualScroll` | `boolean` | `false` | Enable virtual scrolling |
| `addTag` | `boolean \| function` | `false` | Allow adding custom tags |
| `minTermLength` | `number` | `0` | Min characters to start search |
| `typeToSearchText` | `string` | `'Type to search'` | Hint text for search |

## Output Events

| Event | Type | Description |
|-------|------|-------------|
| `valueChange` | `T \| T[] \| null` | Emitted when value changes |
| `searchChange` | `{ term: string; items: SelectOption[] }` | Emitted on search |
| `selectOpen` | `void` | Emitted when dropdown opens |
| `selectClose` | `void` | Emitted when dropdown closes |
| `selectClear` | `void` | Emitted when cleared |
| `addItem` | `T` | Emitted when item added |
| `removeItem` | `T` | Emitted when item removed |

## Forms Integration

### Reactive Forms (Recommended)

The component implements `ControlValueAccessor` and works seamlessly with Angular Reactive Forms:

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectComponent, SelectOption } from '@core/components';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, SelectComponent],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <div>
        <label>Country</label>
        <app-select
          formControlName="country"
          [items]="countries()"
          placeholder="Select a country">
        </app-select>
        @if (userForm.get('country')?.invalid && userForm.get('country')?.touched) {
          <span class="error">Country is required</span>
        }
      </div>

      <div>
        <label>Skills</label>
        <app-select
          formControlName="skills"
          [items]="skills()"
          [multiple]="true"
          placeholder="Select skills">
        </app-select>
      </div>

      <button type="submit" [disabled]="userForm.invalid">Submit</button>
    </form>
  `
})
export class UserFormComponent {
  countries = signal<SelectOption[]>([
    { label: 'United States', value: 'us' },
    { label: 'United Kingdom', value: 'uk' },
    { label: 'Canada', value: 'ca' }
  ]);

  skills = signal<SelectOption[]>([
    { label: 'Angular', value: 'angular' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'RxJS', value: 'rxjs' }
  ]);

  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      country: [null, Validators.required],
      skills: [[], Validators.minLength(1)]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
    }
  }
}
```

### Template-Driven Forms

```typescript
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, SelectOption } from '@core/components';

@Component({
  selector: 'app-simple-form',
  imports: [FormsModule, SelectComponent],
  template: `
    <form #form="ngForm" (ngSubmit)="onSubmit()">
      <div>
        <label>Category</label>
        <app-select
          [(ngModel)]="formData.category"
          name="category"
          [items]="categories()"
          required
          placeholder="Select category">
        </app-select>
      </div>

      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `
})
export class SimpleFormComponent {
  categories = signal<SelectOption[]>([
    { label: 'Technology', value: 'tech' },
    { label: 'Business', value: 'business' },
    { label: 'Science', value: 'science' }
  ]);

  formData = {
    category: null
  };

  onSubmit() {
    console.log(this.formData);
  }
}
```

### Programmatic Value Setting

```typescript
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-example',
  imports: [ReactiveFormsModule, SelectComponent],
  template: `
    <app-select
      [formControl]="cityControl"
      [items]="cities()">
    </app-select>

    <button (click)="selectNewYork()">Select New York</button>
    <button (click)="clearSelection()">Clear</button>
    <button (click)="disableSelect()">Disable</button>
  `
})
export class ExampleComponent implements OnInit {
  cityControl = new FormControl<number | null>(null);

  cities = signal<SelectOption[]>([
    { label: 'New York', value: 1 },
    { label: 'Los Angeles', value: 2 },
    { label: 'Chicago', value: 3 }
  ]);

  ngOnInit() {
    // Listen to value changes
    this.cityControl.valueChanges.subscribe(value => {
      console.log('City changed:', value);
    });
  }

  selectNewYork() {
    this.cityControl.setValue(1);
  }

  clearSelection() {
    this.cityControl.setValue(null);
  }

  disableSelect() {
    this.cityControl.disable();
  }
}
```

### With Custom Header Template

```typescript
import { Component, signal } from '@angular/core';
import { SelectComponent, SelectOption } from '@core/components';

@Component({
  selector: 'app-operator-select',
  imports: [SelectComponent],
  template: `
    <app-select
      [items]="operators()"
      [(ngModel)]="selectedOperator"
      [headerTemplate]="propertyType() ? headerTpl : null"
      placeholder="Select operator">
    </app-select>

    <ng-template #headerTpl>
      <div class="operator-header">
        <span>Property Type:</span>
        <strong>{{ propertyType() }}</strong>
      </div>
    </ng-template>
  `
})
export class OperatorSelectComponent {
  propertyType = signal<string>('number');

  operators = signal<SelectOption[]>([
    { label: 'Equal to', value: 'equals' },
    { label: 'Greater than', value: 'gt' },
    { label: 'Less than', value: 'lt' }
  ]);

  selectedOperator = signal<string | null>(null);
}
```

## TypeScript Generics

The component supports TypeScript generics for type-safe value handling:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  template: `
    <app-select<User>
      [items]="users()"
      [(value)]="selectedUser">
    </app-select>
  `
})
export class ExampleComponent {
  users = signal<SelectOption<User>[]>([
    { label: 'John Doe', value: { id: 1, name: 'John', email: 'john@example.com' } },
    { label: 'Jane Smith', value: { id: 2, name: 'Jane', email: 'jane@example.com' } }
  ]);

  selectedUser = signal<User | null>(null);
}
```

## Styling

The component includes default styles but can be customized:

```scss
// In your component styles
::ng-deep {
  .app-select {
    .ng-select-container {
      border-color: #your-color;
    }
  }
}
```

## Import

```typescript
import { SelectComponent, SelectOption } from '@core/components';
```

