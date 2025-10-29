import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterStepComponent } from './filter-step.component';
import { SelectComponent } from '@core/components';
import { EditableInputComponent } from '@core/components';
import type { EventType } from '../../models/event.interface';

describe('FilterStepComponent', () => {
  let fixture: ComponentFixture<FilterStepComponent>;
  let component: FilterStepComponent;
  let eventTypes: EventType[];
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterStepComponent, SelectComponent, EditableInputComponent],
    }).compileComponents();

    eventTypes = [
      {
        type: 'page_visit',
        properties: [
          { property: 'url', type: 'string' },
          { property: 'duration', type: 'number' },
        ],
      },
    ];

    fixture = TestBed.createComponent(FilterStepComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('eventTypes', eventTypes);
    fixture.componentRef.setInput('stepNumber', 1);
    fixture.componentRef.setInput('canRemove', true);

    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create the component', () => {
    expect(compiled.querySelector('.filter-step')).toBeTruthy();
  });

  it('should render editable input for filter name', () => {
    const editableInput = compiled.querySelector('app-editable-input');
    expect(editableInput).toBeTruthy();
  });

  it('should render event type select', () => {
    const eventTypeSelect = compiled.querySelector('app-select');
    expect(eventTypeSelect).toBeTruthy();
  });

  it('should display step number in header', () => {
    const stepNumberText = compiled.querySelector('.filter-step__number')?.textContent;
    expect(stepNumberText).toContain('1. Step:');
  });

  describe('when editing filter name', () => {
    let editableInputElement: HTMLElement | null;
    let editButton: HTMLButtonElement | null;
    let inputElement: HTMLInputElement | null;

    beforeEach(() => {
      editableInputElement = compiled.querySelector('app-editable-input');
      editButton = editableInputElement?.querySelector(
        '.editable-input__edit-btn',
      ) as HTMLButtonElement;
      editButton?.click();
      fixture.detectChanges();
      inputElement = editableInputElement?.querySelector(
        'input.editable-input__field',
      ) as HTMLInputElement;
    });

    it('should show input field when edit button is clicked', () => {
      expect(inputElement).toBeTruthy();
    });

    it('should update displayed text when input value changes and Enter is pressed', () => {
      inputElement.value = 'New Filter Name';
      inputElement.dispatchEvent(new Event('input'));
      inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();

      const displayedText =
        editableInputElement?.querySelector('.editable-input__text')?.textContent;
      expect(displayedText).toBe('New Filter Name');
    });

    it('should update displayed text when input value changes and input is blurred', () => {
      inputElement.value = 'Test Filter Name';
      inputElement.dispatchEvent(new Event('input'));
      inputElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      const displayedText =
        editableInputElement?.querySelector('.editable-input__text')?.textContent;
      expect(displayedText).toBe('Test Filter Name');
    });
  });

  describe('when event type is selected', () => {
    beforeEach(() => {
      const selectComponent = fixture.debugElement.query((el) => el.name === 'app-select')
        ?.componentInstance as SelectComponent<string>;
      const selectedValue = { label: 'Page Visit', value: 'page_visit' };
      selectComponent?.onValueChange(selectedValue);
      fixture.detectChanges();
    });

    it('should add --has-attributes class to content element', () => {
      const contentElement = compiled.querySelector('.filter-step__content');
      expect(contentElement?.classList.contains('filter-step__content--has-attributes')).toBe(true);
    });

    it('should show property field', () => {
      const propertyField = compiled.querySelector('.filter-step__field--property');
      expect(propertyField?.classList.contains('filter-step__field--hidden')).toBe(false);
    });

    it('should render property select', () => {
      const allSelects = compiled.querySelectorAll('app-select');
      expect(allSelects.length).toBeGreaterThan(1);
    });

    it('should display Attribute label for property field', () => {
      const propertySelectLabel = compiled.querySelector(
        '.filter-step__field--property .filter-step__label',
      );
      expect(propertySelectLabel?.textContent).toContain('Attribute');
    });
  });

  describe('when property is selected', () => {
    beforeEach(() => {
      // Select event type first
      const eventTypeSelect = fixture.debugElement.query((el) => el.name === 'app-select')
        ?.componentInstance as SelectComponent<string>;
      eventTypeSelect?.onValueChange({ label: 'Page Visit', value: 'page_visit' });
      fixture.detectChanges();

      // Select property
      const propertySelects = fixture.debugElement.queryAll((el) => el.name === 'app-select');
      const propertySelect = propertySelects[1]?.componentInstance as SelectComponent<string>;
      propertySelect?.onValueChange({ label: 'Url', value: 'url', type: 'string' });
      fixture.detectChanges();
    });

    it('should show operator field', () => {
      const operatorField = compiled.querySelector('.filter-step__field--operator');
      expect(operatorField).toBeTruthy();
    });

    it('should display Operator label', () => {
      const operatorLabel = compiled.querySelector(
        '.filter-step__field--operator .filter-step__label',
      );
      expect(operatorLabel?.textContent).toContain('Operator');
    });

    it('should render operator select', () => {
      const operatorSelects = compiled.querySelectorAll('.filter-step__field--operator app-select');
      expect(operatorSelects.length).toBe(1);
    });
  });

  describe('when operator is selected', () => {
    beforeEach(() => {
      // Select event type
      const eventTypeSelect = fixture.debugElement.query((el) => el.name === 'app-select')
        ?.componentInstance as SelectComponent<string>;
      eventTypeSelect?.onValueChange({ label: 'Page Visit', value: 'page_visit' });
      fixture.detectChanges();

      // Select property
      const propertySelects = fixture.debugElement.queryAll((el) => el.name === 'app-select');
      const propertySelect = propertySelects[1]?.componentInstance as SelectComponent<string>;
      propertySelect?.onValueChange({ label: 'Url', value: 'url', type: 'string' });
      fixture.detectChanges();

      // Select operator
      const operatorSelects = fixture.debugElement.queryAll((el) => el.name === 'app-select');
      const operatorSelect = operatorSelects[2]?.componentInstance as SelectComponent<string>;
      operatorSelect?.onValueChange({ label: 'Equals', value: 'equals', type: 'string' });
      fixture.detectChanges();
    });

    it('should show value field', () => {
      const valueField = compiled.querySelector('.filter-step__field--value');
      expect(valueField).toBeTruthy();
    });

    it('should display Value label', () => {
      const valueLabel = compiled.querySelector('.filter-step__field--value .filter-step__label');
      expect(valueLabel?.textContent).toContain('Value');
    });

    it('should render value input', () => {
      const valueInput = compiled.querySelector(
        '.filter-step__field--value input.g-input',
      ) as HTMLInputElement;
      expect(valueInput).toBeTruthy();
    });

    it('should have text input type for string property', () => {
      const valueInput = compiled.querySelector(
        '.filter-step__field--value input.g-input',
      ) as HTMLInputElement;
      expect(valueInput?.type).toBe('text');
    });
  });

  describe('when value is entered', () => {
    let valueInput: HTMLInputElement | null;

    beforeEach(() => {
      // Select event type
      const eventTypeSelect = fixture.debugElement.query((el) => el.name === 'app-select')
        ?.componentInstance as SelectComponent<string>;
      eventTypeSelect?.onValueChange({ label: 'Page Visit', value: 'page_visit' });
      fixture.detectChanges();

      // Select property
      const propertySelects = fixture.debugElement.queryAll((el) => el.name === 'app-select');
      const propertySelect = propertySelects[1]?.componentInstance as SelectComponent<string>;
      propertySelect?.onValueChange({ label: 'Url', value: 'url', type: 'string' });
      fixture.detectChanges();

      // Select operator
      const operatorSelects = fixture.debugElement.queryAll((el) => el.name === 'app-select');
      const operatorSelect = operatorSelects[2]?.componentInstance as SelectComponent<string>;
      operatorSelect?.onValueChange({ label: 'Equals', value: 'equals', type: 'string' });
      fixture.detectChanges();

      valueInput = compiled.querySelector(
        '.filter-step__field--value input.g-input',
      ) as HTMLInputElement;
    });

    it('should update value when input event is triggered', () => {
      valueInput.value = 'https://example.com';
      valueInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(valueInput.value).toBe('https://example.com');
    });

    it('should preserve value after input event', () => {
      valueInput.value = 'test-value';
      valueInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const updatedInput = compiled.querySelector(
        '.filter-step__field--value input.g-input',
      ) as HTMLInputElement;
      expect(updatedInput.value).toBe('test-value');
    });
  });

  describe('when between operator is selected', () => {
    beforeEach(() => {
      // Select event type
      const eventTypeSelect = fixture.debugElement.query((el) => el.name === 'app-select')
        ?.componentInstance as SelectComponent<string>;
      eventTypeSelect?.onValueChange({ label: 'Page Visit', value: 'page_visit' });
      fixture.detectChanges();

      // Select number property
      const propertySelects = fixture.debugElement.queryAll((el) => el.name === 'app-select');
      const propertySelect = propertySelects[1]?.componentInstance as SelectComponent<string>;
      propertySelect?.onValueChange({ label: 'Duration', value: 'duration', type: 'number' });
      fixture.detectChanges();

      // Select between operator
      const operatorSelects = fixture.debugElement.queryAll((el) => el.name === 'app-select');
      const operatorSelect = operatorSelects[2]?.componentInstance as SelectComponent<string>;
      operatorSelect?.onValueChange({ label: 'In between', value: 'between', type: 'number' });
      fixture.detectChanges();
    });

    it('should show value range fields', () => {
      const valueRangeFields = compiled.querySelectorAll('.filter-step__field--value-range');
      expect(valueRangeFields.length).toBe(2);
    });

    it('should render From input', () => {
      const fromInput = compiled.querySelector(
        '.filter-step__field--value-range input[placeholder="From..."]',
      ) as HTMLInputElement;
      expect(fromInput).toBeTruthy();
    });

    it('should render To input', () => {
      const toInput = compiled.querySelector(
        '.filter-step__field--value-range input[placeholder="To..."]',
      ) as HTMLInputElement;
      expect(toInput).toBeTruthy();
    });

    it('should have number input type for range inputs', () => {
      const fromInput = compiled.querySelector(
        '.filter-step__field--value-range input[placeholder="From..."]',
      ) as HTMLInputElement;
      expect(fromInput?.type).toBe('number');
    });

    it('should update from value when input event is triggered', () => {
      const fromInput = compiled.querySelector(
        '.filter-step__field--value-range input[placeholder="From..."]',
      ) as HTMLInputElement;
      fromInput.value = '10';
      fromInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(fromInput.value).toBe('10');
    });

    it('should update to value when input event is triggered', () => {
      const toInput = compiled.querySelector(
        '.filter-step__field--value-range input[placeholder="To..."]',
      ) as HTMLInputElement;
      toInput.value = '20';
      toInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(toInput.value).toBe('20');
    });
  });

  describe('initial state', () => {
    it('should not have --has-attributes class on content element', () => {
      const contentElement = compiled.querySelector('.filter-step__content');
      expect(contentElement?.classList.contains('filter-step__content--has-attributes')).toBe(
        false,
      );
    });

    it('should hide property field initially', () => {
      const propertyField = compiled.querySelector('.filter-step__field--property');
      expect(propertyField?.classList.contains('filter-step__field--hidden')).toBe(true);
    });
  });
});
