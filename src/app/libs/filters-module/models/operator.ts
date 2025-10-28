import { SelectOption, SelectTab } from '@core/models';

/**
 * String operator options
 */
export const STRING_OPERATORS: SelectOption<string>[] = [
  { label: 'Equals', value: 'equals', type: 'string' },
  { label: 'Does not equal', value: 'does_not_equal', type: 'string' },
  { label: 'Contains', value: 'contains', type: 'string' },
  { label: 'Does not contain', value: 'does_not_contain', type: 'string' },
];

/**
 * Number operator options
 */
export const NUMBER_OPERATORS: SelectOption<string>[] = [
  { label: 'Equals to', value: 'equals', type: 'number' },
  { label: 'In between', value: 'between', type: 'number' },
  { label: 'Less than', value: 'less_than', type: 'number' },
  { label: 'Greater than', value: 'greater_than', type: 'number' },
];

/**
 * Operator tabs for tabbed select interface
 */
export const OPERATOR_TABS: SelectTab<string>[] = [
  {
    label: 'String',
    value: 'string',
    items: STRING_OPERATORS,
  },
  {
    label: 'Number',
    value: 'number',
    items: NUMBER_OPERATORS,
  },
];
