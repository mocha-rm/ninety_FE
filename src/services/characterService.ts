import api from './api';
import { ApiResponse } from '../types/auth';
import { 
  Character, 
  UserCharacter, 
  CharacterStats,
  CreateUserCharacterRequest, 
  UpdateUserCharacterRequest,
  FeedCharacterRequest,
  PlayWithCharacterRequest
} from '../types/character';

class CharacterService {
  // 캐릭터 상점 목록 조회
  async getCharacterShop(): Promise<Character[]> {
    const response = await api.get<ApiResponse<Character[]>>('/api/characters/shop');
    return response.data.data;
  }

  // 캐릭터 구매
  async purchaseCharacter(characterId: number): Promise<Character> {
    const response = await api.post<ApiResponse<Character>>(`/api/characters/shop/purchase/${characterId}`);
    return response.data.data;
  }

  // 사용자 캐릭터 목록 조회
  async getUserCharacters(): Promise<UserCharacter[]> {
    const response = await api.get<ApiResponse<UserCharacter[]>>('/api/characters/user-characters');
    return response.data.data;
  }

  // 캐릭터 입양 (구매 후 활성화)
  async adoptCharacter(data: CreateUserCharacterRequest): Promise<UserCharacter> {
    const response = await api.post<ApiResponse<UserCharacter>>('/api/characters/adopt', data);
    return response.data.data;
  }

  // 캐릭터 정보 수정
  async updateUserCharacter(characterId: number, data: UpdateUserCharacterRequest): Promise<UserCharacter> {
    const response = await api.patch<ApiResponse<UserCharacter>>(`/api/characters/${characterId}`, data);
    return response.data.data;
  }

  // 캐릭터에게 먹이 주기
  async feedCharacter(characterId: number, data: FeedCharacterRequest): Promise<{
    happinessGained: number;
    experienceGained: number;
    newHappiness: number;
    newExperience: number;
  }> {
    const response = await api.post<ApiResponse<{
      happinessGained: number;
      experienceGained: number;
      newHappiness: number;
      newExperience: number;
    }>>(`/api/characters/${characterId}/feed`, data);
    return response.data.data;
  }

  // 캐릭터와 놀기
  async playWithCharacter(characterId: number, data: PlayWithCharacterRequest): Promise<{
    happinessGained: number;
    experienceGained: number;
    newHappiness: number;
    newExperience: number;
  }> {
    const response = await api.post<ApiResponse<{
      happinessGained: number;
      experienceGained: number;
      newHappiness: number;
      newExperience: number;
    }>>(`/api/characters/${characterId}/play`, data);
    return response.data.data;
  }

  // 캐릭터 레벨업 체크
  async checkCharacterLevelUp(characterId: number): Promise<{
    leveledUp: boolean;
    newLevel?: number;
    newExperience?: number;
  }> {
    const response = await api.post<ApiResponse<{
      leveledUp: boolean;
      newLevel?: number;
      newExperience?: number;
    }>>(`/api/characters/${characterId}/level-up`);
    return response.data.data;
  }

  // 캐릭터 통계 조회
  async getCharacterStats(characterId: number): Promise<CharacterStats> {
    const response = await api.get<ApiResponse<CharacterStats>>(`/api/characters/${characterId}/stats`);
    return response.data.data;
  }

  // 희귀도별 색상 반환 헬퍼 함수
  getRarityColor(rarity: string): string {
    const colorMap: { [key: string]: string } = {
      common: '#9e9e9e',
      rare: '#2196f3',
      epic: '#9c27b0',
      legendary: '#ff9800',
    };
    return colorMap[rarity] || '#9e9e9e';
  }

  // 희귀도별 라벨 반환 헬퍼 함수
  getRarityLabel(rarity: string): string {
    const labelMap: { [key: string]: string } = {
      common: '일반',
      rare: '희귀',
      epic: '에픽',
      legendary: '전설',
    };
    return labelMap[rarity] || '일반';
  }

  // 행복도 상태 반환 헬퍼 함수
  getHappinessStatus(happiness: number): { status: string; color: string } {
    if (happiness >= 80) return { status: '매우 행복', color: '#4caf50' };
    if (happiness >= 60) return { status: '행복', color: '#8bc34a' };
    if (happiness >= 40) return { status: '보통', color: '#ffc107' };
    if (happiness >= 20) return { status: '슬픔', color: '#ff9800' };
    return { status: '매우 슬픔', color: '#f44336' };
  }
}

export default new CharacterService(); 