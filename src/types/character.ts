export interface Character {
  id: number;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  imageUrl?: string;
  isOwned: boolean;
  isActive: boolean;
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
  character: Character;
}

export interface CharacterStats {
  id: number;
  characterId: number;
  level: number;
  maxHappiness: number;
  happinessDecayRate: number;
  experienceGainRate: number;
}

export interface CreateUserCharacterRequest {
  characterId: number;
  nickname?: string;
}

export interface UpdateUserCharacterRequest {
  nickname?: string;
  isActive?: boolean;
}

export interface FeedCharacterRequest {
  foodType: 'basic' | 'premium' | 'special';
}

export interface PlayWithCharacterRequest {
  activityType: 'pet' | 'play' | 'walk';
} 