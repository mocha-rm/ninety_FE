export enum CharacterRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export interface Character {
  id: number;
  name: string;
  description: string;
  rarity: CharacterRarity;
  price: number;
  imageUrl: string;
  createdAt: string;
}

export interface UserCharacter {
  id: number;
  userId: number;
  characterId: number;
  nickname?: string;
  level: number;
  experience: number;
  happiness: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  character: Character; // 백엔드 DTO와 다르게 Character 객체를 포함
}

export interface UserCharacterUpdateRequest {
  nickname?: string;
  isActive?: boolean;
}
