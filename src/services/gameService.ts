import api from './api';
import { ApiResponse } from '../types/auth';
import { 
  UserGameData, 
  GameReward, 
  CreateGameRewardRequest, 
  UpdateUserGameDataRequest 
} from '../types/game';

class GameService {
  // 사용자 게임 데이터 조회
  async getUserGameData(): Promise<UserGameData> {
    const response = await api.get<ApiResponse<UserGameData>>('/api/game/user-data');
    return response.data.data;
  }

  // 사용자 게임 데이터 생성 (최초 로그인시)
  async createUserGameData(): Promise<UserGameData> {
    const response = await api.post<ApiResponse<UserGameData>>('/api/game/user-data');
    return response.data.data;
  }

  // 사용자 게임 데이터 업데이트
  async updateUserGameData(data: UpdateUserGameDataRequest): Promise<UserGameData> {
    const response = await api.patch<ApiResponse<UserGameData>>('/api/game/user-data', data);
    return response.data.data;
  }

  // 습관 완료시 보상 지급
  async giveHabitCompletionReward(habitId: number): Promise<GameReward> {
    const response = await api.post<ApiResponse<GameReward>>(`/api/game/rewards/habit-completion/${habitId}`);
    return response.data.data;
  }

  // 보상 히스토리 조회
  async getRewardHistory(page: number = 0, size: number = 20): Promise<{
    content: GameReward[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    const response = await api.get<ApiResponse<{
      content: GameReward[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    }>>(`/api/game/rewards?page=${page}&size=${size}`);
    return response.data.data;
  }

  // 레벨업 체크 및 처리
  async checkAndProcessLevelUp(): Promise<{
    leveledUp: boolean;
    newLevel?: number;
    newExperience?: number;
  }> {
    const response = await api.post<ApiResponse<{
      leveledUp: boolean;
      newLevel?: number;
      newExperience?: number;
    }>>('/api/game/level-up');
    return response.data.data;
  }

  // 경험치 계산 헬퍼 함수
  calculateExperienceForLevel(level: number): number {
    return level * 100; // 레벨당 100 경험치 필요
  }

  // 레벨 계산 헬퍼 함수
  calculateLevel(experience: number): number {
    return Math.floor(experience / 100) + 1;
  }

  // 다음 레벨까지 필요한 경험치 계산
  calculateExperienceToNextLevel(currentExperience: number): number {
    const currentLevel = this.calculateLevel(currentExperience);
    const experienceForNextLevel = this.calculateExperienceForLevel(currentLevel);
    return Math.max(0, experienceForNextLevel - currentExperience);
  }
}

export default new GameService(); 