import api from './api';
import { ApiResponse } from '../types/auth';
import { Character, CharacterRarity } from '../types/character';

class CharacterService {
  async getCharacter(characterId: number): Promise<Character> {
    const response = await api.get<ApiResponse<Character>>(`/game/characters/${characterId}`);
    return response.data.data;
  }

  async getCharacters(page: number = 0, size: number = 20): Promise<{
    content: Character[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    const params: any = { page, size };
    const response = await api.get<ApiResponse<{
      content: Character[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    }>>('/game/characters', { params });
    return response.data.data;
  }
}

export const characterService = new CharacterService();
export default characterService;