import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRoom, RoomItem, ShopItem } from '../types/room';
import roomService from '../services/roomService';
import { useAuth } from './AuthContext';
import { useGame } from './GameContext';

interface RoomContextType {
  userRoom: UserRoom | null;
  userItems: RoomItem[];
  shopItems: ShopItem[];
  loading: boolean;
  refreshRoom: () => Promise<void>;
  refreshShop: () => Promise<void>;
  purchaseItem: (itemId: number) => Promise<boolean>;
  placeItem: (itemId: number, position: { x: number; y: number }, rotation: number) => Promise<boolean>;
  removePlacedItem: (placedItemId: number) => Promise<boolean>;
  changeWallpaper: (wallpaperId: number) => Promise<boolean>;
  changeFloor: (floorId: number) => Promise<boolean>;
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
  const { userGameData } = useGame();
  const [userRoom, setUserRoom] = useState<UserRoom | null>(null);
  const [userItems, setUserItems] = useState<RoomItem[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoomData = async () => {
    if (!user) {
      setUserRoom(null);
      setUserItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const room = await roomService.getUserRoom();
      setUserRoom(room);
      
      const items = await roomService.getUserItems();
      setUserItems(items);
    } catch (error: any) {
      console.error('방 데이터 로드 실패:', error);
      
      // 방 데이터가 없는 경우 새로 생성
      if (error.response?.status === 404) {
        try {
          const newRoom = await roomService.createUserRoom();
          setUserRoom(newRoom);
          setUserItems([]);
        } catch (createError) {
          console.error('방 데이터 생성 실패:', createError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadShopData = async () => {
    if (!user) return;

    try {
      const items = await roomService.getShopItems();
      setShopItems(items);
    } catch (error) {
      console.error('상점 데이터 로드 실패:', error);
    }
  };

  const refreshRoom = async () => {
    await loadRoomData();
  };

  const refreshShop = async () => {
    await loadShopData();
  };

  const purchaseItem = async (itemId: number): Promise<boolean> => {
    if (!userGameData) return false;

    try {
      const purchasedItem = await roomService.purchaseItem(itemId);
      
      // 상점 아이템 목록 업데이트
      setShopItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, isOwned: true }
            : item
        )
      );
      
      // 사용자 아이템 목록 업데이트
      setUserItems(prev => [...prev, purchasedItem]);
      
      return true;
    } catch (error) {
      console.error('아이템 구매 실패:', error);
      return false;
    }
  };

  const placeItem = async (itemId: number, position: { x: number; y: number }, rotation: number): Promise<boolean> => {
    try {
      const placedItem = await roomService.placeItem({
        itemId,
        position,
        rotation
      });
      
      // 방 데이터 업데이트
      setUserRoom(prev => prev ? {
        ...prev,
        items: [...prev.items, placedItem]
      } : null);
      
      // 사용자 아이템 목록에서 배치 상태 업데이트
      setUserItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, isPlaced: true }
            : item
        )
      );
      
      return true;
    } catch (error) {
      console.error('아이템 배치 실패:', error);
      return false;
    }
  };

  const removePlacedItem = async (placedItemId: number): Promise<boolean> => {
    try {
      await roomService.removePlacedItem(placedItemId);
      
      // 방 데이터에서 아이템 제거
      setUserRoom(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => item.id !== placedItemId)
      } : null);
      
      return true;
    } catch (error) {
      console.error('아이템 제거 실패:', error);
      return false;
    }
  };

  const changeWallpaper = async (wallpaperId: number): Promise<boolean> => {
    try {
      const updatedRoom = await roomService.changeWallpaper(wallpaperId);
      setUserRoom(updatedRoom);
      return true;
    } catch (error) {
      console.error('벽지 변경 실패:', error);
      return false;
    }
  };

  const changeFloor = async (floorId: number): Promise<boolean> => {
    try {
      const updatedRoom = await roomService.changeFloor(floorId);
      setUserRoom(updatedRoom);
      return true;
    } catch (error) {
      console.error('바닥 변경 실패:', error);
      return false;
    }
  };

  useEffect(() => {
    loadRoomData();
    loadShopData();
  }, [user]);

  const value: RoomContextType = {
    userRoom,
    userItems,
    shopItems,
    loading,
    refreshRoom,
    refreshShop,
    purchaseItem,
    placeItem,
    removePlacedItem,
    changeWallpaper,
    changeFloor,
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}; 