export interface RoomItem {
  id: number;
  name: string;
  description: string;
  category: 'furniture' | 'decoration' | 'wallpaper' | 'floor';
  price: number;
  imageUrl?: string;
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  isOwned: boolean;
  isPlaced: boolean;
  createdAt: string;
}

export interface UserRoom {
  id: number;
  userId: number;
  wallpaperId?: number;
  floorId?: number;
  items: PlacedRoomItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PlacedRoomItem {
  id: number;
  itemId: number;
  userId: number;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  createdAt: string;
  item: RoomItem;
}

export interface CreatePlacedItemRequest {
  itemId: number;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
}

export interface UpdatePlacedItemRequest {
  position?: {
    x: number;
    y: number;
  };
  rotation?: number;
}

export interface ShopItem {
  id: number;
  name: string;
  description: string;
  category: 'furniture' | 'decoration' | 'wallpaper' | 'floor';
  price: number;
  imageUrl?: string;
  isOwned: boolean;
  isAvailable: boolean;
} 