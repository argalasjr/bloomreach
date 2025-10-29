import { Component, input, output, signal, linkedSignal } from '@angular/core';


@Component({
  selector: 'app-editable-input',
  imports: [],
  templateUrl: './editable-input.component.html',
  styleUrl: './editable-input.component.scss',
})
export class EditableInputComponent {
  // Inputs
  readonly value = input.required<string>();
  readonly placeholder = input<string>('Enter text...');
  readonly editIcon = input<string>('✏️');

  // Outputs
  readonly valueChange = output<string>();

  // State
  readonly isEditing = signal(false);
  readonly editValue = linkedSignal(() => this.value());

  /**
   * Start editing mode
   */
  startEditing(): void {
    this.isEditing.set(true);
  }

  /**
   * Handle input changes
   */
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.editValue.set(input.value);
  }

  /**
   * Finish editing and emit the new value
   */
  finishEditing(): void {
    const newValue = this.editValue() || 'Unnamed';
    this.valueChange.emit(newValue);
    this.isEditing.set(false);
  }

  /**
   * Handle keyboard shortcuts
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.finishEditing();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      // Reset to original value and close
      this.editValue.set(this.value());
      this.isEditing.set(false);
    }
  }
}

