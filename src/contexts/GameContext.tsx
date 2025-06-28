import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserGameData } from '../types/game';
import gameService from '../services/gameService';
import { useAuth } from './AuthContext';

interface GameContextType {
  userGameData: UserGameData | null;
  loading: boolean;
  refreshGameData: () => Promise<void>;
  earnCoins: (amount: number) => Promise<void>;
  earnExperience: (amount: number) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userGameData, setUserGameData] = useState<UserGameData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGameData = async () => {
    if (!user) {
      setUserGameData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const gameData = await gameService.getUserGameData();
      setUserGameData(gameData);
    } catch (error: any) {
      console.error('게임 데이터 로드 실패:', error);
      
      // 게임 데이터가 없는 경우 새로 생성
      if (error.response?.status === 404) {
        try {
          const newGameData = await gameService.createUserGameData();
          setUserGameData(newGameData);
        } catch (createError) {
          console.error('게임 데이터 생성 실패:', createError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshGameData = async () => {
    await loadGameData();
  };

  const earnCoins = async (amount: number) => {
    if (!userGameData) return;

    try {
      const updatedData = await gameService.updateUserGameData({
        coins: userGameData.coins + amount
      });
      setUserGameData(updatedData);
    } catch (error) {
      console.error('코인 획득 실패:', error);
    }
  };

  const earnExperience = async (amount: number) => {
    if (!userGameData) return;

    try {
      const newExperience = userGameData.experience + amount;
      const updatedData = await gameService.updateUserGameData({
        experience: newExperience
      });
      setUserGameData(updatedData);

      // 레벨업 체크
      const levelUpResult = await gameService.checkAndProcessLevelUp();
      if (levelUpResult.leveledUp) {
        setUserGameData(prev => prev ? {
          ...prev,
          level: levelUpResult.newLevel || prev.level,
          experience: levelUpResult.newExperience || prev.experience
        } : null);
      }
    } catch (error) {
      console.error('경험치 획득 실패:', error);
    }
  };

  useEffect(() => {
    loadGameData();
  }, [user]);

  const value: GameContextType = {
    userGameData,
    loading,
    refreshGameData,
    earnCoins,
    earnExperience,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 