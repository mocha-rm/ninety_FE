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
  placedItemId: number;
  roomItemId: number;
  x: number;
  y: number;
  rotation: number;
}

export interface UserRoom {
  userRoomId: number;
  items: PlacedItem[];
}

export interface PlaceItemRequest {
  roomItemId?: number; // Required for place, optional for move
  x: number;
  y: number;
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
  isPlaced: boolean;
  createdAt: string;
}

export interface UserItemRequest {
  itemId: number;
}
