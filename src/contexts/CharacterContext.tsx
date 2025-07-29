import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserCharacter, Character, CharacterRarity } from '../types/character';
import userCharacterService from '../services/userCharacterService';
import characterService from '../services/characterService';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

interface CharacterContextType {
  userCharacters: UserCharacter[];
  activeCharacter: UserCharacter | null;
  loading: boolean;
  refreshCharacters: () => Promise<void>;
  updateUserCharacterStatus: (userCharacterId: number, isActive: boolean, nickname?: string) => Promise<boolean>;
  purchaseCharacter: (characterId: number) => Promise<boolean>;
  feedCharacter: (userCharacterId: number) => Promise<boolean>;
  playWithCharacter: (userCharacterId: number) => Promise<boolean>;
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
  const [userCharacters, setUserCharacters] = useState<UserCharacter[]>([]);
  const [activeCharacter, setActiveCharacter] = useState<UserCharacter | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCharacters = useCallback(async () => {
    if (!user) {
      setUserCharacters([]);
      setActiveCharacter(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userCharResponse = await userCharacterService.getUserCharacters();
      const fetchedUserCharacters = userCharResponse.content;

      // 각 UserCharacter에 Character 상세 정보 주입
      const charactersWithDetails = await Promise.all(fetchedUserCharacters.map(async (uc) => {
        try {
          const charDetail = await characterService.getCharacter(uc.characterId);
          return { ...uc, character: charDetail };
        } catch (error) {
          console.error(`Failed to fetch details for character ${uc.characterId}:`, error);
          // Fallback character object to prevent ReferenceError
          return {
            ...uc,
            character: {
              id: uc.characterId,
              name: 'Unknown Character',
              description: 'Failed to load details',
              rarity: CharacterRarity.COMMON, // Default rarity
              price: 0,
              imageUrl: 'https://via.placeholder.com/60', // Placeholder image
              createdAt: new Date().toISOString(),
            },
          };
        }
      }));

      setUserCharacters(charactersWithDetails);
      const active = charactersWithDetails.find(char => char.isActive);
      setActiveCharacter(active || null);
    } catch (error) {
      console.error('캐릭터 데이터 로드 실패:', error);
      Alert.alert('오류', '캐릭터 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCharacters();
  }, [user, loadCharacters]);

  const refreshCharacters = async () => {
    await loadCharacters();
  };

  const updateUserCharacterStatus = async (userCharacterId: number, isActive: boolean, nickname?: string): Promise<boolean> => {
    try {
      await userCharacterService.updateUserCharacter(userCharacterId, { isActive, nickname });
      await refreshCharacters();
      return true;
    } catch (error: any) {
      console.error('캐릭터 상태 업데이트 실패:', error);
      const message = error.response?.data?.message || '캐릭터 상태 업데이트에 실패했습니다.';
      Alert.alert('오류', message);
      return false;
    }
  };

  const purchaseCharacter = async (characterId: number): Promise<boolean> => {
    try {
      await userCharacterService.purchaseCharacter(characterId);
      await refreshCharacters();
      return true;
    } catch (error: any) {
      console.error('캐릭터 구매 실패:', error);
      const message = error.response?.data?.message || '캐릭터 구매에 실패했습니다.';
      Alert.alert('오류', message);
      return false;
    }
  };

  const feedCharacter = async (userCharacterId: number): Promise<boolean> => {
    try {
      await userCharacterService.feedCharacter(userCharacterId);
      await refreshCharacters();
      return true;
    } catch (error: any) {
      console.error('먹이 주기 실패:', error);
      const message = error.response?.data?.message || '먹이 주기에 실패했습니다.';
      Alert.alert('오류', message);
      return false;
    }
  };

  const playWithCharacter = async (userCharacterId: number): Promise<boolean> => {
    try {
      await userCharacterService.playWithCharacter(userCharacterId);
      await refreshCharacters();
      return true;
    } catch (error: any) {
      console.error('놀아주기 실패:', error);
      const message = error.response?.data?.message || '놀아주기에 실패했습니다.';
      Alert.alert('오류', message);
      return false;
    }
  };

  const value: CharacterContextType = {
    userCharacters,
    activeCharacter,
    loading,
    refreshCharacters,
    updateUserCharacterStatus,
    purchaseCharacter,
    feedCharacter,
    playWithCharacter,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};
