export interface EventProperty {
  property: string;
  type: 'string' | 'number';
}

export interface EventType {
  type: string;
  properties: EventProperty[];
}

export interface EventsResponse {
  events: EventType[];
}

// Specific event type names
export type EventTypeName =
  | 'session_start'
  | 'session_end'
  | 'page_visit'
  | 'purchase'
  | 'cart_update'
  | 'view_item';
