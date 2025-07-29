export interface Habit {
  id: number;
  userId: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  repeatDays: string[];
  reminderTime: string;
  isAlarmEnabled: boolean;
}

export interface HabitRequest {
  title: string;
  description: string;
  startAt: string; // YYYY-MM-DD
  repeatDays: string[]; // ["MONDAY", "TUESDAY"]
  isAlarmEnabled: boolean;
  reminderTime: string; // HH:mm
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface HabitsPageResponse {
  content: Habit[];
  pageable: Pageable;
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  empty: boolean;
}
