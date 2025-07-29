export interface RoomItem {
  id: number;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomItemRequest {
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  imageUrl: string;
}

export interface PlacedItem {
  id: number;
  itemName: string;
  category: ItemCategory;
  posX: number;
  posY: number;
  rotation: number;
  imageUrl: string; // 백엔드에서 직접 제공
}

export interface UserRoom {
  userRoomId: number;
  items: PlacedItem[];
}

export interface PlaceItemRequest {
  posX: number;
  posY: number;
  rotation: number;
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

export enum ItemCategory {
  FURNITURE = 'FURNITURE',
  PLAYGROUND = 'PLAYGROUND',
  DECORATION = 'DECORATION',
  BACKGROUND = 'BACKGROUND',
  PROP = 'PROP',
}

export interface UserItem {
  id: number;
  userId: number;
  itemId: number;
  itemName: string;
  itemDescription: string;
  category: ItemCategory;
  imageUrl: string;
  placed: boolean;
  createdAt: string;
}

export interface UserItemRequest {
  itemId: number;
}
