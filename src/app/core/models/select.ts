export interface SelectOption<T = any> {
  label: string;
  value: T;
  type?: 'string' | 'number' | null;
  [key: string]: any;
}

export interface SelectTab<T = any> {
  label: string;
  value: string;
  items: SelectOption<T>[];
}

export type SelectAppearance = 'outline' | 'underline';
export type SelectPosition = 'auto' | 'top' | 'bottom';