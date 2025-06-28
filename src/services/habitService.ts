import api from './api';
import { ApiResponse } from '../types/auth';

export interface Habit {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startAt: string; // LocalDate
  endAt: string; // LocalDate
  repeatDays: string[]; // DayOfWeek enum values
  isAlarmEnabled: boolean;
  reminderTime?: string; // LocalTime
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitRequest {
  title: string;
  description?: string;
  startAt: string; // LocalDate
  repeatDays: string[]; // DayOfWeek enum values
  isAlarmEnabled: boolean;
  reminderTime?: string; // LocalTime
}

export interface UpdateHabitRequest {
  title?: string;
  description?: string;
  startAt?: string; // LocalDate
  repeatDays?: string[]; // DayOfWeek enum values
  isAlarmEnabled?: boolean;
  reminderTime?: string; // LocalTime
}

export interface HabitCompletion {
  id: number;
  habitId: number;
  completedAt: string;
  notes?: string;
}

export interface CompleteHabitRequest {
  notes?: string;
}

export interface HabitsPageResponse {
  content: Habit[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

class HabitService {
  // 습관 목록 조회 (페이지네이션)
  async getHabits(page: number = 0, size: number = 20): Promise<HabitsPageResponse> {
    const response = await api.get<ApiResponse<HabitsPageResponse>>(`/api/habits?page=${page}&size=${size}`);
    return response.data.data;
  }

  // 특정 습관 조회
  async getHabit(habitId: number): Promise<Habit> {
    const response = await api.get<ApiResponse<Habit>>(`/api/habits/${habitId}`);
    return response.data.data;
  }

  // 습관 생성
  async createHabit(data: CreateHabitRequest): Promise<Habit> {
    const response = await api.post<ApiResponse<Habit>>('/api/habits', data);
    return response.data.data;
  }

  // 습관 수정
  async updateHabit(habitId: number, data: UpdateHabitRequest): Promise<Habit> {
    const response = await api.patch<ApiResponse<Habit>>(`/api/habits/${habitId}`, data);
    return response.data.data;
  }

  // 습관 삭제
  async deleteHabit(habitId: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/api/habits/${habitId}`);
  }

  // 습관 완료 체크
  async completeHabit(habitId: number, data?: CompleteHabitRequest): Promise<HabitCompletion> {
    const response = await api.post<ApiResponse<HabitCompletion>>(`/api/habits/${habitId}/complete`, data || {});
    return response.data.data;
  }

  // 습관 완료 취소
  async uncompleteHabit(habitId: number, completionId: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/api/habits/${habitId}/complete/${completionId}`);
  }

  // 오늘 완료된 습관 조회
  async getTodayCompletions(): Promise<HabitCompletion[]> {
    const response = await api.get<ApiResponse<HabitCompletion[]>>('/api/habits/completions/today');
    return response.data.data;
  }

  // 특정 날짜의 습관 완료 조회
  async getCompletionsByDate(date: string): Promise<HabitCompletion[]> {
    const response = await api.get<ApiResponse<HabitCompletion[]>>(`/api/habits/completions/${date}`);
    return response.data.data;
  }

  // 습관 통계 조회
  async getHabitStats(habitId: number, period: 'week' | 'month' | 'year' = 'week'): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/api/habits/${habitId}/stats?period=${period}`);
    return response.data.data;
  }

  // 전체 습관 통계 조회
  async getOverallStats(period: 'week' | 'month' | 'year' = 'week'): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/api/habits/stats?period=${period}`);
    return response.data.data;
  }

  // DayOfWeek enum을 한국어로 변환하는 헬퍼 함수
  getDayOfWeekLabel(dayOfWeek: string): string {
    const dayMap: { [key: string]: string } = {
      'MONDAY': '월',
      'TUESDAY': '화',
      'WEDNESDAY': '수',
      'THURSDAY': '목',
      'FRIDAY': '금',
      'SATURDAY': '토',
      'SUNDAY': '일',
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  }

  // repeatDays를 한국어 문자열로 변환
  getRepeatDaysLabel(repeatDays: string[]): string {
    if (!repeatDays || repeatDays.length === 0) return '반복 없음';
    return repeatDays.map(day => this.getDayOfWeekLabel(day)).join(', ');
  }
}

export const habitService = new HabitService();
export default habitService; 