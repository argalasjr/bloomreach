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
      inputElement!.value = 'Test Filter Name';
      inputElement!.dispatchEvent(new Event('input'));
      inputElement!.dispatchEvent(new Event('blur'));
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
