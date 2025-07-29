import api from './api';
import { Habit, HabitRequest, HabitsPageResponse } from '../types/habit';
import { ApiResponse } from '../types/auth';
import { GameReward } from '../types/game';

class HabitService {
  async getHabits(page: number, size: number): Promise<HabitsPageResponse> {
    const response = await api.get<ApiResponse<HabitsPageResponse>>('/habits', {
      params: { page, size },
    });
    return response.data.data;
  }

  async createHabit(data: HabitRequest): Promise<Habit> {
    const response = await api.post<ApiResponse<Habit>>('/habits', data);
    return response.data.data;
  }

  async updateHabit(habitId: number, data: HabitRequest): Promise<Habit> {
    const response = await api.patch<ApiResponse<Habit>>(`/habits/${habitId}`, data);
    return response.data.data;
  }

  async deleteHabit(habitId: number): Promise<void> {
    await api.delete(`/habits/${habitId}`);
  }

  async completeHabit(habitId: number): Promise<GameReward> {
    const response = await api.post<ApiResponse<GameReward>>(`/habits/${habitId}/complete`);
    return response.data.data;
  }

  getRepeatDaysLabel(repeatDays: string[]): string {
    const daysMap: { [key: string]: string } = {
      MONDAY: '월',
      TUESDAY: '화',
      WEDNESDAY: '수',
      THURSDAY: '목',
      FRIDAY: '금',
      SATURDAY: '토',
      SUNDAY: '일',
    };

    if (repeatDays.length === 7) return '매일';
    if (repeatDays.length === 0) return '반복 없음';

    return repeatDays.map(day => daysMap[day] || '').join(', ');
  }
}

export const habitService = new HabitService();
export default habitService;
