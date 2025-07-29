import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserRoom } from '../types/room';
import { roomService } from '../services/roomService';
import { useAuth } from './AuthContext';

interface RoomContextType {
  userRoom: UserRoom | null;
  loading: boolean;
  refreshUserRoom: () => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userRoom, setUserRoom] = useState<UserRoom | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserRoom = useCallback(async () => {
    if (!user) {
      setUserRoom(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const roomData = await roomService.getUserRoom();
      setUserRoom(roomData);
    } catch (error: any) {
      console.error('방 데이터 로드 실패:', error);
      // TODO: 방 데이터가 없는 경우 초기 방 생성 API 호출 로직 추가
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshUserRoom = useCallback(async () => {
    await loadUserRoom();
  }, [loadUserRoom]);

  useEffect(() => {
    loadUserRoom();
  }, [user, loadUserRoom]);

  const value: RoomContextType = {
    userRoom,
    loading,
    refreshUserRoom,
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};