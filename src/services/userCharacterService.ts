import api from './api';
import { ApiResponse } from '../types/auth';
import { UserCharacter, UserCharacterActivationRequest, UserCharacterNicknameUpdateRequest } from '../types/character';

class UserCharacterService {
  async purchaseCharacter(characterId: number): Promise<void> {
    await api.post<ApiResponse<void>>(`/game/characters/${characterId}/purchase`);
  }

  async getUserCharacters(page: number = 0, size: number = 20): Promise<{
    content: UserCharacter[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    const params: any = { page, size };
    const response = await api.get<ApiResponse<{
      content: UserCharacter[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    }>>('/game/user-characters', { params });
    return response.data.data;
  }

  async getUserCharacter(userCharacterId: number): Promise<UserCharacter> {
    const response = await api.get<ApiResponse<UserCharacter>>(`/game/user-characters/${userCharacterId}`);
    return response.data.data;
  }

  async manageCharacterActivation(userCharacterId: number, data: UserCharacterActivationRequest): Promise<UserCharacter> {
    const response = await api.patch<ApiResponse<UserCharacter>>(`/game/user-characters/${userCharacterId}/activation`, data);
    return response.data.data;
  }

  async updateCharacterNickname(userCharacterId: number, data: UserCharacterNicknameUpdateRequest): Promise<UserCharacter> {
    const response = await api.patch<ApiResponse<UserCharacter>>(`/game/user-characters/${userCharacterId}`, data);
    return response.data.data;
  }

  async feedCharacter(userCharacterId: number): Promise<void> {
    await api.post<ApiResponse<void>>(`/game/user-characters/${userCharacterId}/feeding`);
  }

  async playWithCharacter(userCharacterId: number): Promise<void> {
    await api.post<ApiResponse<void>>(`/game/user-characters/${userCharacterId}/playing`);
  }
}

export const userCharacterService = new UserCharacterService();
export default userCharacterService;
