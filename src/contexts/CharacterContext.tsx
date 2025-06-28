import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Character, UserCharacter } from '../types/character';
import characterService from '../services/characterService';
import { useAuth } from './AuthContext';
import { useGame } from './GameContext';

interface CharacterContextType {
  characterShop: Character[];
  userCharacters: UserCharacter[];
  activeCharacter: UserCharacter | null;
  loading: boolean;
  refreshCharacterShop: () => Promise<void>;
  refreshUserCharacters: () => Promise<void>;
  purchaseCharacter: (characterId: number) => Promise<boolean>;
  adoptCharacter: (characterId: number, nickname?: string) => Promise<boolean>;
  feedCharacter: (characterId: number, foodType: 'basic' | 'premium' | 'special') => Promise<boolean>;
  playWithCharacter: (characterId: number, activityType: 'pet' | 'play' | 'walk') => Promise<boolean>;
  setActiveCharacter: (characterId: number) => Promise<boolean>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};

interface CharacterProviderProps {
  children: ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { userGameData } = useGame();
  const [characterShop, setCharacterShop] = useState<Character[]>([]);
  const [userCharacters, setUserCharacters] = useState<UserCharacter[]>([]);
  const [activeCharacter, setActiveCharacterState] = useState<UserCharacter | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCharacterShop = async () => {
    if (!user) return;

    try {
      const characters = await characterService.getCharacterShop();
      setCharacterShop(characters);
    } catch (error) {
      console.error('캐릭터 상점 로드 실패:', error);
    }
  };

  const loadUserCharacters = async () => {
    if (!user) {
      setUserCharacters([]);
      setActiveCharacterState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const characters = await characterService.getUserCharacters();
      setUserCharacters(characters);
      
      // 활성 캐릭터 찾기
      const active = characters.find(char => char.isActive);
      setActiveCharacterState(active || null);
    } catch (error) {
      console.error('사용자 캐릭터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCharacterShop = async () => {
    await loadCharacterShop();
  };

  const refreshUserCharacters = async () => {
    await loadUserCharacters();
  };

  const purchaseCharacter = async (characterId: number): Promise<boolean> => {
    if (!userGameData) return false;

    try {
      const purchasedCharacter = await characterService.purchaseCharacter(characterId);
      
      // 상점 캐릭터 목록 업데이트
      setCharacterShop(prev => 
        prev.map(char => 
          char.id === characterId 
            ? { ...char, isOwned: true }
            : char
        )
      );
      
      return true;
    } catch (error) {
      console.error('캐릭터 구매 실패:', error);
      return false;
    }
  };

  const adoptCharacter = async (characterId: number, nickname?: string): Promise<boolean> => {
    try {
      const adoptedCharacter = await characterService.adoptCharacter({
        characterId,
        nickname
      });
      
      // 사용자 캐릭터 목록 업데이트
      setUserCharacters(prev => [...prev, adoptedCharacter]);
      
      // 활성 캐릭터로 설정
      setActiveCharacterState(adoptedCharacter);
      
      return true;
    } catch (error) {
      console.error('캐릭터 입양 실패:', error);
      return false;
    }
  };

  const feedCharacter = async (characterId: number, foodType: 'basic' | 'premium' | 'special'): Promise<boolean> => {
    try {
      const result = await characterService.feedCharacter(characterId, { foodType });
      
      // 캐릭터 정보 업데이트
      setUserCharacters(prev => 
        prev.map(char => 
          char.id === characterId 
            ? { 
                ...char, 
                happiness: result.newHappiness,
                experience: result.newExperience
              }
            : char
        )
      );
      
      // 활성 캐릭터도 업데이트
      if (activeCharacter?.id === characterId) {
        setActiveCharacterState(prev => prev ? {
          ...prev,
          happiness: result.newHappiness,
          experience: result.newExperience
        } : null);
      }
      
      return true;
    } catch (error) {
      console.error('캐릭터 먹이 주기 실패:', error);
      return false;
    }
  };

  const playWithCharacter = async (characterId: number, activityType: 'pet' | 'play' | 'walk'): Promise<boolean> => {
    try {
      const result = await characterService.playWithCharacter(characterId, { activityType });
      
      // 캐릭터 정보 업데이트
      setUserCharacters(prev => 
        prev.map(char => 
          char.id === characterId 
            ? { 
                ...char, 
                happiness: result.newHappiness,
                experience: result.newExperience
              }
            : char
        )
      );
      
      // 활성 캐릭터도 업데이트
      if (activeCharacter?.id === characterId) {
        setActiveCharacterState(prev => prev ? {
          ...prev,
          happiness: result.newHappiness,
          experience: result.newExperience
        } : null);
      }
      
      return true;
    } catch (error) {
      console.error('캐릭터와 놀기 실패:', error);
      return false;
    }
  };

  const setActiveCharacter = async (characterId: number): Promise<boolean> => {
    try {
      const updatedCharacter = await characterService.updateUserCharacter(characterId, {
        isActive: true
      });
      
      // 모든 캐릭터의 활성 상태 업데이트
      setUserCharacters(prev => 
        prev.map(char => ({
          ...char,
          isActive: char.id === characterId
        }))
      );
      
      // 활성 캐릭터 설정
      setActiveCharacterState(updatedCharacter);
      
      return true;
    } catch (error) {
      console.error('활성 캐릭터 설정 실패:', error);
      return false;
    }
  };

  useEffect(() => {
    loadCharacterShop();
    loadUserCharacters();
  }, [user]);

  const value: CharacterContextType = {
    characterShop,
    userCharacters,
    activeCharacter,
    loading,
    refreshCharacterShop,
    refreshUserCharacters,
    purchaseCharacter,
    adoptCharacter,
    feedCharacter,
    playWithCharacter,
    setActiveCharacter,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}; 